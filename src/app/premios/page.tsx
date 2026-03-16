'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'

interface Campaign {
    id: string
    titulo: string
    descricao: string
    pontos_minimos: number
    image_url: string | null
    total_participantes: number
    ja_participou: boolean
    pode_participar: boolean
    pontos_usuario: number
}

export default function PremiosPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [pontos, setPontos] = useState(0)
    const [userName, setUserName] = useState('')
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState<{ show: boolean; message: string; type: string }>({ show: false, message: '', type: '' })

    const prizeEmojis = ['🛴', '🛍️', '⌚', '🍽️', '📱', '🎮', '🏖️', '🎁']

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [premiosRes, sessionRes] = await Promise.all([
                    fetch('/api/premios'),
                    fetch('/api/auth/session'),
                ])
                const premiosData = await premiosRes.json()
                const sessionData = await sessionRes.json()
                setCampaigns(premiosData.campaigns || [])
                setPontos(premiosData.pontos || 0)
                setUserName(sessionData.user?.nome || '')
            } catch (error) {
                console.error('Error:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleParticipate = async (campaignId: string) => {
        try {
            const res = await fetch('/api/premios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ campaignId }),
            })
            const data = await res.json()

            if (!res.ok) {
                setToast({ show: true, message: data.error, type: 'error' })
            } else {
                setToast({ show: true, message: '🎉 Inscrição realizada com sucesso!', type: 'success' })
                // Refresh
                const refreshRes = await fetch('/api/premios')
                const refreshData = await refreshRes.json()
                setCampaigns(refreshData.campaigns || [])
            }
            setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000)
        } catch {
            setToast({ show: true, message: 'Erro ao participar', type: 'error' })
            setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000)
        }
    }

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

    return (
        <div className="app-layout">
            <Sidebar role="resident" userName={userName} />
            <main className="main-content">
                <div className="page-header animate-fade-in">
                    <h1>🏆 Prêmios & Campanhas</h1>
                    <p>Use seus pontos para participar de sorteios incríveis!</p>
                </div>

                <div className="wallet-hero animate-fade-in" style={{ marginBottom: 32, padding: 30 }}>
                    <div className="wallet-balance-label">Seus pontos</div>
                    <div className="wallet-balance" style={{ fontSize: 40 }}>
                        {pontos.toLocaleString('pt-BR')} <span>pts</span>
                    </div>
                </div>

                <div className="offers-grid">
                    {campaigns.map((campaign, index) => {
                        const progress = Math.min((pontos / campaign.pontos_minimos) * 100, 100)
                        return (
                            <div key={campaign.id} className="prize-card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                <div className="prize-image">
                                    <span>{prizeEmojis[index % prizeEmojis.length]}</span>
                                </div>
                                <h3 className="prize-title">{campaign.titulo}</h3>
                                <p className="prize-desc">{campaign.descricao}</p>

                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                                </div>
                                <div className="progress-labels">
                                    <span className="current">{pontos.toLocaleString('pt-BR')} pts</span>
                                    <span>{campaign.pontos_minimos.toLocaleString('pt-BR')} pts necessários</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <span className="badge badge-purple">{campaign.total_participantes} participantes</span>
                                    {campaign.ja_participou && <span className="badge badge-success">✅ Inscrito</span>}
                                </div>

                                {campaign.ja_participou ? (
                                    <button className="btn btn-secondary btn-full" disabled>Você já está participando!</button>
                                ) : campaign.pode_participar ? (
                                    <button className="btn btn-success btn-full" onClick={() => handleParticipate(campaign.id)}>
                                        🎯 Participar do Sorteio
                                    </button>
                                ) : (
                                    <button className="btn btn-secondary btn-full" disabled>
                                        🔒 Precisa de {campaign.pontos_minimos.toLocaleString('pt-BR')} pts
                                    </button>
                                )}
                            </div>
                        )
                    })}
                </div>

                {campaigns.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">🏆</div>
                        <h3>Nenhuma campanha ativa</h3>
                        <p>Novas campanhas de prêmios serão anunciadas em breve.</p>
                    </div>
                )}

                {toast.show && (
                    <div className={`toast toast-${toast.type}`}>
                        {toast.message}
                    </div>
                )}
            </main>
        </div>
    )
}
