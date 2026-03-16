import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { processarWebhookPagamento } from '@/lib/condominio-api'

// Webhook endpoint for condominium payment processing
export async function POST(req: NextRequest) {
    try {
        // In production, validate webhook signature
        // const signature = req.headers.get('x-webhook-signature')

        const data = await req.json()
        const { cpf, valor, data_pagamento, data_vencimento, pago_em_dia } = data

        if (!cpf) {
            return NextResponse.json({ error: 'CPF é obrigatório' }, { status: 400 })
        }

        const resident = await prisma.resident.findUnique({ where: { cpf } })
        if (!resident) {
            return NextResponse.json({ error: 'Morador não encontrado' }, { status: 404 })
        }

        const result = await processarWebhookPagamento({
            cpf,
            valor,
            data_pagamento,
            data_vencimento,
            pago_em_dia,
        })

        if (result.pontos > 0) {
            // Credit points
            await prisma.resident.update({
                where: { id: resident.id },
                data: { pontos: { increment: result.pontos }, inadimplente: false, dias_atraso: 0 },
            })

            await prisma.walletTransaction.create({
                data: {
                    residentId: resident.id,
                    tipo: 'credito',
                    pontos: result.pontos,
                    motivo: `Pagamento em dia - ${data_pagamento}`,
                    data: new Date(),
                },
            })
        } else {
            // Late payment - update status but no points
            await prisma.resident.update({
                where: { id: resident.id },
                data: { inadimplente: !pago_em_dia },
            })
        }

        return NextResponse.json({ success: true, pontos_creditados: result.pontos })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
