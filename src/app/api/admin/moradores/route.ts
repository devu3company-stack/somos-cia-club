import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
    try {
        const session = await getSession()
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const residents = await prisma.resident.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true, nome: true, email: true, cpf: true, unidade: true,
                status: true, inadimplente: true, dias_atraso: true, pontos: true,
                createdAt: true,
                _count: { select: { couponRedemptions: true, walletTransactions: true } },
            },
        })

        return NextResponse.json({ residents })
    } catch (error) {
        console.error('Admin residents error:', error)
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

        await prisma.resident.update({ where: { id }, data })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin update resident error:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
