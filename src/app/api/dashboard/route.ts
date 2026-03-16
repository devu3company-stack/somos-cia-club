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
            select: {
                id: true,
                nome: true,
                email: true,
                cpf: true,
                unidade: true,
                status: true,
                inadimplente: true,
                dias_atraso: true,
                pontos: true,
            },
        })

        // Get recent redemptions
        const recentCoupons = await prisma.couponRedemption.findMany({
            where: { residentId: session.id },
            include: { partner: { select: { nome_fantasia: true } } },
            orderBy: { usado_em: 'desc' },
            take: 5,
        })

        // Get active campaigns count
        const activeCampaigns = await prisma.prizeCampaign.count({ where: { ativo: true } })

        return NextResponse.json({
            resident,
            recentCoupons,
            activeCampaigns,
        })
    } catch (error) {
        console.error('Dashboard error:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
