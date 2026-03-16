export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
    try {
        // Check if already seeded
        const adminCount = await prisma.admin.count()
        if (adminCount > 0) {
            return NextResponse.json({ message: 'Database already seeded', seeded: false })
        }

        const adminPassword = await bcrypt.hash('admin123', 10)
        await prisma.admin.create({
            data: { nome: 'Administrador', email: 'admin@somoscia.com', senha: adminPassword },
        })

        const residentPassword = await bcrypt.hash('123456', 10)
        const residents = [
            { nome: 'João Silva', email: 'joao@email.com', cpf: '111.222.333-44', unidade: 'Bloco A - Apt 101', pontos: 6500 },
            { nome: 'Maria Santos', email: 'maria@email.com', cpf: '222.333.444-55', unidade: 'Bloco A - Apt 202', pontos: 3200 },
            { nome: 'Carlos Oliveira', email: 'carlos@email.com', cpf: '333.444.555-66', unidade: 'Bloco B - Apt 301', pontos: 10500 },
            { nome: 'Ana Costa', email: 'ana@email.com', cpf: '444.555.666-77', unidade: 'Bloco B - Apt 402', pontos: 1800 },
            { nome: 'Pedro Lima', email: 'pedro@email.com', cpf: '555.666.777-88', unidade: 'Bloco C - Apt 103', pontos: 0, inadimplente: true, dias_atraso: 20 },
        ]

        for (const r of residents) {
            const created = await prisma.resident.create({
                data: {
                    nome: r.nome, email: r.email, cpf: r.cpf, unidade: r.unidade,
                    senha: residentPassword, pontos: r.pontos,
                    status: (r as Record<string, unknown>).inadimplente ? 'inativo' : 'ativo',
                    inadimplente: (r as Record<string, unknown>).inadimplente as boolean || false,
                    dias_atraso: (r as Record<string, unknown>).dias_atraso as number || 0,
                },
            })

            // Create wallet transactions
            if (r.pontos > 0) {
                await prisma.walletTransaction.create({
                    data: { residentId: created.id, tipo: 'credito', pontos: 1000, motivo: 'Bônus de cadastro', data: new Date() },
                })
                await prisma.walletTransaction.create({
                    data: { residentId: created.id, tipo: 'credito', pontos: 500, motivo: 'Pagamento em dia - Jan/2026', data: new Date('2026-01-15') },
                })
                await prisma.walletTransaction.create({
                    data: { residentId: created.id, tipo: 'credito', pontos: 500, motivo: 'Pagamento em dia - Fev/2026', data: new Date('2026-02-15') },
                })
            }
        }

        const partnerPassword = await bcrypt.hash('parceiro123', 10)
        const partners = [
            { nome_fantasia: 'Pizzaria Bella Napoli', cnpj: '11.222.333/0001-44', email: 'contato@bellanapoli.com', categoria: 'Alimentação', aprovado: true },
            { nome_fantasia: 'Farmácia Saúde+', cnpj: '22.333.444/0001-55', email: 'contato@saudemais.com', categoria: 'Saúde', aprovado: true },
            { nome_fantasia: 'Academia FitClub', cnpj: '33.444.555/0001-66', email: 'contato@fitclub.com', categoria: 'Esportes', aprovado: true },
            { nome_fantasia: 'Pet Shop Amigo Fiel', cnpj: '44.555.666/0001-77', email: 'contato@amigofiel.com', categoria: 'Pet', aprovado: true },
            { nome_fantasia: 'Salão Bella Hair', cnpj: '55.666.777/0001-88', email: 'contato@bellahair.com', categoria: 'Beleza', aprovado: true },
            { nome_fantasia: 'Auto Center Express', cnpj: '66.777.888/0001-99', email: 'contato@autoexpress.com', categoria: 'Automotivo', aprovado: false },
        ]

        const createdPartners = []
        for (const p of partners) {
            const created = await prisma.partner.create({
                data: { ...p, senha: partnerPassword },
            })
            createdPartners.push(created)
        }

        const offers = [
            { partnerId: createdPartners[0].id, titulo: '10% OFF em qualquer pizza', descricao: 'Desconto válido para pedidos no balcão e delivery', desconto: '10%' },
            { partnerId: createdPartners[0].id, titulo: 'Pizza doce grátis', descricao: 'Na compra de 2 pizzas grandes, ganhe 1 pizza doce', desconto: 'Grátis' },
            { partnerId: createdPartners[1].id, titulo: '15% em medicamentos', descricao: 'Desconto em toda linha de medicamentos genéricos', desconto: '15%' },
            { partnerId: createdPartners[2].id, titulo: 'Primeira semana grátis', descricao: 'Experimente nossa academia por 7 dias sem custo', desconto: 'Grátis' },
            { partnerId: createdPartners[2].id, titulo: '20% no plano anual', descricao: 'Matricule-se no plano anual com desconto especial', desconto: '20%' },
            { partnerId: createdPartners[3].id, titulo: 'Banho + Tosa com 10% OFF', descricao: 'Para cães de todos os portes', desconto: '10%' },
            { partnerId: createdPartners[4].id, titulo: 'Corte + Escova por R$49,90', descricao: 'Preço especial para moradores do condomínio', desconto: 'R$49,90' },
        ]

        for (const o of offers) {
            await prisma.offer.create({ data: { ...o, ativo: true } })
        }

        const campaigns = [
            { titulo: 'Patinete Elétrico', descricao: 'Concorra a um patinete elétrico Xiaomi!', pontos_minimos: 10000 },
            { titulo: 'Vale Compras R$500', descricao: 'Vale compras em qualquer loja do shopping', pontos_minimos: 5000 },
            { titulo: 'Smart Watch', descricao: 'Relógio inteligente Samsung Galaxy Watch', pontos_minimos: 8000 },
            { titulo: 'Jantar para 2', descricao: 'Jantar especial em restaurante parceiro', pontos_minimos: 3000 },
        ]

        for (const c of campaigns) {
            await prisma.prizeCampaign.create({ data: { ...c, ativo: true } })
        }

        return NextResponse.json({ message: '🎉 Database seeded successfully!', seeded: true })
    } catch (error) {
        console.error('Seed error:', error)
        return NextResponse.json({ error: 'Seed failed', details: String(error) }, { status: 500 })
    }
}
