import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatSpanishDate } from '@/lib/date'

export default async function TiradaDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const s = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data: x } = await s
    .from('competitions')
    .select('id,title,discipline,start_date,province,municipality,venue_name,results_url,info_url,registration_url,registration_phone,poster_path,status')
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (!x) notFound()

  const posterUrl = x.poster_path ? s.storage.from('competition-assets').getPublicUrl(x.poster_path).data.publicUrl : null
  const isPast = x.start_date < today

  return (
    <main className="page">
      <div className="shell">
        <div className="detail-back"><Link className="text-link" href="/tiradas">← Volver a tiradas</Link></div>
        <div className="competition-detail">
          <div className="competition-detail-poster">
            {posterUrl ? (
              <a href={posterUrl} target="_blank" rel="noreferrer" title="Abrir cartel a tamaño completo">
                <img src={posterUrl} alt={`Cartel de ${x.title}`} />
              </a>
            ) : <div className="competition-poster-placeholder">Sin cartel</div>}
          </div>

          <article className="competition-detail-info">
            <div className="competition-meta-row">
              <span className="date-badge">{formatSpanishDate(x.start_date)}</span>
              {isPast && <span className="pill status-draft">Celebrada</span>}
            </div>
            <div className="eyebrow muted">Tirada</div>
            <h1 className="page-title">{x.title}</h1>
            <p className="detail-discipline">{x.discipline}</p>

            <dl className="detail-list">
              <div><dt>Fecha</dt><dd>{formatSpanishDate(x.start_date)}</dd></div>
              <div><dt>Lugar</dt><dd>{[x.venue_name, x.municipality, x.province].filter(Boolean).join(' · ') || 'Por confirmar'}</dd></div>
              {x.registration_phone && <div><dt>Inscripción</dt><dd><a className="text-link" href={`tel:${x.registration_phone.replace(/\s+/g, '')}`}>{x.registration_phone}</a></dd></div>}
            </dl>

            <div className="detail-actions">
              {!isPast && x.registration_phone && <a className="button" href={`tel:${x.registration_phone.replace(/\s+/g, '')}`}>Llamar para inscribirse</a>}
              {x.registration_url && !isPast && <a className="button" href={x.registration_url} target="_blank" rel="noreferrer">Inscripción online</a>}
              {x.info_url && <a className="button button-ghost" href={x.info_url} target="_blank" rel="noreferrer">Más información</a>}
              {x.results_url && <a className="button button-ghost" href={x.results_url} target="_blank" rel="noreferrer">Ver resultados</a>}
            </div>

            <p className="detail-note muted">La información de inscripción y resultados procede de los datos publicados para esta tirada. Comprueba el cartel o la fuente enlazada si necesitas confirmar algún detalle.</p>
          </article>
        </div>
      </div>
    </main>
  )
}
