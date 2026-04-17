import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, name, role, invitationUrl } = await req.json()

    if (!email) {
      throw new Error('Email is required')
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    let emailSent = false
    let provider = 'mock'

    if (RESEND_API_KEY) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Routevoy <invites@routevoy.com>',
          to: [email],
          subject: `Convite para acessar Routevoy (${role})`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2>Olá ${name || ''},</h2>
              <p>Você foi convidado para acessar a plataforma Routevoy como <strong>${role}</strong>.</p>
              <p>Para começar, por favor crie sua conta acessando o link abaixo com este mesmo e-mail (${email}):</p>
              <p>
                <a href="${invitationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 10px;">
                  Aceitar Convite
                </a>
              </p>
              <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
                Ou copie e cole o link no seu navegador:<br/>
                <a href="${invitationUrl}" style="color: #0066cc;">${invitationUrl}</a>
              </p>
              <br/>
              <p>Atenciosamente,<br/>Equipe Routevoy</p>
            </div>
          `,
        }),
      })

      if (!res.ok) {
        const error = await res.text()
        console.error('Resend error:', error)
        throw new Error(`Failed to send email via Resend: ${error}`)
      }
      emailSent = true
      provider = 'resend'
    } else {
      console.log(
        `Mock email sent to ${email} for role ${role}. URL: ${invitationUrl}`,
      )
      emailSent = true
    }

    return new Response(
      JSON.stringify({ success: true, emailSent, provider, email }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
