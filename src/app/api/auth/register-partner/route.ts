import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { nome_fantasia, cnpj, email, categoria, senha } = body

        if (!nome_fantasia || !cnpj || !email || !categoria || !senha) {
            return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
        }

        const existing = await prisma.partner.findFirst({
            where: { OR: [{ email }, { cnpj }] },
        })
        if (existing) {
            return NextResponse.json({ error: 'Email ou CNPJ já cadastrado' }, { status: 409 })
        }

        const hashedPassword = await bcrypt.hash(senha, 10)

        await prisma.partner.create({
            data: {
                nome_fantasia,
                cnpj,
                email,
                categoria,
                senha: hashedPassword,
                aprovado: false,
            },
        })

        return NextResponse.json({ success: true, message: 'Cadastro enviado para aprovação!' })
    } catch (error) {
        console.error('Partner register error:', error)
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
    }
}
