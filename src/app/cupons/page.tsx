'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'

interface Offer {
    id: string
    titulo: string
    descricao: string
    desconto: string
    partner: {
        nome_fantasia: string
        categoria: string
    }
}

const CATEGORIES = [
    'Todos',
    'Alimentação',
    'Saúde',
    'Beleza',
    'Esportes',
    'Pet',
    'Serviços',
    'Automotivo',
    'Moda',
    'Educação'
]

const CATEGORY_ICONS: Record<string, string> = {
    'Alimentação': '🍕',
    'Saúde': '💊',
    'Beleza': '✂️',
    'Esportes': '🏋️',
    'Pet': '🐶',
    'Serviços': '🔧',
    'Automotivo': '🚗',
    'Moda': '👗',
    'Educação': '📚',
    'Outros': '🏷️'
}

export default function Cupons() {
    const [offers, setOffers] = useState<Offer[]>([])
    const [activeCategory, setActiveCategory] = useState('Todos')
    const [userName, setUserName] = useState('')
    const [loading, setLoading] = useState(true)
    const [redeemingId, setRedeemingId] = useState<string | null>(null)

    const [showModal, setShowModal] = useState(false)
    const [modalData, setModalData] = useState<{ codigo: string, parceiro: string, desconto: string } | null>(null)

    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [offersRes, sessionRes] = await Promise.all([
                fetch('/api/cupons'),
                fetch('/api/auth/session'),
            ])
            const offersData = await offersRes.json()
            const sessionData = await sessionRes.json()
            setOffers(offersData.offers || [])
            setUserName(sessionData.user?.nome || '')
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 4000)
    }

    const handleRedeem = async (offerId: string) => {
        setRedeemingId(offerId)
        try {
            const res = await fetch('/api/cupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ offerId }),
            })
            const data = await res.json()

            if (!res.ok) {
                showToast(data.error || 'Erro ao resgatar cupom', 'error')
                return
            }

            setModalData({
                codigo: data.codigo,
                parceiro: data.parceiro,
                desconto: data.desconto
            })
            setShowModal(true)
        } catch {
            showToast('Erro de conexão ao resgatar', 'error')
        } finally {
            setRedeemingId(null)
        }
    }

    const filteredOffers = activeCategory === 'Todos'
        ? offers
        : offers.filter(o => o.partner.categoria.includes(activeCategory) || o.partner.categoria === activeCategory)

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
                    <h1>🎟 Clube de Vantagens</h1>
                    <p>Descontos exclusivos para moradores em dia com o condomínio</p>
                </div>

                <div className="category-filter animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            className={`category-chip ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat === 'Todos' ? '🌟 Todos' : `${CATEGORY_ICONS[cat] || '🏷️'} ${cat}`}
                        </button>
                    ))}
                </div>

                {filteredOffers.length > 0 ? (
                    <div className="offers-grid">
                        {filteredOffers.map((offer, index) => (
                            <div
                                key={offer.id}
                                className="offer-card animate-fade-in"
                                style={{ animationDelay: `${0.15 + (index * 0.05)}s` }}
                            >
                                <div className="offer-image">
                                    {CATEGORY_ICONS[offer.partner.categoria] || '🏷️'}
                                    <div className="offer-badge">{offer.desconto}</div>
                                </div>
                                <div className="offer-content">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div className="offer-partner">{offer.partner.nome_fantasia}</div>
                                        <span className="offer-category">{offer.partner.categoria}</span>
                                    </div>
                                    <h3 className="offer-title">{offer.titulo}</h3>
                                    <p className="offer-desc">{offer.descricao}</p>

                                    <button
                                        className="btn btn-primary btn-full"
                                        onClick={() => handleRedeem(offer.id)}
                                        disabled={redeemingId === offer.id}
                                    >
                                        {redeemingId === offer.id ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : 'Resgatar Cupom'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card animate-fade-in">
                        <div className="empty-state">
                            <div className="empty-state-icon">🏷️</div>
                            <h3>Nenhuma oferta encontrada</h3>
                            <p>Não há ofertas disponíveis nesta categoria no momento.</p>
                        </div>
                    </div>
                )}
            </main>

            {/* Modal de Cupom */}
            {showModal && modalData && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
                            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8, color: 'var(--ink)' }}>Cupom Resgatado!</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                                Apresente este código no estabelecimento:<br />
                                <strong>{modalData.parceiro}</strong>
                            </p>

                            <div style={{
                                background: 'rgba(237,0,134,.08)',
                                border: '2px dashed var(--mag)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '20px',
                                marginBottom: 24
                            }}>
                                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--mag)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 8 }}>
                                    CÓDIGO DE DESCONTO ({modalData.desconto})
                                </div>
                                <div style={{ fontSize: 32, fontFamily: 'var(--mono)', fontWeight: 950, letterSpacing: '4px', color: 'var(--ink)' }}>
                                    {modalData.codigo}
                                </div>
                            </div>

                            <button className="btn btn-primary btn-full" onClick={() => setShowModal(false)}>
                                Fechar e Voltar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            <div className={`toast ${toast ? 'show' : ''}`} style={{
                borderColor: toast?.type === 'error' ? 'var(--danger)' : 'var(--success)',
                color: toast?.type === 'error' ? '#ff8a9f' : '#69f0ae'
            }}>
                {toast?.message}
            </div>
        </div>
    )
}
