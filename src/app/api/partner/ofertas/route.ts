import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
    try {
        const session = await getSession()
        if (!session || session.role !== 'partner') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const offers = await prisma.offer.findMany({
            where: { partnerId: session.id },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json({ offers })
    } catch (error) {
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session || session.role !== 'partner') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const data = await req.json()

        await prisma.offer.create({
            data: { ...data, partnerId: session.id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session || session.role !== 'partner') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { id, ...data } = await req.json()

        // Verify ownership
        const offer = await prisma.offer.findUnique({ where: { id } })
        if (!offer || offer.partnerId !== session.id) {
            return NextResponse.json({ error: 'Oferta não encontrada' }, { status: 404 })
        }

        await prisma.offer.update({ where: { id }, data })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
