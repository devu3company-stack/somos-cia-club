export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET: List active campaigns
export async function GET() {
    try {
        const session = await getSession()
        if (!session || session.role !== 'resident') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const resident = await prisma.resident.findUnique({
            where: { id: session.id },
            select: { pontos: true, id: true },
        })

        const campaigns = await prisma.prizeCampaign.findMany({
            where: { ativo: true },
            include: {
                entries: { where: { residentId: session.id } },
                _count: { select: { entries: true } },
            },
        })

        const campaignsWithStatus = campaigns.map(c => ({
            id: c.id,
            titulo: c.titulo,
            descricao: c.descricao,
            pontos_minimos: c.pontos_minimos,
            image_url: c.image_url,
            total_participantes: c._count.entries,
            ja_participou: c.entries.length > 0,
            pode_participar: (resident?.pontos || 0) >= c.pontos_minimos && c.entries.length === 0,
            pontos_usuario: resident?.pontos || 0,
        }))

        return NextResponse.json({ campaigns: campaignsWithStatus, pontos: resident?.pontos || 0 })
    } catch (error) {
        console.error('Prizes error:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}

// POST: Enter a campaign
export async function POST(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session || session.role !== 'resident') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { campaignId } = await req.json()

        const campaign = await prisma.prizeCampaign.findUnique({ where: { id: campaignId } })
        if (!campaign) return NextResponse.json({ error: 'Campanha não encontrada' }, { status: 404 })
        if (!campaign.ativo) return NextResponse.json({ error: 'Campanha encerrada' }, { status: 400 })

        const resident = await prisma.resident.findUnique({ where: { id: session.id } })
        if (!resident) return NextResponse.json({ error: 'Morador não encontrado' }, { status: 404 })
        if (resident.pontos < campaign.pontos_minimos) {
            return NextResponse.json({ error: 'Pontos insuficientes' }, { status: 400 })
        }

        // Check if already entered
        const existing = await prisma.campaignEntry.findFirst({
            where: { campaignId, residentId: session.id },
        })
        if (existing) return NextResponse.json({ error: 'Você já participa desta campanha' }, { status: 409 })

        // Create entry (optional: deduct points)
        await prisma.campaignEntry.create({
            data: { campaignId, residentId: session.id },
        })

        return NextResponse.json({ success: true, message: 'Inscrição realizada com sucesso!' })
    } catch (error) {
        console.error('Prize entry error:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
