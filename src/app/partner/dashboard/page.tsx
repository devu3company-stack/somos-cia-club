'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'

export default function PartnerDashboard() {
    const [data, setData] = useState<Record<string, unknown> | null>(null)
    const [userName, setUserName] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashRes, sessionRes] = await Promise.all([
                    fetch('/api/partner/dashboard'),
                    fetch('/api/auth/session'),
                ])
                const dashData = await dashRes.json()
                const sessionData = await sessionRes.json()
                setData(dashData)
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
                <Sidebar role="partner" userName="" />
                <main className="main-content">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                        <div className="spinner"></div>
                    </div>
                </main>
            </div>
        )
    }

    const stats = data?.stats as Record<string, number>
    const partner = data?.partner as Record<string, string>
    const redemptions = (data?.recentRedemptions || []) as Array<Record<string, unknown>>

    return (
        <div className="app-layout">
            <Sidebar role="partner" userName={userName} />
            <main className="main-content">
                <div className="page-header animate-fade-in">
                    <h1>📊 Dashboard - {partner?.nome_fantasia}</h1>
                    <p>Categoria: {partner?.categoria}</p>
                </div>

                <div className="stats-grid">
                    <div className="stat-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <div className="stat-icon purple">🎯</div>
                        <div className="stat-value">{stats?.totalOffers}</div>
                        <div className="stat-label">Ofertas ativas</div>
                    </div>
                    <div className="stat-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <div className="stat-icon green">🎟</div>
                        <div className="stat-value">{stats?.totalRedemptions}</div>
                        <div className="stat-label">Total de resgates</div>
                    </div>
                    <div className="stat-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <div className="stat-icon blue">📅</div>
                        <div className="stat-value">{stats?.thisMonthRedemptions}</div>
                        <div className="stat-label">Resgates este mês</div>
                    </div>
                </div>

                <div className="card animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <h3 style={{ marginBottom: 20, fontSize: 16 }}>📋 Últimos Resgates</h3>
                    {redemptions.length > 0 ? (
                        <div className="table-container" style={{ border: 'none' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Morador</th>
                                        <th>Unidade</th>
                                        <th>Data</th>
                                        <th>Código</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {redemptions.map((r: Record<string, unknown>) => (
                                        <tr key={r.id as string}>
                                            <td>{(r.resident as Record<string, string>)?.nome}</td>
                                            <td>{(r.resident as Record<string, string>)?.unidade}</td>
                                            <td>{new Date(r.usado_em as string).toLocaleDateString('pt-BR')}</td>
                                            <td><code style={{ color: 'var(--accent-secondary)' }}>{(r.codigo as string)?.slice(0, 8)}...</code></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">📋</div>
                            <h3>Nenhum resgate ainda</h3>
                            <p>Quando moradores resgatarem seus cupons, aparecerão aqui.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
