'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'

interface Resident {
    id: string
    nome: string
    email: string
    cpf: string
    unidade: string
    status: string
    inadimplente: boolean
    dias_atraso: number
    pontos: number
    _count: { couponRedemptions: number; walletTransactions: number }
}

export default function AdminMoradores() {
    const [residents, setResidents] = useState<Resident[]>([])
    const [userName, setUserName] = useState('')
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('')

    useEffect(() => {
        fetchResidents()
    }, [])

    const fetchResidents = async () => {
        try {
            const [res, sessionRes] = await Promise.all([
                fetch('/api/admin/moradores'),
                fetch('/api/auth/session'),
            ])
            const data = await res.json()
            const session = await sessionRes.json()
            setResidents(data.residents || [])
            setUserName(session.user?.nome || '')
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleStatus = async (r: Resident) => {
        await fetch('/api/admin/moradores', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: r.id, status: r.status === 'ativo' ? 'inativo' : 'ativo' }),
        })
        fetchResidents()
    }

    const filtered = residents.filter(r =>
        r.nome.toLowerCase().includes(filter.toLowerCase()) ||
        r.cpf.includes(filter) ||
        r.unidade.toLowerCase().includes(filter.toLowerCase())
    )

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
                <div className="page-header animate-fade-in">
                    <h1>👥 Moradores</h1>
                    <p>{residents.length} moradores cadastrados</p>
                </div>

                <div style={{ marginBottom: 24 }}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="🔍 Buscar por nome, CPF ou unidade..."
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        style={{ maxWidth: 400 }}
                    />
                </div>

                <div className="table-container animate-fade-in">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>CPF</th>
                                <th>Unidade</th>
                                <th>Pontos</th>
                                <th>Status</th>
                                <th>Financeiro</th>
                                <th>Cupons</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(r => (
                                <tr key={r.id}>
                                    <td style={{ fontWeight: 600 }}>{r.nome}</td>
                                    <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{r.cpf}</td>
                                    <td>{r.unidade}</td>
                                    <td><strong style={{ color: 'var(--accent-secondary)' }}>{r.pontos.toLocaleString()}</strong></td>
                                    <td>
                                        <span className={`badge ${r.status === 'ativo' ? 'badge-success' : 'badge-danger'}`}>
                                            {r.status}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${r.inadimplente ? 'badge-danger' : 'badge-success'}`}>
                                            {r.inadimplente ? `⚠ ${r.dias_atraso}d` : '✅ OK'}
                                        </span>
                                    </td>
                                    <td>{r._count.couponRedemptions}</td>
                                    <td>
                                        <button className="btn btn-sm btn-secondary" onClick={() => toggleStatus(r)}>
                                            {r.status === 'ativo' ? 'Desativar' : 'Ativar'}
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
