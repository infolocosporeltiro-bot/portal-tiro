import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  const supabase = await createClient()
  const [competitions, pendingListings, ranges, companies, users] = await Promise.all([
    supabase.from('competitions').select('*', { count: 'exact', head: true }),
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('shooting_ranges').select('*', { count: 'exact', head: true }),
    supabase.from('companies').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ])

  return (
    <>
      <div className="section-head admin-title-row">
        <div>
          <div className="eyebrow muted">Panel</div>
          <h1 className="page-title">Resumen</h1>
        </div>
        <Link className="button" href="/admin/tiradas/nueva">+ Nueva tirada</Link>
      </div>

      <div className="admin-stats">
        <article><span>Tiradas</span><strong>{competitions.count ?? 0}</strong></article>
        <article><span>Pendientes</span><strong>{pendingListings.count ?? 0}</strong><small>publicaciones por revisar</small></article>
        <article><span>Campos</span><strong>{ranges.count ?? 0}</strong></article>
        <article><span>Empresas</span><strong>{companies.count ?? 0}</strong></article>
        <article><span>Usuarios</span><strong>{users.count ?? 0}</strong></article>
      </div>

      <div className="panel admin-next">
        <div>
          <div className="eyebrow muted">Primer módulo operativo</div>
          <h2>Calendario de tiradas</h2>
          <p className="muted">Añade competiciones, decide si quedan en borrador o se publican y enlaza información o resultados en directo.</p>
        </div>
        <Link className="button button-ghost" href="/admin/tiradas">Gestionar tiradas</Link>
      </div>
    </>
  )
}
