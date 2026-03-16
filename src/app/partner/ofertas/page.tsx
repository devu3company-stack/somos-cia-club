'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'

interface Offer {
    id: string
    titulo: string
    descricao: string
    desconto: string
    ativo: boolean
}

export default function PartnerOfertas() {
    const [offers, setOffers] = useState<Offer[]>([])
    const [userName, setUserName] = useState('')
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ titulo: '', descricao: '', desconto: '' })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchOffers()
    }, [])

    const fetchOffers = async () => {
        try {
            const [offersRes, sessionRes] = await Promise.all([
                fetch('/api/partner/ofertas'),
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

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            await fetch('/api/partner/ofertas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, ativo: true }),
            })
            setForm({ titulo: '', descricao: '', desconto: '' })
            setShowForm(false)
            fetchOffers()
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setSaving(false)
        }
    }

    const toggleOffer = async (offer: Offer) => {
        await fetch('/api/partner/ofertas', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: offer.id, ativo: !offer.ativo }),
        })
        fetchOffers()
    }

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

    return (
        <div className="app-layout">
            <Sidebar role="partner" userName={userName} />
            <main className="main-content">
                <div className="page-header animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>🎯 Minhas Ofertas</h1>
                        <p>Gerencie suas ofertas para os moradores</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? '✕ Cancelar' : '+ Nova Oferta'}
                    </button>
                </div>

                {showForm && (
                    <div className="card animate-fade-in" style={{ marginBottom: 24 }}>
                        <h3 style={{ marginBottom: 20 }}>Criar Nova Oferta</h3>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label>Título</label>
                                <input type="text" className="form-input" value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} required placeholder="Ex: 10% OFF em qualquer produto" />
                            </div>
                            <div className="form-group">
                                <label>Descrição</label>
                                <input type="text" className="form-input" value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} required placeholder="Detalhes da oferta" />
                            </div>
                            <div className="form-group">
                                <label>Desconto</label>
                                <input type="text" className="form-input" value={form.desconto} onChange={e => setForm(p => ({ ...p, desconto: e.target.value }))} required placeholder="Ex: 10%, Grátis, R$29,90" />
                            </div>
                            <button type="submit" className="btn btn-success" disabled={saving}>
                                {saving ? 'Salvando...' : '✅ Criar Oferta'}
                            </button>
                        </form>
                    </div>
                )}

                <div className="table-container animate-fade-in">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Título</th>
                                <th>Descrição</th>
                                <th>Desconto</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {offers.map(offer => (
                                <tr key={offer.id}>
                                    <td style={{ fontWeight: 600 }}>{offer.titulo}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{offer.descricao}</td>
                                    <td><span className="badge badge-purple">{offer.desconto}</span></td>
                                    <td>
                                        <span className={`badge ${offer.ativo ? 'badge-success' : 'badge-danger'}`}>
                                            {offer.ativo ? 'Ativa' : 'Inativa'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn btn-sm btn-secondary" onClick={() => toggleOffer(offer)}>
                                            {offer.ativo ? 'Desativar' : 'Ativar'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {offers.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">🎯</div>
                        <h3>Nenhuma oferta criada</h3>
                        <p>Crie sua primeira oferta para atrair moradores!</p>
                    </div>
                )}
            </main>
        </div>
    )
}
