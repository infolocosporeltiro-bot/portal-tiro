'use server'

import { randomUUID } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim()
}

function optional(formData: FormData, key: string) {
  const value = text(formData, key)
  return value || null
}

async function requireAdmin(next: string) {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub
  if (!userId) redirect(`/login?next=${encodeURIComponent(next)}`)
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) redirect('/cuenta')
  return { supabase, userId }
}

async function uploadPoster(supabase: Awaited<ReturnType<typeof createClient>>, formData: FormData) {
  const poster = formData.get('poster')
  if (!(poster instanceof File) || poster.size === 0) return null

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(poster.type) || poster.size > 5 * 1024 * 1024) return 'INVALID_POSTER'

  const extension = poster.type === 'image/png' ? 'png' : poster.type === 'image/webp' ? 'webp' : 'jpg'
  const posterPath = `posters/${randomUUID()}.${extension}`
  const { error } = await supabase.storage.from('competition-assets').upload(posterPath, poster, {
    contentType: poster.type,
    upsert: false,
  })
  return error ? 'UPLOAD_ERROR' : posterPath
}

export async function createCompetition(formData: FormData) {
  const { supabase, userId } = await requireAdmin('/admin/tiradas/nueva')

  const title = text(formData, 'title')
  const discipline = text(formData, 'discipline')
  const startDate = text(formData, 'start_date')
  const status = text(formData, 'status') === 'published' ? 'published' : 'draft'
  if (title.length < 3 || !discipline || !startDate) redirect('/admin/tiradas/nueva?error=required')

  const posterPath = await uploadPoster(supabase, formData)
  if (posterPath === 'INVALID_POSTER' || posterPath === 'UPLOAD_ERROR') redirect('/admin/tiradas/nueva?error=poster')

  const { error } = await supabase.from('competitions').insert({
    created_by: userId,
    title,
    discipline,
    start_date: startDate,
    end_date: null,
    province: optional(formData, 'province'),
    municipality: optional(formData, 'municipality'),
    venue_name: optional(formData, 'venue_name'),
    registration_phone: optional(formData, 'registration_phone'),
    info_url: optional(formData, 'info_url'),
    registration_url: optional(formData, 'registration_url'),
    results_url: optional(formData, 'results_url'),
    poster_path: posterPath,
    status,
  })

  if (error) {
    if (posterPath) await supabase.storage.from('competition-assets').remove([posterPath])
    redirect(`/admin/tiradas/nueva?error=${encodeURIComponent(error.message)}`)
  }

  revalidateCompetitionPaths()
  redirect('/admin/tiradas?created=1')
}

export async function updateCompetition(formData: FormData) {
  const id = text(formData, 'id')
  if (!id) redirect('/admin/tiradas')
  const { supabase } = await requireAdmin(`/admin/tiradas/${id}`)

  const title = text(formData, 'title')
  const discipline = text(formData, 'discipline')
  const startDate = text(formData, 'start_date')
  const status = text(formData, 'status') === 'published' ? 'published' : 'draft'
  if (title.length < 3 || !discipline || !startDate) redirect(`/admin/tiradas/${id}?error=required`)

  const { data: existing } = await supabase.from('competitions').select('poster_path').eq('id', id).single()
  if (!existing) redirect('/admin/tiradas')

  const uploadedPoster = await uploadPoster(supabase, formData)
  if (uploadedPoster === 'INVALID_POSTER' || uploadedPoster === 'UPLOAD_ERROR') redirect(`/admin/tiradas/${id}?error=poster`)
  const posterPath = uploadedPoster || existing.poster_path

  const { error } = await supabase.from('competitions').update({
    title,
    discipline,
    start_date: startDate,
    end_date: null,
    province: optional(formData, 'province'),
    municipality: optional(formData, 'municipality'),
    venue_name: optional(formData, 'venue_name'),
    registration_phone: optional(formData, 'registration_phone'),
    info_url: optional(formData, 'info_url'),
    registration_url: optional(formData, 'registration_url'),
    results_url: optional(formData, 'results_url'),
    poster_path: posterPath,
    status,
  }).eq('id', id)

  if (error) {
    if (uploadedPoster) await supabase.storage.from('competition-assets').remove([uploadedPoster])
    redirect(`/admin/tiradas/${id}?error=${encodeURIComponent(error.message)}`)
  }

  if (uploadedPoster && existing.poster_path) await supabase.storage.from('competition-assets').remove([existing.poster_path])
  revalidateCompetitionPaths()
  redirect('/admin/tiradas?updated=1')
}

function revalidateCompetitionPaths() {
  revalidatePath('/')
  revalidatePath('/tiradas')
  revalidatePath('/admin')
  revalidatePath('/admin/tiradas')
}
