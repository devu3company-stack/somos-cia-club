'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'

export default function PerfilPage() {
    const [resident, setResident] = useState<Record<string, unknown> | null>(null)
    const [userName, setUserName] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashRes, sessionRes] = await Promise.all([
                    fetch('/api/dashboard'),
                    fetch('/api/auth/session'),
                ])
                const dashData = await dashRes.json()
                const sessionData = await sessionRes.json()
                setResident(dashData.resident)
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

    const r = resident as Record<string, string | number | boolean>

    return (
        <div className="app-layout">
            <Sidebar role="resident" userName={userName} />
            <main className="main-content">
                <div className="page-header animate-fade-in">
                    <h1>👤 Meu Perfil</h1>
                </div>

                <div className="profile-header animate-fade-in">
                    <div className="profile-avatar">
                        {(r?.nome as string)?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="profile-info">
                        <h2>{r?.nome as string}</h2>
                        <p>{r?.unidade as string}</p>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <h4 style={{ marginBottom: 20, fontSize: 16, color: 'var(--text-secondary)' }}>Informações Pessoais</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Nome</label>
                                <span style={{ fontSize: 15 }}>{r?.nome as string}</span>
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Email</label>
                                <span style={{ fontSize: 15 }}>{r?.email as string}</span>
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>CPF</label>
                                <span style={{ fontSize: 15 }}>{r?.cpf as string}</span>
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Unidade</label>
                                <span style={{ fontSize: 15 }}>{r?.unidade as string}</span>
                            </div>
                        </div>
                    </div>

                    <div className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <h4 style={{ marginBottom: 20, fontSize: 16, color: 'var(--text-secondary)' }}>Status</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Status</label>
                                <span className={`badge ${r?.status === 'ativo' ? 'badge-success' : 'badge-danger'}`}>
                                    {(r?.status as string)?.toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Situação Financeira</label>
                                <span className={`badge ${r?.inadimplente ? 'badge-danger' : 'badge-success'}`}>
                                    {r?.inadimplente ? '🔴 Inadimplente' : '🟢 Adimplente'}
                                </span>
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Dias em Atraso</label>
                                <span style={{ fontSize: 15 }}>{r?.dias_atraso as number} dias</span>
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Pontos</label>
                                <span style={{ fontSize: 24, fontWeight: 800, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                    {(r?.pontos as number)?.toLocaleString('pt-BR')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
