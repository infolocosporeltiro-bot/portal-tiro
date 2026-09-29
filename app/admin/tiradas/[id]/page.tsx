import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateCompetition } from '../actions'

export default async function EditarTiradaPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params
  const query = await searchParams
  const supabase = await createClient()
  const { data: competition } = await supabase
    .from('competitions')
    .select('id,title,discipline,start_date,province,municipality,venue_name,registration_phone,info_url,registration_url,results_url,poster_path,status')
    .eq('id', id)
    .single()

  if (!competition) notFound()
  const posterUrl = competition.poster_path ? supabase.storage.from('competition-assets').getPublicUrl(competition.poster_path).data.publicUrl : null

  return (
    <>
      <div className="section-head admin-title-row">
        <div>
          <div className="eyebrow muted">Calendario</div>
          <h1 className="page-title">Editar tirada</h1>
        </div>
        <Link className="button button-ghost" href="/admin/tiradas">Volver</Link>
      </div>

      {query.error && <div className="message">No se han podido guardar los cambios. Revisa los campos.</div>}

      <form action={updateCompetition} className="panel admin-form">
        <input type="hidden" name="id" value={competition.id} />
        <div className="form-section">
          <h2>Datos principales</h2>
          <div className="form-grid-2">
            <label className="span-2"><span className="label">Nombre de la tirada *</span><input className="input" name="title" required minLength={3} defaultValue={competition.title} /></label>
            <label><span className="label">Modalidad *</span><input className="input" name="discipline" required defaultValue={competition.discipline} /></label>
            <label><span className="label">Campo / instalación</span><input className="input" name="venue_name" defaultValue={competition.venue_name ?? ''} /></label>
            <label><span className="label">Fecha *</span><input className="input" type="date" name="start_date" required defaultValue={competition.start_date} /></label>
            <label><span className="label">Teléfono de inscripción</span><input className="input" type="tel" name="registration_phone" defaultValue={competition.registration_phone ?? ''} /></label>
            <label><span className="label">Provincia</span><input className="input" name="province" defaultValue={competition.province ?? ''} /></label>
            <label><span className="label">Municipio</span><input className="input" name="municipality" defaultValue={competition.municipality ?? ''} /></label>
          </div>
        </div>

        <div className="form-section">
          <h2>Cartel</h2>
          {posterUrl && <a className="current-poster-link" href={posterUrl} target="_blank" rel="noreferrer"><img className="current-poster" src={posterUrl} alt={`Cartel actual de ${competition.title}`} /></a>}
          <label className="poster-upload"><span className="label">{posterUrl ? 'Sustituir cartel' : 'Añadir cartel'}</span><input className="input" type="file" name="poster" accept="image/jpeg,image/png,image/webp" /><small className="muted">JPG, PNG o WEBP. Máximo 5 MB. Si no eliges archivo se conserva el cartel actual.</small></label>
        </div>

        <div className="form-section">
          <h2>Enlaces opcionales</h2>
          <p className="muted form-help">Déjalos vacíos hasta que estén disponibles.</p>
          <div className="form-grid-2">
            <label><span className="label">Información</span><input className="input" type="url" name="info_url" defaultValue={competition.info_url ?? ''} /></label>
            <label><span className="label">Inscripción online</span><input className="input" type="url" name="registration_url" defaultValue={competition.registration_url ?? ''} /></label>
            <label className="span-2"><span className="label">Resultados / resultados en directo</span><input className="input" type="url" name="results_url" defaultValue={competition.results_url ?? ''} /></label>
          </div>
        </div>

        <div className="form-section">
          <h2>Publicación</h2>
          <label><span className="label">Estado</span><select name="status" defaultValue={competition.status}><option value="published">Publicada</option><option value="draft">Borrador</option></select></label>
        </div>

        <div className="form-actions">
          <Link className="button button-ghost" href="/admin/tiradas">Cancelar</Link>
          <button className="button" type="submit">Guardar cambios</button>
        </div>
      </form>
    </>
  )
}
