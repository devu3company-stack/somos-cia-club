// Simulated condominium API integration
// Replace with actual API calls when deploying

export interface CondominioStatus {
    status: 'ativo' | 'inativo'
    inadimplente: boolean
    dias_atraso: number
    nome: string
    unidade: string
}

export async function verificarStatusCondominio(cpf: string): Promise<CondominioStatus> {
    // In production, this would call the actual condominium API:
    // const response = await fetch(`${process.env.CONDOMINIO_API_URL}/moradores/status`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.CONDOMINIO_API_KEY}`,
    //   },
    //   body: JSON.stringify({ cpf }),
    // })
    // return response.json()

    // Simulated response for development
    const mockData: Record<string, CondominioStatus> = {
        '111.222.333-44': { status: 'ativo', inadimplente: false, dias_atraso: 0, nome: 'João Silva', unidade: 'Bloco A - Apt 101' },
        '222.333.444-55': { status: 'ativo', inadimplente: false, dias_atraso: 0, nome: 'Maria Santos', unidade: 'Bloco A - Apt 202' },
        '333.444.555-66': { status: 'ativo', inadimplente: false, dias_atraso: 0, nome: 'Carlos Oliveira', unidade: 'Bloco B - Apt 301' },
        '444.555.666-77': { status: 'ativo', inadimplente: false, dias_atraso: 0, nome: 'Ana Costa', unidade: 'Bloco B - Apt 402' },
        '555.666.777-88': { status: 'ativo', inadimplente: true, dias_atraso: 20, nome: 'Pedro Lima', unidade: 'Bloco C - Apt 103' },
    }

    return mockData[cpf] || { status: 'inativo', inadimplente: false, dias_atraso: 0, nome: '', unidade: '' }
}

export async function processarWebhookPagamento(data: {
    cpf: string
    valor: number
    data_pagamento: string
    data_vencimento: string
    pago_em_dia: boolean
}): Promise<{ pontos: number; tipo: string }> {
    if (data.pago_em_dia) {
        return { pontos: 500, tipo: 'credito' }
    }
    return { pontos: 0, tipo: 'nenhum' }
}
