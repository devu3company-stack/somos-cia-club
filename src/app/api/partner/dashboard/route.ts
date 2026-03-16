import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET: Partner dashboard stats
export async function GET() {
    try {
        const session = await getSession()
        if (!session || session.role !== 'partner') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const partner = await prisma.partner.findUnique({
            where: { id: session.id },
            include: {
                offers: true,
                couponRedemptions: {
                    include: { resident: { select: { nome: true, unidade: true } } },
                    orderBy: { usado_em: 'desc' },
                    take: 20,
                },
                _count: { select: { offers: true, couponRedemptions: true } },
            },
        })

        // Monthly stats
        const now = new Date()
        const mesAno = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        const thisMonthRedemptions = await prisma.couponRedemption.count({
            where: { partnerId: session.id, mes_ano: mesAno },
        })

        return NextResponse.json({
            partner: {
                nome_fantasia: partner?.nome_fantasia,
                categoria: partner?.categoria,
                aprovado: partner?.aprovado,
            },
            offers: partner?.offers || [],
            recentRedemptions: partner?.couponRedemptions || [],
            stats: {
                totalOffers: partner?._count.offers || 0,
                totalRedemptions: partner?._count.couponRedemptions || 0,
                thisMonthRedemptions,
            },
        })
    } catch (error) {
        console.error('Partner dashboard error:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
