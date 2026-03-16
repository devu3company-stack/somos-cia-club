import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET: List available offers for resident
export async function GET() {
    try {
        const session = await getSession()
        if (!session || session.role !== 'resident') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const now = new Date()
        const mesAno = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

        // Get all active offers with partner info
        const offers = await prisma.offer.findMany({
            where: { ativo: true, partner: { aprovado: true } },
            include: { partner: { select: { id: true, nome_fantasia: true, categoria: true, logo_url: true } } },
        })

        // Get this month's redemptions for this resident
        const redemptions = await prisma.couponRedemption.findMany({
            where: { residentId: session.id, mes_ano: mesAno },
        })
        const redeemedPartnerIds = new Set(redemptions.map(r => r.partnerId))

        // Get resident's inadimplente status
        const resident = await prisma.resident.findUnique({
            where: { id: session.id },
            select: { inadimplente: true, dias_atraso: true },
        })

        const offersWithStatus = offers.map(offer => ({
            ...offer,
            ja_resgatou: redeemedPartnerIds.has(offer.partnerId),
            pode_resgatar: !resident?.inadimplente && !redeemedPartnerIds.has(offer.partnerId),
        }))

        return NextResponse.json({ offers: offersWithStatus, inadimplente: resident?.inadimplente })
    } catch (error) {
        console.error('Offers error:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}

// POST: Redeem a coupon
export async function POST(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session || session.role !== 'resident') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { offerId } = await req.json()

        // Get the offer
        const offer = await prisma.offer.findUnique({
            where: { id: offerId },
            include: { partner: true },
        })
        if (!offer) return NextResponse.json({ error: 'Oferta não encontrada' }, { status: 404 })

        // Check resident status
        const resident = await prisma.resident.findUnique({ where: { id: session.id } })
        if (!resident) return NextResponse.json({ error: 'Morador não encontrado' }, { status: 404 })
        if (resident.inadimplente) return NextResponse.json({ error: 'Não é possível resgatar cupons em situação de inadimplência' }, { status: 403 })

        // Check monthly limit
        const now = new Date()
        const mesAno = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

        const existing = await prisma.couponRedemption.findFirst({
            where: { residentId: session.id, partnerId: offer.partnerId, mes_ano: mesAno },
        })
        if (existing) {
            return NextResponse.json({ error: 'Você já resgatou um cupom deste parceiro este mês' }, { status: 409 })
        }

        // Create redemption
        const redemption = await prisma.couponRedemption.create({
            data: {
                residentId: session.id,
                partnerId: offer.partnerId,
                mes_ano: mesAno,
            },
        })

        return NextResponse.json({
            success: true,
            codigo: redemption.codigo,
            oferta: offer.titulo,
            desconto: offer.desconto,
            parceiro: offer.partner.nome_fantasia,
        })
    } catch (error) {
        console.error('Coupon redeem error:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
