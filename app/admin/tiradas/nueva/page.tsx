import Link from 'next/link'
import { createCompetition } from '../actions'

export default async function NuevaTiradaPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  return (
    <>
      <div className="section-head admin-title-row">
        <div>
          <div className="eyebrow muted">Calendario</div>
          <h1 className="page-title">Nueva tirada</h1>
        </div>
        <Link className="button button-ghost" href="/admin/tiradas">Cancelar</Link>
      </div>

      {params.error && <div className="message">No se ha podido guardar. Revisa los campos obligatorios e inténtalo de nuevo.</div>}

      <form action={createCompetition} className="panel admin-form">
        <div className="form-section">
          <h2>Datos principales</h2>
          <div className="form-grid-2">
            <label className="span-2"><span className="label">Nombre de la tirada *</span><input className="input" name="title" required minLength={3} placeholder="Ej. Gran Tirada de Foso Universal" /></label>
            <label><span className="label">Modalidad *</span><input className="input" name="discipline" required placeholder="Foso Universal, Compak Sporting..." /></label>
            <label><span className="label">Campo / instalación</span><input className="input" name="venue_name" placeholder="Nombre del campo de tiro" /></label>
            <label><span className="label">Fecha *</span><input className="input" type="date" name="start_date" required /></label>
            <label><span className="label">Fecha de fin</span><input className="input" type="date" name="end_date" /></label>
            <label><span className="label">Provincia</span><input className="input" name="province" placeholder="Burgos" /></label>
            <label><span className="label">Municipio</span><input className="input" name="municipality" /></label>
          </div>
        </div>

        <div className="form-section">
          <h2>Enlaces</h2>
          <div className="form-grid-2">
            <label><span className="label">Información</span><input className="input" type="url" name="info_url" placeholder="https://..." /></label>
            <label><span className="label">Inscripción</span><input className="input" type="url" name="registration_url" placeholder="https://..." /></label>
            <label className="span-2"><span className="label">Resultados / resultados en directo</span><input className="input" type="url" name="results_url" placeholder="https://..." /></label>
          </div>
        </div>

        <div className="form-section">
          <h2>Publicación</h2>
          <label><span className="label">Estado</span><select name="status" defaultValue="published"><option value="published">Publicar ahora</option><option value="draft">Guardar como borrador</option></select></label>
          <p className="muted form-help">Una tirada publicada aparece inmediatamente en el calendario público y, si está entre las próximas, en la portada.</p>
        </div>

        <div className="form-actions">
          <Link className="button button-ghost" href="/admin/tiradas">Cancelar</Link>
          <button className="button" type="submit">Guardar tirada</button>
        </div>
      </form>
    </>
  )
}
