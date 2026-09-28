import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  if (!claimsData?.claims?.sub) redirect('/login?next=/admin')

  const { data: isAdmin, error } = await supabase.rpc('is_admin')
  if (error || !isAdmin) redirect('/cuenta')

  return (
    <main className="page">
      <div className="shell admin-shell">
        <aside className="admin-sidebar">
          <div>
            <div className="eyebrow muted">Gestión</div>
            <h2>Administración</h2>
          </div>
          <nav>
            <Link href="/admin">Resumen</Link>
            <Link href="/admin/tiradas">Tiradas</Link>
            <span className="admin-nav-disabled">Publicaciones</span>
            <span className="admin-nav-disabled">Campos</span>
            <span className="admin-nav-disabled">Empresas</span>
            <span className="admin-nav-disabled">Usuarios</span>
          </nav>
          <Link className="text-link" href="/">← Volver al portal</Link>
        </aside>
        <section className="admin-content">{children}</section>
      </div>
    </main>
  )
}
