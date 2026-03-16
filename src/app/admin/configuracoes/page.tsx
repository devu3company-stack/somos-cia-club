'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'

export default function AdminConfiguracoes() {
    const [userName, setUserName] = useState('')

    useEffect(() => {
        fetch('/api/auth/session').then(r => r.json()).then(d => setUserName(d.user?.nome || ''))
    }, [])

    return (
        <div className="app-layout">
            <Sidebar role="admin" userName={userName} />
            <main className="main-content">
                <div className="page-header animate-fade-in">
                    <h1>⚙️ Configurações</h1>
                    <p>Configurações do sistema</p>
                </div>

                <div className="stats-grid">
                    <div className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <h4 style={{ marginBottom: 20, fontSize: 16 }}>🔑 API do Condomínio</h4>
                        <div className="form-group">
                            <label>URL da API</label>
                            <input type="text" className="form-input" defaultValue="https://api.condominio.example.com" disabled />
                        </div>
                        <div className="form-group">
                            <label>API Key</label>
                            <input type="password" className="form-input" defaultValue="●●●●●●●●●●●●" disabled />
                        </div>
                        <span className="badge badge-warning">🔒 Configuração via .env</span>
                    </div>

                    <div className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <h4 style={{ marginBottom: 20, fontSize: 16 }}>💰 Sistema de Pontos</h4>
                        <div className="form-group">
                            <label>Pontos por pagamento em dia</label>
                            <input type="number" className="form-input" defaultValue={500} disabled />
                        </div>
                        <div className="form-group">
                            <label>Bônus de cadastro</label>
                            <input type="number" className="form-input" defaultValue={1000} disabled />
                        </div>
                        <div className="form-group">
                            <label>Dias para reset de pontos</label>
                            <input type="number" className="form-input" defaultValue={15} disabled />
                        </div>
                    </div>

                    <div className="card animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <h4 style={{ marginBottom: 20, fontSize: 16 }}>🎟 Regras de Cupons</h4>
                        <div className="form-group">
                            <label>Limite de cupons por parceiro/mês</label>
                            <input type="number" className="form-input" defaultValue={1} disabled />
                        </div>
                        <div className="form-group">
                            <label>Bloquear inadimplentes</label>
                            <input type="text" className="form-input" defaultValue="Sim" disabled />
                        </div>
                    </div>

                    <div className="card animate-fade-in" style={{ animationDelay: '0.4s' }}>
                        <h4 style={{ marginBottom: 20, fontSize: 16 }}>📊 Informações do Sistema</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Versão</span>
                                <strong>1.0.0</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Framework</span>
                                <strong>Next.js 14</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Banco de Dados</span>
                                <strong>SQLite / Prisma</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Autenticação</span>
                                <strong>JWT (jose)</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
