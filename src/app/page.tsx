import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function Home() {
    const session = await getSession()

    if (session) {
        switch (session.role) {
            case 'admin': redirect('/admin/dashboard')
            case 'partner': redirect('/partner/dashboard')
            default: redirect('/dashboard')
        }
    }

    redirect('/login')
}
