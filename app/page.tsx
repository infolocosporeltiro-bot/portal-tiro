import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatSpanishDate } from '@/lib/date'

export default async function Home() {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const [
    { data: competitions },
    { count: competitionCount },
    { count: rangeCount },
    { count: companyCount },
  ] = await Promise.all([
    supabase
      .from('competitions')
      .select('id,title,discipline,start_date,province,municipality,venue_name,results_url,registration_phone,poster_path')
      .eq('status', 'published')
      .gte('start_date', today)
      .order('start_date')
      .limit(3),
    supabase
      .from('competitions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('start_date', today),
    supabase
      .from('shooting_ranges')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabase
      .from('companies')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published'),
  ])

  return <>
    <section className="hero">
      <div className="shell hero-grid">
        <div>
          <div className="eyebrow">Tiro deportivo · España</div>
          <h1>Todo el tiro, en un solo lugar.</h1>
          <p>Consulta próximas tiradas, campos, resultados y empresas del sector desde una plataforma rápida y pensada para tiradores.</p>
          <div className="hero-actions">
            <Link className="button button-light" href="/tiradas">Ver próximas tiradas</Link>
            <Link className="button button-ghost" style={{borderColor:'rgba(255,255,255,.55)',color:'#fff'}} href="/campos">Explorar campos</Link>
          </div>
        </div>
        <aside className="hero-panel">
          <div><span>Próximas tiradas</span><strong>{competitionCount ?? 0}</strong><small>publicadas y pendientes de celebrar</small></div>
          <div><span>Directorio</span><strong>{(rangeCount ?? 0) + (companyCount ?? 0)}</strong><small>campos y empresas visibles</small></div>
        </aside>
      </div>
    </section>

    <form className="shell search-box home-competition-search" action="/tiradas" method="get">
      <input className="input" name="q" placeholder="Buscar tirada, modalidad, campo o provincia…" />
      <input className="input" name="provincia" placeholder="Provincia" />
      <button className="button" type="submit">Buscar tiradas</button>
    </form>

    <section className="section">
      <div className="shell">
        <div className="section-head">
          <div><div className="eyebrow muted">Calendario</div><h2>Próximas tiradas</h2></div>
          <Link className="text-link" href="/tiradas">Ver calendario completo →</Link>
        </div>
        {competitions?.length ? (
          <div className="cards competition-cards">
            {competitions.map((c) => {
              const posterUrl = c.poster_path ? supabase.storage.from('competition-assets').getPublicUrl(c.poster_path).data.publicUrl : null
              return (
                <article className="card competition-card" key={c.id}>
                  <Link className="competition-poster-link" href={`/tiradas/${c.id}`} title="Ver ficha de la tirada">
                    {posterUrl
                      ? <img className="competition-poster" src={posterUrl} alt={`Cartel de ${c.title}`} />
                      : <div className="competition-poster-placeholder">Sin cartel</div>}
                  </Link>
                  <div className="competition-card-body">
                    <span className="date-badge">{formatSpanishDate(c.start_date,{day:'2-digit',month:'short'})}</span>
                    <h3><Link className="card-title-link" href={`/tiradas/${c.id}`}>{c.title}</Link></h3>
                    <p className="muted">{c.discipline} · {[c.municipality,c.province].filter(Boolean).join(', ')}</p>
                    {c.registration_phone && <p><b>Inscripción:</b> <a className="text-link" href={`tel:${c.registration_phone.replace(/\s+/g,'')}`}>{c.registration_phone}</a></p>}
                    <Link className="text-link" href={`/tiradas/${c.id}`}>Ver detalles →</Link>
                  </div>
                </article>
              )
            })}
          </div>
        ) : <div className="empty">No hay tiradas futuras publicadas todavía.</div>}
      </div>
    </section>

    <section className="feature-strip">
      <div className="shell features">
        <div className="feature"><b>Tiradas</b><span className="muted">Fechas, modalidades, carteles y resultados.</span></div>
        <div className="feature"><b>Campos</b><span className="muted">Directorio nacional organizado por ubicación.</span></div>
        <div className="feature"><b>Empresas</b><span className="muted">Profesionales y servicios del sector.</span></div>
        <div className="feature"><b>Resultados</b><span className="muted">Enlaces y clasificaciones cuando estén disponibles.</span></div>
      </div>
    </section>
  </>
}
