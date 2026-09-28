import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AdminTiradasPage({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
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

      <div className="panel admin-table-wrap">
        {data?.length ? (
          <div className="admin-table">
            <div className="admin-table-head">
              <span>Fecha</span><span>Tirada</span><span>Lugar</span><span>Estado</span>
            </div>
            {data.map((x) => (
              <div className="admin-table-row" key={x.id}>
                <span>{new Intl.DateTimeFormat('es-ES').format(new Date(x.start_date + 'T12:00:00'))}</span>
                <span><b>{x.title}</b><small>{x.discipline}</small></span>
                <span>{[x.venue_name, x.municipality, x.province].filter(Boolean).join(' · ') || '—'}</span>
                <span><span className={`pill status-${x.status}`}>{x.status === 'published' ? 'Publicada' : 'Borrador'}</span></span>
              </div>
            ))}
          </div>
        ) : <div className="empty">Todavía no has creado ninguna tirada.</div>}
      </div>
    </>
  )
}
