'use server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const id = data?.claims?.sub
  if (!id) return
  await supabase.from('profiles').update({
    display_name: String(formData.get('display_name') ?? '').trim() || null,
    province: String(formData.get('province') ?? '').trim() || null,
    municipality: String(formData.get('municipality') ?? '').trim() || null,
  }).eq('id', id)
  revalidatePath('/cuenta')
}
