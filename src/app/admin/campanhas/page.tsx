'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'

interface Campaign {
    id: string
    titulo: string
    descricao: string | null
    pontos_minimos: number
    ativo: boolean
    _count: { entries: number }
}

export default function AdminCampanhas() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [userName, setUserName] = useState('')
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({ titulo: '', descricao: '', pontos_minimos: 5000 })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchCampaigns()
    }, [])

    const fetchCampaigns = async () => {
        try {
            const [res, sessionRes] = await Promise.all([
                fetch('/api/admin/campanhas'),
                fetch('/api/auth/session'),
            ])
            const data = await res.json()
            const session = await sessionRes.json()
            setCampaigns(data.campaigns || [])
            setUserName(session.user?.nome || '')
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
            await fetch('/api/admin/campanhas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, ativo: true }),
            })
            setForm({ titulo: '', descricao: '', pontos_minimos: 5000 })
            setShowForm(false)
            fetchCampaigns()
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setSaving(false)
        }
    }

    const toggleCampaign = async (c: Campaign) => {
        await fetch('/api/admin/campanhas', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: c.id, ativo: !c.ativo }),
        })
        fetchCampaigns()
    }

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

    return (
        <div className="app-layout">
            <Sidebar role="admin" userName={userName} />
            <main className="main-content">
                <div className="page-header animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>🎯 Campanhas de Prêmios</h1>
                        <p>{campaigns.length} campanhas</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? '✕ Cancelar' : '+ Nova Campanha'}
                    </button>
                </div>

                {showForm && (
                    <div className="card animate-fade-in" style={{ marginBottom: 24 }}>
                        <h3 style={{ marginBottom: 20 }}>Criar Nova Campanha</h3>
                        <form onSubmit={handleCreate}>
                            <div className="form-group">
                                <label>Título</label>
                                <input type="text" className="form-input" value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} required placeholder="Ex: Patinete Elétrico" />
                            </div>
                            <div className="form-group">
                                <label>Descrição</label>
                                <input type="text" className="form-input" value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} placeholder="Detalhes do prêmio" />
                            </div>
                            <div className="form-group">
                                <label>Pontos Mínimos</label>
                                <input type="number" className="form-input" value={form.pontos_minimos} onChange={e => setForm(p => ({ ...p, pontos_minimos: parseInt(e.target.value) }))} required min={100} />
                            </div>
                            <button type="submit" className="btn btn-success" disabled={saving}>
                                {saving ? 'Salvando...' : '✅ Criar Campanha'}
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
                                <th>Pontos Mín.</th>
                                <th>Inscritos</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.map(c => (
                                <tr key={c.id}>
                                    <td style={{ fontWeight: 600 }}>{c.titulo}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{c.descricao || '-'}</td>
                                    <td><strong style={{ color: 'var(--accent-secondary)' }}>{c.pontos_minimos.toLocaleString()}</strong></td>
                                    <td>{c._count.entries}</td>
                                    <td>
                                        <span className={`badge ${c.ativo ? 'badge-success' : 'badge-danger'}`}>
                                            {c.ativo ? 'Ativa' : 'Encerrada'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn btn-sm btn-secondary" onClick={() => toggleCampaign(c)}>
                                            {c.ativo ? 'Encerrar' : 'Reativar'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    )
}
