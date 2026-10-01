import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatSpanishDate } from '@/lib/date'

export default async function AdminTiradasPage({ searchParams }: { searchParams: Promise<{ created?: string; updated?: string }> }) {
  const params = await searchParams
  const supabase = await createClient()
  const { data } = await supabase
    .from('competitions')
    .select('id,title,discipline,start_date,province,municipality,venue_name,status,results_url,created_at')
    .order('start_date', { ascending: true })

  return (
    <>
      <div className="section-head admin-title-row">
        <div>
          <div className="eyebrow muted">Calendario</div>
          <h1 className="page-title">Tiradas</h1>
        </div>
        <Link className="button" href="/admin/tiradas/nueva">+ Nueva tirada</Link>
      </div>

      {params.created && <div className="message success-message">La tirada se ha guardado correctamente.</div>}
      {params.updated && <div className="message success-message">Los cambios se han guardado correctamente.</div>}

      <div className="panel admin-table-wrap">
        {data?.length ? (
          <div className="admin-table">
            <div className="admin-table-head admin-table-head-actions">
              <span>Fecha</span><span>Tirada</span><span>Lugar</span><span>Estado</span><span></span>
            </div>
            {data.map((x) => (
              <div className="admin-table-row admin-table-row-actions" key={x.id}>
                <span>{formatSpanishDate(x.start_date,{day:'2-digit',month:'2-digit',year:'numeric'})}</span>
                <span><b>{x.title}</b><small>{x.discipline}</small></span>
                <span>{[x.venue_name, x.municipality, x.province].filter(Boolean).join(' · ') || '—'}</span>
                <span><span className={`pill status-${x.status}`}>{x.status === 'published' ? 'Publicada' : 'Borrador'}</span></span>
                <span><Link className="text-link" href={`/admin/tiradas/${x.id}`}>Editar →</Link></span>
              </div>
            ))}
          </div>
        ) : <div className="empty">Todavía no has creado ninguna tirada.</div>}
      </div>
    </>
  )
}
