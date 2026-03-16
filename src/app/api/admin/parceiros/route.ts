export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
    try {
        const session = await getSession()
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const partners = await prisma.partner.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true, nome_fantasia: true, cnpj: true, email: true,
                aprovado: true, categoria: true, limite_mensal: true, createdAt: true,
                _count: { select: { offers: true, couponRedemptions: true } },
            },
        })

        return NextResponse.json({ partners })
    } catch (error) {
        console.error('Admin partners error:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { id, ...data } = await req.json()

        await prisma.partner.update({ where: { id }, data })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin update partner error:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
