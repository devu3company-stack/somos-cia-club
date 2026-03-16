'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'

interface DashboardData {
    resident: {
        nome: string
        unidade: string
        status: string
        inadimplente: boolean
        dias_atraso: number
        pontos: number
    }
    recentCoupons: any[]
    availablePrizes: number
    availableCoupons: number
}

export default function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/dashboard')
            .then(res => res.json())
            .then(d => {
                setData(d)
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
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

    const { resident, recentCoupons, availablePrizes, availableCoupons } = data || {}

    return (
        <div className="app-layout">
            <Sidebar role="resident" userName={resident?.nome || ''} />

            <main className="main-content">
                <div className="page-header animate-fade-in">
                    <h1>👋 Olá, {resident?.nome.split(' ')[0]}!</h1>
                    <p>Unidade: {resident?.unidade}</p>
                </div>

                {resident?.inadimplente && (
                    <div className="alert alert-danger animate-fade-in">
                        <span style={{ fontSize: 20 }}>⚠️</span>
                        <div>
                            <strong style={{ display: 'block', fontSize: 14 }}>Atenção: Consta um atraso no condomínio ({resident.dias_atraso} dias)</strong>
                            O resgate de cupons está temporariamente bloqueado. Os pontos continuam acumulando.
                        </div>
                    </div>
                )}

                <div className="stats-grid">
                    <div className="stat-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <div className="stat-icon purple">💎</div>
                        <div className="stat-value">{resident?.pontos.toLocaleString()}</div>
                        <div className="stat-label">Pontos SOMOS</div>
                    </div>

                    <div className="stat-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <div className="stat-icon green">🎟</div>
                        <div className="stat-value">{availableCoupons}</div>
                        <div className="stat-label">Cupons Disponíveis</div>
                    </div>

                    <div className="stat-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <div className="stat-icon yellow">🏆</div>
                        <div className="stat-value">{availablePrizes}</div>
                        <div className="stat-label">Prêmios para Sorteio</div>
                    </div>

                    <div className="stat-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
                        <div className={`stat-icon ${resident?.inadimplente ? 'red' : 'blue'}`}>
                            {resident?.inadimplente ? '❌' : '✅'}
                        </div>
                        <div className="stat-value" style={{ fontSize: 24, marginTop: 4 }}>
                            {resident?.inadimplente ? 'Pendente' : 'Regular'}
                        </div>
                        <div className="stat-label">Status Condomínio</div>
                    </div>
                </div>

                <div className="card animate-fade-in" style={{ animationDelay: '0.5s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--ink)' }}>📋 Últimos Cupons Resgatados</h3>
                        <Link href="/cupons" className="btn btn-sm btn-secondary">
                            Ver Ofertas
                        </Link>
                    </div>

                    {recentCoupons && recentCoupons.length > 0 ? (
                        <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Parceiro</th>
                                        <th>Cupom</th>
                                        <th>Data</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentCoupons.map((coupon: any) => (
                                        <tr key={coupon.id}>
                                            <td><strong style={{ color: 'var(--ink)' }}>{coupon.partner.nome_fantasia}</strong></td>
                                            <td><code style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 900, color: 'var(--mag)' }}>{coupon.codigo}</code></td>
                                            <td>{new Date(coupon.usado_em).toLocaleDateString('pt-BR')}</td>
                                            <td><span className="badge badge-success">Utilizado</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-state-icon">🎟</div>
                            <h3>Nenhum cupom resgatado ainda</h3>
                            <p>Explore nossas ofertas exclusivas e comece a economizar.</p>
                            <Link href="/cupons" className="btn btn-primary" style={{ marginTop: 16 }}>
                                Explorar Ofertas
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
