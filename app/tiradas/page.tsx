import { createClient } from '@/lib/supabase/server'
import { formatSpanishDate } from '@/lib/date'

export default async function Tiradas() {
  const s = await createClient()
  const { data } = await s
    .from('competitions')
    .select('id,title,discipline,start_date,province,municipality,venue_name,results_url,info_url,registration_url,registration_phone,poster_path')
    .eq('status', 'published')
    .order('start_date')

  return (
    <main className="page">
      <div className="shell">
        <h1 className="page-title">Tiradas</h1>
        <p className="page-intro muted">Calendario de competiciones con cartel, fecha, inscripción y enlaces cuando estén disponibles.</p>
        <div className="section">
          {data?.length ? (
            <div className="cards competition-cards">
              {data.map((x) => {
                const posterUrl = x.poster_path ? s.storage.from('competition-assets').getPublicUrl(x.poster_path).data.publicUrl : null
                return (
                  <article className="card competition-card" key={x.id}>
                    {posterUrl ? (
                      <a className="competition-poster-link" href={posterUrl} target="_blank" rel="noreferrer" title="Ver cartel a tamaño completo">
                        <img className="competition-poster" src={posterUrl} alt={`Cartel de ${x.title}`} />
                      </a>
                    ) : <div className="competition-poster-placeholder">Sin cartel</div>}
                    <div className="competition-card-body">
                      <span className="date-badge">{formatSpanishDate(x.start_date)}</span>
                      <h3>{x.title}</h3>
                      <p>{x.discipline}</p>
                      <p className="muted">{[x.venue_name, x.municipality, x.province].filter(Boolean).join(' · ')}</p>
                      {x.registration_phone && <p><b>Inscripción:</b> <a className="text-link" href={`tel:${x.registration_phone.replace(/\s+/g, '')}`}>{x.registration_phone}</a></p>}
                      <div className="competition-links">
                        {x.info_url && <a className="text-link" href={x.info_url} target="_blank" rel="noreferrer">Información →</a>}
                        {x.registration_url && <a className="text-link" href={x.registration_url} target="_blank" rel="noreferrer">Inscripción online →</a>}
                        {x.results_url && <a className="text-link" href={x.results_url} target="_blank" rel="noreferrer">Resultados →</a>}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : <div className="empty">Todavía no hay tiradas publicadas.</div>}
        </div>
      </div>
    </main>
  )
}
