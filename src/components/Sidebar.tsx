'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

interface SidebarProps {
    role: 'resident' | 'partner' | 'admin'
    userName: string
}

const menuItems = {
    resident: [
        { href: '/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/carteira', label: 'Carteira', icon: '💰' },
        { href: '/cupons', label: 'Cupons', icon: '🎟' },
        { href: '/premios', label: 'Prêmios', icon: '🏆' },
        { href: '/perfil', label: 'Perfil', icon: '👤' },
    ],
    partner: [
        { href: '/partner/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/partner/ofertas', label: 'Ofertas', icon: '🎯' },
        { href: '/partner/validar-cupom', label: 'Validar Cupom', icon: '✅' },
    ],
    admin: [
        { href: '/admin/dashboard', label: 'Dashboard', icon: '👑' },
        { href: '/admin/moradores', label: 'Moradores', icon: '👥' },
        { href: '/admin/parceiros', label: 'Parceiros', icon: '🏪' },
        { href: '/admin/campanhas', label: 'Campanhas', icon: '🎯' },
        { href: '/admin/configuracoes', label: 'Configurações', icon: '⚙️' },
    ],
}

export default function Sidebar({ role, userName }: SidebarProps) {
    const pathname = usePathname()
    const items = menuItems[role]
    const [open, setOpen] = useState(false)

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        window.location.href = '/login'
    }

    return (
        <>
            <button className="mobile-menu-btn" onClick={() => setOpen(!open)}>
                {open ? '✕' : '☰'}
            </button>
            <aside className={`sidebar ${open ? 'open' : ''}`}>
                <div className="sidebar-logo">
                    <h2>SOMOS <span>CIA</span> CLUB</h2>
                    <span className="sub">
                        {role === 'resident' ? '🏠 morador' : role === 'partner' ? '🏪 parceiro' : '👑 admin'}
                    </span>
                </div>

                <nav className="sidebar-nav">
                    {items.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                            onClick={() => setOpen(false)}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    {userName && (
                        <div style={{ padding: '8px 14px', marginBottom: 8, fontSize: 12, fontWeight: 800, color: 'rgba(26,26,26,.55)' }}>
                            👋 {userName}
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="sidebar-link"
                        style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                    >
                        <span>🚪</span>
                        Sair
                    </button>
                </div>
            </aside>
        </>
    )
}
