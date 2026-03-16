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

        const [totalResidents, activeResidents, inadimplentes, totalPartners, approvedPartners, pendingPartners, totalCoupons, totalTransactions, activeCampaigns] = await Promise.all([
            prisma.resident.count(),
            prisma.resident.count({ where: { status: 'ativo' } }),
            prisma.resident.count({ where: { inadimplente: true } }),
            prisma.partner.count(),
            prisma.partner.count({ where: { aprovado: true } }),
            prisma.partner.count({ where: { aprovado: false } }),
            prisma.couponRedemption.count(),
            prisma.walletTransaction.count(),
            prisma.prizeCampaign.count({ where: { ativo: true } }),
        ])

        // Recent activity
        const recentCoupons = await prisma.couponRedemption.findMany({
            include: {
                resident: { select: { nome: true, unidade: true } },
                partner: { select: { nome_fantasia: true } },
            },
            orderBy: { usado_em: 'desc' },
            take: 10,
        })

        return NextResponse.json({
            stats: {
                totalResidents,
                activeResidents,
                inadimplentes,
                totalPartners,
                approvedPartners,
                pendingPartners,
                totalCoupons,
                totalTransactions,
                activeCampaigns,
            },
            recentCoupons,
        })
    } catch (error) {
        console.error('Admin dashboard error:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
