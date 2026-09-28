'use server'

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

export async function createCompetition(formData: FormData) {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub
  if (!userId) redirect('/login?next=/admin/tiradas/nueva')

  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) redirect('/cuenta')

  const title = text(formData, 'title')
  const discipline = text(formData, 'discipline')
  const startDate = text(formData, 'start_date')
  const endDate = optional(formData, 'end_date')
  const status = text(formData, 'status') === 'published' ? 'published' : 'draft'

  if (title.length < 3 || !discipline || !startDate) {
    redirect('/admin/tiradas/nueva?error=required')
  }

  const { error } = await supabase.from('competitions').insert({
    created_by: userId,
    title,
    discipline,
    start_date: startDate,
    end_date: endDate,
    province: optional(formData, 'province'),
    municipality: optional(formData, 'municipality'),
    venue_name: optional(formData, 'venue_name'),
    info_url: optional(formData, 'info_url'),
    registration_url: optional(formData, 'registration_url'),
    results_url: optional(formData, 'results_url'),
    status,
  })

  if (error) {
    redirect(`/admin/tiradas/nueva?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/')
  revalidatePath('/tiradas')
  revalidatePath('/admin')
  revalidatePath('/admin/tiradas')
  redirect('/admin/tiradas?created=1')
}
