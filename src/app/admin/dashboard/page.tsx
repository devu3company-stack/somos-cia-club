'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'

export default function AdminDashboard() {
    const [data, setData] = useState<Record<string, unknown> | null>(null)
    const [userName, setUserName] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashRes, sessionRes] = await Promise.all([
                    fetch('/api/admin/dashboard'),
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
                <Sidebar role="admin" userName="" />
                <main className="main-content">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
                        <div className="spinner"></div>
                    </div>
                </main>
            </div>
        )
    }

    const stats = data?.stats as Record<string, number>
    const recentCoupons = (data?.recentCoupons || []) as Array<Record<string, unknown>>

    return (
        <div className="app-layout">
            <Sidebar role="admin" userName={userName} />
            <main className="main-content">
                <div className="page-header animate-fade-in">
                    <h1>👑 Painel Administrativo</h1>
                    <p>Visão geral do sistema SOMOS CIA CLUB</p>
                </div>

                <div className="stats-grid">
                    <div className="stat-card animate-fade-in" style={{ animationDelay: '0.05s' }}>
                        <div className="stat-icon purple">👥</div>
                        <div className="stat-value">{stats?.totalResidents}</div>
                        <div className="stat-label">Total Moradores</div>
                    </div>
                    <div className="stat-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <div className="stat-icon green">✅</div>
                        <div className="stat-value">{stats?.activeResidents}</div>
                        <div className="stat-label">Moradores Ativos</div>
                    </div>
                    <div className="stat-card animate-fade-in" style={{ animationDelay: '0.15s' }}>
                        <div className="stat-icon red">🔴</div>
                        <div className="stat-value">{stats?.inadimplentes}</div>
                        <div className="stat-label">Inadimplentes</div>
                    </div>
                    <div className="stat-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <div className="stat-icon blue">🏪</div>
                        <div className="stat-value">{stats?.approvedPartners}</div>
                        <div className="stat-label">Parceiros Aprovados</div>
                    </div>
                    <div className="stat-card animate-fade-in" style={{ animationDelay: '0.25s' }}>
                        <div className="stat-icon yellow">⏳</div>
                        <div className="stat-value">{stats?.pendingPartners}</div>
                        <div className="stat-label">Parceiros Pendentes</div>
                    </div>
                    <div className="stat-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <div className="stat-icon purple">🎟</div>
                        <div className="stat-value">{stats?.totalCoupons}</div>
                        <div className="stat-label">Cupons Resgatados</div>
                    </div>
                </div>

                <div className="card animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <h3 style={{ marginBottom: 20, fontSize: 16 }}>📋 Últimos Resgates</h3>
                    {recentCoupons.length > 0 ? (
                        <div className="table-container" style={{ border: 'none' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Morador</th>
                                        <th>Unidade</th>
                                        <th>Parceiro</th>
                                        <th>Data</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentCoupons.map((c) => (
                                        <tr key={c.id as string}>
                                            <td>{(c.resident as Record<string, string>)?.nome}</td>
                                            <td>{(c.resident as Record<string, string>)?.unidade}</td>
                                            <td>{(c.partner as Record<string, string>)?.nome_fantasia}</td>
                                            <td>{new Date(c.usado_em as string).toLocaleDateString('pt-BR')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">📋</div>
                            <h3>Sem atividade recente</h3>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
