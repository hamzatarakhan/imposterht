import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    const body = await req.json().catch(() => ({}))
    const {
      rating,
      improvement_text,
      app_version,
      rounds_completed,
      created_at,
    } = body

    if (!rating) {
      return new Response(JSON.stringify({ error: 'rating required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase.functions.invoke(
      'send-transactional-email',
      {
        body: {
          templateName: 'feedback-notification',
          recipientEmail: 'Hamzatarakhan2000@gmail.com',
          templateData: {
            rating,
            improvementText: improvement_text ?? null,
            appVersion: app_version ?? null,
            roundsCompleted: rounds_completed ?? null,
            createdAt: created_at ?? new Date().toISOString(),
          },
        },
      }
    )

    if (error) {
      console.error('send-transactional-email failed', error)
      return new Response(JSON.stringify({ error: error.message }), {
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
