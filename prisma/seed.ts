import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Create Admin
    const adminPassword = await bcrypt.hash('admin123', 10)
    await prisma.admin.upsert({
        where: { email: 'admin@somoscia.com' },
        update: {},
        create: {
            nome: 'Administrador',
            email: 'admin@somoscia.com',
            senha: adminPassword,
        },
    })
    console.log('✅ Admin created')

    // Create Residents
    const residentPassword = await bcrypt.hash('123456', 10)
    const residents = [
        { nome: 'João Silva', email: 'joao@email.com', cpf: '111.222.333-44', unidade: 'Bloco A - Apt 101', pontos: 6500 },
        { nome: 'Maria Santos', email: 'maria@email.com', cpf: '222.333.444-55', unidade: 'Bloco A - Apt 202', pontos: 3200 },
        { nome: 'Carlos Oliveira', email: 'carlos@email.com', cpf: '333.444.555-66', unidade: 'Bloco B - Apt 301', pontos: 10500 },
        { nome: 'Ana Costa', email: 'ana@email.com', cpf: '444.555.666-77', unidade: 'Bloco B - Apt 402', pontos: 1800 },
        { nome: 'Pedro Lima', email: 'pedro@email.com', cpf: '555.666.777-88', unidade: 'Bloco C - Apt 103', pontos: 8900, inadimplente: true, dias_atraso: 20 },
    ]

    for (const r of residents) {
        await prisma.resident.upsert({
            where: { email: r.email },
            update: {},
            create: {
                ...r,
                senha: residentPassword,
                status: r.inadimplente ? 'inativo' : 'ativo',
                inadimplente: r.inadimplente || false,
                dias_atraso: r.dias_atraso || 0,
            },
        })
    }
    console.log('✅ Residents created')

    // Create Partners
    const partnerPassword = await bcrypt.hash('parceiro123', 10)
    const partners = [
        { nome_fantasia: 'Pizzaria Bella Napoli', cnpj: '11.222.333/0001-44', email: 'contato@bellanapoli.com', categoria: 'Alimentação', aprovado: true },
        { nome_fantasia: 'Farmácia Saúde+', cnpj: '22.333.444/0001-55', email: 'contato@saudemais.com', categoria: 'Saúde', aprovado: true },
        { nome_fantasia: 'Academia FitClub', cnpj: '33.444.555/0001-66', email: 'contato@fitclub.com', categoria: 'Esportes', aprovado: true },
        { nome_fantasia: 'Pet Shop Amigo Fiel', cnpj: '44.555.666/0001-77', email: 'contato@amigofiel.com', categoria: 'Pet', aprovado: true },
        { nome_fantasia: 'Salão Bella Hair', cnpj: '55.666.777/0001-88', email: 'contato@bellahair.com', categoria: 'Beleza', aprovado: true },
        { nome_fantasia: 'Auto Center Express', cnpj: '66.777.888/0001-99', email: 'contato@autoexpress.com', categoria: 'Automotivo', aprovado: false },
    ]

    for (const p of partners) {
        await prisma.partner.upsert({
            where: { email: p.email },
            update: {},
            create: {
                ...p,
                senha: partnerPassword,
            },
        })
    }
    console.log('✅ Partners created')

    // Get created partners for offers
    const allPartners = await prisma.partner.findMany({ where: { aprovado: true } })

    // Create Offers
    const offers = [
        { partnerId: allPartners[0]?.id, titulo: '10% OFF em qualquer pizza', descricao: 'Desconto válido para pedidos no balcão e delivery', desconto: '10%' },
        { partnerId: allPartners[0]?.id, titulo: 'Pizza doce grátis', descricao: 'Na compra de 2 pizzas grandes, ganhe 1 pizza doce', desconto: 'Grátis' },
        { partnerId: allPartners[1]?.id, titulo: '15% em medicamentos', descricao: 'Desconto em toda linha de medicamentos genéricos', desconto: '15%' },
        { partnerId: allPartners[2]?.id, titulo: 'Primeira semana grátis', descricao: 'Experimente nossa academia por 7 dias sem custo', desconto: 'Grátis' },
        { partnerId: allPartners[2]?.id, titulo: '20% no plano anual', descricao: 'Matricule-se no plano anual com desconto especial', desconto: '20%' },
        { partnerId: allPartners[3]?.id, titulo: 'Banho + Tosa com 10% OFF', descricao: 'Para cães de todos os portes', desconto: '10%' },
        { partnerId: allPartners[4]?.id, titulo: 'Corte + Escova por R$49,90', descricao: 'Preço especial para moradores do condomínio', desconto: 'R$49,90' },
    ]

    for (const o of offers) {
        if (o.partnerId) {
            await prisma.offer.create({ data: o })
        }
    }
    console.log('✅ Offers created')

    // Create Prize Campaigns
    const campaigns = [
        { titulo: 'Patinete Elétrico', descricao: 'Concorra a um patinete elétrico Xiaomi!', pontos_minimos: 10000 },
        { titulo: 'Vale Compras R$500', descricao: 'Vale compras em qualquer loja do shopping', pontos_minimos: 5000 },
        { titulo: 'Smart Watch', descricao: 'Relógio inteligente Samsung Galaxy Watch', pontos_minimos: 8000 },
        { titulo: 'Jantar para 2', descricao: 'Jantar especial em restaurante parceiro', pontos_minimos: 3000 },
    ]

    for (const c of campaigns) {
        await prisma.prizeCampaign.create({ data: c })
    }
    console.log('✅ Prize Campaigns created')

    // Create some wallet transactions
    const allResidents = await prisma.resident.findMany()
    for (const resident of allResidents.slice(0, 3)) {
        const transactions = [
            { tipo: 'credito', pontos: 500, motivo: 'Pagamento em dia - Janeiro/2026' },
            { tipo: 'credito', pontos: 500, motivo: 'Pagamento em dia - Fevereiro/2026' },
            { tipo: 'credito', pontos: 1000, motivo: 'Bônus de cadastro' },
        ]
        for (const t of transactions) {
            await prisma.walletTransaction.create({
                data: {
                    ...t,
                    residentId: resident.id,
                    data: new Date(),
                },
            })
        }
    }
    console.log('✅ Wallet Transactions created')

    console.log('🎉 Seed completed!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
