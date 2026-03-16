import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
    try {
        const session = await getSession()
        if (!session || session.role !== 'partner') {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { codigo } = await req.json()
        if (!codigo) {
            return NextResponse.json({ error: 'Código do cupom é obrigatório' }, { status: 400 })
        }

        const redemption = await prisma.couponRedemption.findUnique({
            where: { codigo },
            include: {
                resident: { select: { nome: true, unidade: true } },
                partner: { select: { nome_fantasia: true } },
            },
        })

        if (!redemption) {
            return NextResponse.json({ error: 'Cupom não encontrado', valid: false }, { status: 404 })
        }

        if (redemption.partnerId !== session.id) {
            return NextResponse.json({ error: 'Este cupom não pertence a este parceiro', valid: false }, { status: 403 })
        }

        return NextResponse.json({
            valid: true,
            cupom: {
                codigo: redemption.codigo,
                morador: redemption.resident.nome,
                unidade: redemption.resident.unidade,
                resgatado_em: redemption.usado_em,
                mes_ano: redemption.mes_ano,
            },
        })
    } catch (error) {
        console.error('Validate coupon error:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
