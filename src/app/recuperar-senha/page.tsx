'use client'
import Link from 'next/link'

export default function RecuperarSenha() {
    return (
        <div className="auth-container">
            <div className="auth-card" style={{ textAlign: 'center' }}>
                <div className="auth-logo">
                    <h1>SOMOS CIA CLUB</h1>
                    <p>Recuperar Senha</p>
                </div>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>
                    Entre em contato com a administração do condomínio para redefinir sua senha.
                </p>
                <Link href="/login" className="btn btn-primary">Voltar ao Login</Link>
            </div>
        </div>
    )
}
