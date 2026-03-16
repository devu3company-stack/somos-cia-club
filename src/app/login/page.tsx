'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Role = 'resident' | 'partner' | 'admin'

export default function Login() {
    const router = useRouter()
    const [role, setRole] = useState<Role>('resident')
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tipo: role, cpf: identifier, senha: password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Erro ao fazer login')
                setLoading(false)
                return
            }

            // Redireciona com base na role
            if (role === 'resident') router.push('/dashboard')
            else if (role === 'partner') router.push('/partner/dashboard')
            else if (role === 'admin') router.push('/admin/dashboard')

        } catch (err) {
            setError('Erro de conexão')
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>SOMOS <span>CIA</span> CLUB</h1>
                    <p>Seu clube de vantagens exclusivo</p>
                </div>

                <div className="auth-tabs">
                    <button
                        className={`auth-tab ${role === 'resident' ? 'active' : ''}`}
                        onClick={() => setRole('resident')}
                        type="button"
                    >
                        🏠 Morador
                    </button>
                    <button
                        className={`auth-tab ${role === 'partner' ? 'active' : ''}`}
                        onClick={() => setRole('partner')}
                        type="button"
                    >
                        🏪 Parceiro
                    </button>
                    <button
                        className={`auth-tab ${role === 'admin' ? 'active' : ''}`}
                        onClick={() => setRole('admin')}
                        type="button"
                    >
                        👑 Admin
                    </button>
                </div>

                {error && (
                    <div className="alert alert-danger animate-fade-in" style={{ marginBottom: 20 }}>
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>{role === 'resident' ? 'CPF ou Email' : role === 'partner' ? 'CNPJ ou Email' : 'Email'}</label>
                        <input
                            type={role === 'admin' ? 'email' : 'text'}
                            className="form-input"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                            placeholder={role === 'resident' ? 'Digite seu CPF ou Email' : 'Digite seu identificador'}
                        />
                    </div>

                    <div className="form-group">
                        <label>Senha</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Digite sua senha"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 10 }}>
                        {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div> : '⚡ Entrar'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <a href="/recuperar-senha" style={{ color: 'var(--text-secondary)', fontSize: 13, textDecoration: 'none', fontWeight: 700 }}>
                        Esqueceu sua senha?
                    </a>
                </div>

                {role !== 'admin' && (
                    <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
                        Ainda não tem cadastro?{' '}
                        <a href={role === 'resident' ? '/cadastro' : '/cadastro-parceiro'} style={{ color: 'var(--mag)', textDecoration: 'none', fontWeight: 900 }}>
                            Cadastre-se
                        </a>
                    </div>
                )}

                {/* Demo info */}
                <div className="demo-box animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div style={{ marginBottom: 6 }}><strong>🧪 Credenciais de Demo:</strong></div>
                    {role === 'resident' && <div>CPF: <code>111.222.333-44</code> / Senha: <code>123456</code></div>}
                    {role === 'partner' && <div>E-mail: <code>contato@bellanapoli.com</code> / Senha: <code>parceiro123</code></div>}
                    {role === 'admin' && <div>E-mail: <code>admin@somoscia.com</code> / Senha: <code>admin123</code></div>}
                </div>
            </div>
        </div>
    )
}
