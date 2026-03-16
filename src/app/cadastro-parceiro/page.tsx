'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CadastroParceiro() {
    const router = useRouter()
    const [form, setForm] = useState({ nome_fantasia: '', cnpj: '', email: '', categoria: '', senha: '', confirmarSenha: '' })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    const categorias = ['Alimentação', 'Saúde', 'Beleza', 'Esportes', 'Educação', 'Pet', 'Automotivo', 'Tecnologia', 'Serviços', 'Outros']

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (form.senha !== form.confirmarSenha) {
            setError('As senhas não coincidem')
            setLoading(false)
            return
        }

        try {
            const res = await fetch('/api/auth/register-partner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error)
                return
            }

            setSuccess('Cadastro enviado! Aguarde aprovação pela administração.')
        } catch {
            setError('Erro de conexão. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="auth-container">
                <div className="auth-card" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                    <h2 style={{ marginBottom: 8 }}>Cadastro Enviado!</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{success}</p>
                    <Link href="/login" className="btn btn-primary">Voltar ao Login</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>SOMOS CIA CLUB</h1>
                    <p>Cadastro de Parceiro Comercial</p>
                </div>

                {error && <div className="alert-banner danger">⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nome Fantasia</label>
                        <input type="text" name="nome_fantasia" className="form-input" placeholder="Nome da empresa" value={form.nome_fantasia} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>CNPJ</label>
                        <input type="text" name="cnpj" className="form-input" placeholder="00.000.000/0000-00" value={form.cnpj} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" className="form-input" placeholder="contato@empresa.com" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Categoria</label>
                        <select name="categoria" className="form-select" value={form.categoria} onChange={handleChange} required>
                            <option value="">Selecione...</option>
                            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Senha</label>
                        <input type="password" name="senha" className="form-input" placeholder="Mínimo 6 caracteres" value={form.senha} onChange={handleChange} required minLength={6} />
                    </div>
                    <div className="form-group">
                        <label>Confirmar Senha</label>
                        <input type="password" name="confirmarSenha" className="form-input" placeholder="Repita a senha" value={form.confirmarSenha} onChange={handleChange} required />
                    </div>

                    <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                        {loading ? 'Enviando...' : '🏪 Cadastrar Empresa'}
                    </button>
                </form>

                <div className="auth-footer">
                    <span>Já tem cadastro? </span>
                    <Link href="/login">Fazer login</Link>
                </div>
            </div>
        </div>
    )
}
