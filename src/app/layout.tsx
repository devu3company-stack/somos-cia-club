import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'SOMOS CIA CLUB - Clube de Vantagens do Condomínio',
    description: 'Plataforma exclusiva de benefícios para moradores. Ganhe pontos, resgate cupons e participe de sorteios.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR">
            <body>{children}</body>
        </html>
    )
}
