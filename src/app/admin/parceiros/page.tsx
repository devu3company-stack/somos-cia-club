'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'

interface Partner {
    id: string
    nome_fantasia: string
    cnpj: string
    email: string
    aprovado: boolean
    categoria: string
    _count: { offers: number; couponRedemptions: number }
}

export default function AdminParceiros() {
    const [partners, setPartners] = useState<Partner[]>([])
    const [userName, setUserName] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPartners()
    }, [])

    const fetchPartners = async () => {
        try {
            const [res, sessionRes] = await Promise.all([
                fetch('/api/admin/parceiros'),
                fetch('/api/auth/session'),
            ])
            const data = await res.json()
            const session = await sessionRes.json()
            setPartners(data.partners || [])
            setUserName(session.user?.nome || '')
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleApproval = async (p: Partner) => {
        await fetch('/api/admin/parceiros', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: p.id, aprovado: !p.aprovado }),
        })
        fetchPartners()
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
                <div className="page-header animate-fade-in">
                    <h1>🏪 Parceiros</h1>
                    <p>{partners.length} parceiros cadastrados</p>
                </div>

                <div className="table-container animate-fade-in">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Empresa</th>
                                <th>CNPJ</th>
                                <th>Categoria</th>
                                <th>Ofertas</th>
                                <th>Resgates</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {partners.map(p => (
                                <tr key={p.id}>
                                    <td style={{ fontWeight: 600 }}>{p.nome_fantasia}</td>
                                    <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{p.cnpj}</td>
                                    <td><span className="badge badge-purple">{p.categoria}</span></td>
                                    <td>{p._count.offers}</td>
                                    <td>{p._count.couponRedemptions}</td>
                                    <td>
                                        <span className={`badge ${p.aprovado ? 'badge-success' : 'badge-warning'}`}>
                                            {p.aprovado ? '✅ Aprovado' : '⏳ Pendente'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className={`btn btn-sm ${p.aprovado ? 'btn-danger' : 'btn-success'}`}
                                            onClick={() => toggleApproval(p)}
                                        >
                                            {p.aprovado ? 'Revogar' : 'Aprovar'}
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
