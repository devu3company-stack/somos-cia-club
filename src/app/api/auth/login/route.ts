import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createToken } from '@/lib/auth'
import { verificarStatusCondominio } from '@/lib/condominio-api'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { cpf, senha, tipo } = body

        if (tipo === 'admin') {
            const admin = await prisma.admin.findUnique({ where: { email: cpf } })
            if (!admin) return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })

            const validPassword = await bcrypt.compare(senha, admin.senha)
            if (!validPassword) return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })

            const token = await createToken({ id: admin.id, email: admin.email, nome: admin.nome, role: 'admin' })

            const response = NextResponse.json({ success: true, role: 'admin', redirect: '/admin/dashboard' })
            response.cookies.set('session', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7,
                path: '/',
            })
            return response
        }

        if (tipo === 'partner') {
            const partner = await prisma.partner.findFirst({ where: { OR: [{ email: cpf }, { cnpj: cpf }] } })
            if (!partner) return NextResponse.json({ error: 'Parceiro não encontrado' }, { status: 401 })

            const validPassword = await bcrypt.compare(senha, partner.senha)
            if (!validPassword) return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })

            if (!partner.aprovado) return NextResponse.json({ error: 'Cadastro ainda não aprovado' }, { status: 403 })

            const token = await createToken({ id: partner.id, email: partner.email, nome: partner.nome_fantasia, role: 'partner' })

            const response = NextResponse.json({ success: true, role: 'partner', redirect: '/partner/dashboard' })
            response.cookies.set('session', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7,
                path: '/',
            })
            return response
        }

        // Default: Resident login
        const resident = await prisma.resident.findFirst({ where: { OR: [{ cpf }, { email: cpf }] } })
        if (!resident) return NextResponse.json({ error: 'Morador não encontrado' }, { status: 401 })

        const validPassword = await bcrypt.compare(senha, resident.senha)
        if (!validPassword) return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 })

        // Verify status with condominium API
        const condominioStatus = await verificarStatusCondominio(resident.cpf)

        // Update resident status
        const updateData: Record<string, unknown> = {
            status: condominioStatus.status,
            inadimplente: condominioStatus.inadimplente,
            dias_atraso: condominioStatus.dias_atraso,
            ultimo_login_verificado: new Date(),
        }

        // If dias_atraso >= 15, reset points
        if (condominioStatus.dias_atraso >= 15) {
            // Only reset if they currently have points
            if (resident.pontos > 0) {
                updateData.pontos = 0
                // Create reset transaction
                await prisma.walletTransaction.create({
                    data: {
                        residentId: resident.id,
                        tipo: 'reset',
                        pontos: resident.pontos,
                        motivo: `Reset automático - ${condominioStatus.dias_atraso} dias de atraso`,
                        data: new Date(),
                    },
                })
            }
        }

        await prisma.resident.update({
            where: { id: resident.id },
            data: updateData,
        })

        if (condominioStatus.status === 'inativo') {
            return NextResponse.json({ error: 'Seu cadastro está inativo. Entre em contato com a administração.' }, { status: 403 })
        }

        const token = await createToken({ id: resident.id, email: resident.email, nome: resident.nome, role: 'resident' })

        const response = NextResponse.json({
            success: true,
            role: 'resident',
            redirect: '/dashboard',
            inadimplente: condominioStatus.inadimplente,
        })
        response.cookies.set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        })
        return response
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}
