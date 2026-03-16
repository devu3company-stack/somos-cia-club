'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CadastroPage() {
    const router = useRouter()
    const [form, setForm] = useState({ nome: '', email: '', cpf: '', unidade: '', senha: '', confirmarSenha: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error)
                return
            }

            router.push('/login')
        } catch {
            setError('Erro de conexão. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1>SOMOS CIA CLUB</h1>
                    <p>Cadastro de Morador</p>
                </div>

                {error && <div className="alert-banner danger">⚠️ {error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nome Completo</label>
                        <input type="text" name="nome" className="form-input" placeholder="Seu nome completo" value={form.nome} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" className="form-input" placeholder="seu@email.com" value={form.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>CPF</label>
                        <input type="text" name="cpf" className="form-input" placeholder="000.000.000-00" value={form.cpf} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Unidade</label>
                        <input type="text" name="unidade" className="form-input" placeholder="Ex: Bloco A - Apt 101" value={form.unidade} onChange={handleChange} required />
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
                        {loading ? 'Cadastrando...' : '🚀 Criar Conta'}
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
