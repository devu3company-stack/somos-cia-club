'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'

interface WalletData {
    saldo: number
    inadimplente: boolean
    dias_atraso: number
    transacoes: Array<{
        id: string
        tipo: string
        pontos: number
        motivo: string
        data: string
    }>
    evolucao: Record<string, number>
}

export default function CarteiraPage() {
    const [data, setData] = useState<WalletData | null>(null)
    const [userName, setUserName] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [walletRes, sessionRes] = await Promise.all([
                    fetch('/api/carteira'),
                    fetch('/api/auth/session'),
                ])
                const walletData = await walletRes.json()
                const sessionData = await sessionRes.json()
                setData(walletData)
                setUserName(sessionData.user?.nome || '')
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="app-layout">
                <Sidebar role="resident" userName="" />
                <main className="main-content">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                        <div className="spinner"></div>
                    </div>
                </main>
            </div>
        )
    }

    const maxValue = Math.max(...Object.values(data?.evolucao || { '': 1 }), 1)

    return (
        <div className="app-layout">
            <Sidebar role="resident" userName={userName} />
            <main className="main-content">
                <div className="page-header animate-fade-in">
                    <h1>💳 Minha Carteira</h1>
                    <p>Acompanhe seus pontos e transações</p>
                </div>

                {/* Balance Card */}
                <div className="wallet-hero animate-fade-in">
                    <div className="wallet-balance-label">Saldo disponível</div>
                    <div className="wallet-balance">
                        {data?.saldo?.toLocaleString('pt-BR')} <span>pts</span>
                    </div>
                    {data?.inadimplente && (
                        <div style={{ marginTop: 16, padding: '8px 16px', background: 'rgba(255,61,113,0.2)', borderRadius: 'var(--radius-md)', fontSize: 13 }}>
                            ⚠️ Regularize sua situação para continuar acumulando pontos
                        </div>
                    )}
                </div>

                {/* Chart */}
                {data?.evolucao && Object.keys(data.evolucao).length > 0 && (
                    <div className="chart-container animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <h3 style={{ marginBottom: 20, fontSize: 16 }}>📈 Evolução dos Pontos</h3>
                        <div className="chart-bars">
                            {Object.entries(data.evolucao).slice(-6).map(([month, value]) => (
                                <div key={month} className="chart-bar-wrapper">
                                    <div className="chart-bar-value">{value > 0 ? `+${value}` : value}</div>
                                    <div
                                        className="chart-bar"
                                        style={{
                                            height: `${Math.max((Math.abs(value) / maxValue) * 100, 5)}%`,
                                            background: value >= 0 ? 'var(--accent-gradient)' : 'var(--danger)',
                                        }}
                                    />
                                    <div className="chart-bar-label">{month.slice(5)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Transactions */}
                <div className="card animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <h3 style={{ marginBottom: 20, fontSize: 16 }}>📋 Extrato</h3>
                    {data?.transacoes && data.transacoes.length > 0 ? (
                        <div className="transaction-list">
                            {data.transacoes.map((t) => (
                                <div key={t.id} className="transaction-item">
                                    <div className="transaction-info">
                                        <div className={`transaction-icon ${t.tipo}`}>
                                            {t.tipo === 'credito' ? '⬆' : t.tipo === 'debito' ? '⬇' : '🔄'}
                                        </div>
                                        <div className="transaction-details">
                                            <h4>{t.motivo}</h4>
                                            <p>{new Date(t.data).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                    </div>
                                    <div className={`transaction-amount ${t.tipo === 'credito' ? 'positive' : 'negative'}`}>
                                        {t.tipo === 'credito' ? '+' : '-'}{t.pontos.toLocaleString('pt-BR')} pts
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">📋</div>
                            <h3>Nenhuma transação</h3>
                            <p>Suas transações de pontos aparecerão aqui.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
