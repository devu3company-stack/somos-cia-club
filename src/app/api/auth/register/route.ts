import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { nome, email, cpf, unidade, senha } = body

        if (!nome || !email || !cpf || !unidade || !senha) {
            return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
        }

        // Check if already exists
        const existing = await prisma.resident.findFirst({
            where: { OR: [{ email }, { cpf }] },
        })
        if (existing) {
            return NextResponse.json({ error: 'Email ou CPF já cadastrado' }, { status: 409 })
        }

        const hashedPassword = await bcrypt.hash(senha, 10)

        await prisma.resident.create({
            data: {
                nome,
                email,
                cpf,
                unidade,
                senha: hashedPassword,
                status: 'ativo',
                pontos: 1000, // bonus de cadastro
            },
        })

        // Create welcome bonus transaction
        const resident = await prisma.resident.findUnique({ where: { email } })
        if (resident) {
            await prisma.walletTransaction.create({
                data: {
                    residentId: resident.id,
                    tipo: 'credito',
                    pontos: 1000,
                    motivo: 'Bônus de boas-vindas',
                    data: new Date(),
                },
            })
        }

        return NextResponse.json({ success: true, message: 'Cadastro realizado com sucesso!' })
    } catch (error) {
        console.error('Register error:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}
