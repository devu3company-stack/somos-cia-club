'use client'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'

export default function ValidarCupom() {
    const [codigo, setCodigo] = useState('')
    const [userName, setUserName] = useState('')
    const [result, setResult] = useState<Record<string, unknown> | null>(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetch('/api/auth/session').then(r => r.json()).then(d => setUserName(d.user?.nome || ''))
    }, [])

    const handleValidate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setResult(null)

        try {
            const res = await fetch('/api/partner/validar-cupom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codigo }),
            })
            const data = await res.json()

            if (!res.ok) {
                setError(data.error)
                return
            }

            setResult(data)
        } catch {
            setError('Erro de conexão')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="app-layout">
            <Sidebar role="partner" userName={userName} />
            <main className="main-content">
                <div className="page-header animate-fade-in" style={{ textAlign: 'center' }}>
                    <h1>✅ Validar Cupom</h1>
                    <p>Insira o código do cupom para verificar</p>
                </div>

                <form onSubmit={handleValidate} style={{ maxWidth: 500, margin: '40px auto' }}>
                    <div className="validate-input-group">
                        <input
                            type="text"
                            className="form-input"
                            placeholder="CÓDIGO DO CUPOM"
                            value={codigo}
                            onChange={e => setCodigo(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                            {loading ? '...' : '🔍'}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="card animate-fade-in" style={{ maxWidth: 500, margin: '24px auto', textAlign: 'center' }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
                        <h3 style={{ color: 'var(--danger)' }}>{error}</h3>
                    </div>
                )}

                {result?.valid && (
                    <div className="card animate-fade-in" style={{ maxWidth: 500, margin: '24px auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: 24 }}>
                            <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
                            <h3 style={{ color: 'var(--success)' }}>Cupom Válido!</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Morador</span>
                                <strong>{(result.cupom as Record<string, string>)?.morador}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Unidade</span>
                                <strong>{(result.cupom as Record<string, string>)?.unidade}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Período</span>
                                <strong>{(result.cupom as Record<string, string>)?.mes_ano}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Resgatado em</span>
                                <strong>{new Date((result.cupom as Record<string, string>)?.resgatado_em).toLocaleDateString('pt-BR')}</strong>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
