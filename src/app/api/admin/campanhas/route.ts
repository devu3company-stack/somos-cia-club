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

        const campaigns = await prisma.prizeCampaign.findMany({
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { entries: true } } },
        })

        return NextResponse.json({ campaigns })
    } catch (error) {
        console.error('Admin campaigns error:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session || session.role !== 'admin') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const data = await req.json()

        await prisma.prizeCampaign.create({ data })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin create campaign error:', error)
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

        await prisma.prizeCampaign.update({ where: { id }, data })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Admin update campaign error:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
