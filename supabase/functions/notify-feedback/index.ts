const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!

    const body = await req.json().catch(() => ({}))
    const {
      rating,
      improvement_text,
      app_version,
      rounds_completed,
      created_at,
      user_id,
      user_name,
      saved_user_name,
      submitter_name,
      user_avatar,
      user_agent,
      language,
      page_url,
    } = body

    if (!rating) {
      return new Response(JSON.stringify({ error: 'rating required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const internalToken = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Prefer the explicit `saved_user_name` (the localStorage identity) for
    // the "account name" field. Fall back to legacy `user_name` for
    // backwards compatibility with older clients.
    const accountName = saved_user_name ?? user_name ?? null

    const response = await fetch(
      `${supabaseUrl}/functions/v1/send-transactional-email`,
      {
        method: 'POST',
        headers: {
          'x-internal-token': internalToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateName: 'feedback-notification',
          recipientEmail: 'Hamzatarakhan2000@gmail.com',
          templateData: {
            rating,
            improvementText: improvement_text ?? null,
            appVersion: app_version ?? null,
            roundsCompleted: rounds_completed ?? null,
            createdAt: created_at ?? new Date().toISOString(),
            userId: user_id ?? null,
            userName: accountName,
            submitterName: submitter_name ?? null,
            userAvatar: user_avatar ?? null,
            userAgent: user_agent ?? null,
            language: language ?? null,
            pageUrl: page_url ?? null,
          },
        }),
      }
    )

    const raw = await response.text()
    const data = raw ? JSON.parse(raw) : null

    if (!response.ok) {
      console.error('send-transactional-email failed', {
        status: response.status,
        data,
      })
      return new Response(JSON.stringify({ error: data?.error ?? 'Email send failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('notify-feedback error', err)
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})


