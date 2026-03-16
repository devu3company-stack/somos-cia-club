export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
    try {
        const session = await getSession()
        if (!session || session.role !== 'resident') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const resident = await prisma.resident.findUnique({
            where: { id: session.id },
            select: { pontos: true, inadimplente: true, dias_atraso: true },
        })

        const transactions = await prisma.walletTransaction.findMany({
            where: { residentId: session.id },
            orderBy: { data: 'desc' },
            take: 50,
        })

        // Calculate monthly totals for chart
        const monthlyData: Record<string, number> = {}
        transactions.forEach(t => {
            const month = t.data.toISOString().slice(0, 7)
            if (!monthlyData[month]) monthlyData[month] = 0
            if (t.tipo === 'credito') monthlyData[month] += t.pontos
            else if (t.tipo === 'debito' || t.tipo === 'reset') monthlyData[month] -= t.pontos
        })

        return NextResponse.json({
            saldo: resident?.pontos || 0,
            inadimplente: resident?.inadimplente,
            dias_atraso: resident?.dias_atraso,
            transacoes: transactions,
            evolucao: monthlyData,
        })
    } catch (error) {
        console.error('Wallet error:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
