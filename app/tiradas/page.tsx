import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatSpanishDate } from '@/lib/date'

type SearchParams = {
  q?: string
  provincia?: string
  modalidad?: string
  desde?: string
  hasta?: string
  pasadas?: string
}

function normal(value: string | null | undefined) {
  return (value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es')
}

export default async function Tiradas({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const s = await createClient()
  const today = new Date().toISOString().slice(0, 10)
  const showPast = params.pasadas === '1'

  let query = s
    .from('competitions')
    .select('id,title,discipline,start_date,province,municipality,venue_name,results_url,info_url,registration_url,registration_phone,poster_path')
    .eq('status', 'published')
    .order('start_date')

  if (!showPast) query = query.gte('start_date', today)

  const { data: allData } = await query
  const source = allData ?? []

  const provinces = [...new Set(source.map(x => x.province).filter((x): x is string => Boolean(x)))].sort((a,b) => a.localeCompare(b,'es'))
  const disciplines = [...new Set(source.map(x => x.discipline).filter((x): x is string => Boolean(x)))].sort((a,b) => a.localeCompare(b,'es'))

  const q = normal(params.q)
  const province = normal(params.provincia)
  const discipline = normal(params.modalidad)

  const data = source.filter((x) => {
    const haystack = normal([x.title, x.discipline, x.venue_name, x.municipality, x.province].filter(Boolean).join(' '))
    if (q && !haystack.includes(q)) return false
    if (province && normal(x.province) !== province) return false
    if (discipline && normal(x.discipline) !== discipline) return false
    if (params.desde && x.start_date < params.desde) return false
    if (params.hasta && x.start_date > params.hasta) return false
    return true
  })

  const hasFilters = Boolean(params.q || params.provincia || params.modalidad || params.desde || params.hasta || params.pasadas)

  return (
    <main className="page">
      <div className="shell">
        <div className="section-head tiradas-heading">
          <div>
            <div className="eyebrow muted">Calendario nacional</div>
            <h1 className="page-title">Tiradas</h1>
            <p className="page-intro muted">Busca por modalidad, provincia, fecha o nombre. Por defecto solo mostramos las próximas.</p>
          </div>
          <span className="result-count">{data.length} {data.length === 1 ? 'tirada' : 'tiradas'}</span>
        </div>

        <form className="competition-filters panel" method="get">
          <label className="filter-search">
            <span className="label">Buscar</span>
            <input className="input" name="q" defaultValue={params.q ?? ''} placeholder="Nombre, campo, municipio…" />
          </label>
          <label>
            <span className="label">Provincia</span>
            <select name="provincia" defaultValue={params.provincia ?? ''}>
              <option value="">Todas</option>
              {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label>
            <span className="label">Modalidad</span>
            <select name="modalidad" defaultValue={params.modalidad ?? ''}>
              <option value="">Todas</option>
              {disciplines.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
          <label>
            <span className="label">Desde</span>
            <input className="input" type="date" name="desde" defaultValue={params.desde ?? ''} />
          </label>
          <label>
            <span className="label">Hasta</span>
            <input className="input" type="date" name="hasta" defaultValue={params.hasta ?? ''} />
          </label>
          <label className="filter-check">
            <input type="checkbox" name="pasadas" value="1" defaultChecked={showPast} />
            <span>Incluir celebradas</span>
          </label>
          <div className="filter-actions">
            {hasFilters && <Link className="button button-ghost" href="/tiradas">Limpiar</Link>}
            <button className="button" type="submit">Aplicar filtros</button>
          </div>
        </form>

        <div className="section competition-results">
          {data.length ? (
            <div className="cards competition-cards">
              {data.map((x) => {
                const posterUrl = x.poster_path ? s.storage.from('competition-assets').getPublicUrl(x.poster_path).data.publicUrl : null
                const isPast = x.start_date < today
                return (
                  <article className="card competition-card" key={x.id}>
                    <Link className="competition-poster-link" href={`/tiradas/${x.id}`} title="Ver ficha de la tirada">
                      {posterUrl
                        ? <img className="competition-poster" src={posterUrl} alt={`Cartel de ${x.title}`} />
                        : <div className="competition-poster-placeholder">Sin cartel</div>}
                    </Link>
                    <div className="competition-card-body">
                      <div className="competition-meta-row">
                        <span className="date-badge">{formatSpanishDate(x.start_date)}</span>
                        {isPast && <span className="pill status-draft">Celebrada</span>}
                      </div>
                      <h3><Link className="card-title-link" href={`/tiradas/${x.id}`}>{x.title}</Link></h3>
                      <p>{x.discipline}</p>
                      <p className="muted">{[x.venue_name, x.municipality, x.province].filter(Boolean).join(' · ') || 'Lugar por confirmar'}</p>
                      {x.registration_phone && !isPast && <p><b>Inscripción:</b> <a className="text-link" href={`tel:${x.registration_phone.replace(/\s+/g, '')}`}>{x.registration_phone}</a></p>}
                      <Link className="text-link" href={`/tiradas/${x.id}`}>Ver ficha completa →</Link>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="empty">
              <b>No hay tiradas que coincidan con esos filtros.</b>
              <div className="muted">Prueba a ampliar fechas o limpiar algún filtro.</div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
