import { supabase } from '../lib/supabase'

// Returns the Authorization header from the current Supabase session. The token
// is auto-refreshed by supabase-js, so reading the session each call is cheap.
export async function getAuthHeaders() {
  if (!supabase) {
    return {}
  }

  const { data } = await supabase.auth.getSession()
  const token = data?.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}
