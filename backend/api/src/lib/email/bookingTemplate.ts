function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

const logoUrl = 'https://ngwmultiservices.com/logo.png'

function detailValue(label: string, value: string) {
  if (label === 'Statut') {
    return `<span style="display:inline-block;background:#f5b301;color:#071b4b;font-size:12px;font-weight:700;letter-spacing:0.02em;padding:3px 8px;border-radius:999px;">${escapeHtml(value)}</span>`
  }
  return `<span style="color:#071b4b;font-size:14px;font-weight:700;">${escapeHtml(value)}</span>`
}

function shell(options: {
  title: string
  intro: string
  bodyHtml: string
  ctaHref?: string
  ctaLabel?: string
}) {
  const cta =
    options.ctaHref && options.ctaLabel
      ? `<tr>
              <td style="padding:4px 12px 12px;font-family:Arial,Helvetica,sans-serif;">
                <a href="${escapeHtml(options.ctaHref)}" style="display:inline-block;background:#0755f5;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:10px 14px;border-radius:8px;">${escapeHtml(options.ctaLabel)}</a>
              </td>
            </tr>`
      : ''

  return `<!DOCTYPE html>
<html lang="fr">
  <body style="margin:0;padding:0;background:#f1f5fc;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5fc;margin:0;padding:0;">
      <tr>
        <td align="center" style="padding:8px 4px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#ffffff;border:1px solid #d9e2f2;border-radius:10px;overflow:hidden;">
            <tr>
              <td style="background:#071b4b;padding:10px 12px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-right:8px;vertical-align:middle;">
                      <img src="${logoUrl}" width="40" height="42" alt="Ngw Multiservices" style="display:block;border:0;width:40px;height:42px;" />
                    </td>
                    <td style="vertical-align:middle;font-family:Arial,Helvetica,sans-serif;">
                      <div style="font-size:15px;font-weight:700;line-height:1.15;letter-spacing:0.01em;">
                        <span style="color:#e52329;">NGW</span>
                        <span style="color:#ffffff;"> MULTISERVICES</span>
                      </div>
                      <div style="margin-top:2px;font-size:10px;line-height:1.2;color:#f5b301;">Cleaning . Moving . Maintenance</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="height:3px;background:#f5b301;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:12px 12px 4px;font-family:Arial,Helvetica,sans-serif;">
                <h1 style="margin:0 0 6px;font-size:18px;line-height:1.25;color:#071b4b;">${escapeHtml(options.title)}</h1>
                <p style="margin:0 0 10px;font-size:14px;line-height:1.45;color:#3d4d6b;">${escapeHtml(options.intro)}</p>
                ${options.bodyHtml}
              </td>
            </tr>
            ${cta}
            <tr>
              <td style="background:#071b4b;padding:10px 12px;font-family:Arial,Helvetica,sans-serif;color:#ffffff;font-size:11px;line-height:1.5;">
                <div>613-698-2837</div>
                <div>ngwmultiservice@gmail.com</div>
                <div><a href="https://ngwmultiservices.com" style="color:#f5b301;text-decoration:none;">ngwmultiservices.com</a></div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

export function renderBookingEmail(title: string, intro: string, rows: Array<[string, string]>) {
  const details = rows
    .filter(([, value]) => value.trim())
    .map(
      ([label, value], index, list) => `
        <tr>
          <td style="padding:6px 8px;${index === list.length - 1 ? '' : 'border-bottom:1px solid #e4ebf7;'}color:#5b6b8a;font-size:12px;width:88px;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:6px 8px;${index === list.length - 1 ? '' : 'border-bottom:1px solid #e4ebf7;'}vertical-align:top;">${detailValue(label, value)}</td>
        </tr>`,
    )
    .join('')

  return shell({
    title,
    intro,
    bodyHtml: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#f1f5fc;border-radius:6px;">${details}</table>`,
    ctaHref: 'https://ngwmultiservices.com',
    ctaLabel: 'Voir le site',
  })
}

export function renderResetPasswordEmail(resetUrl: string, email: string) {
  const safeUrl = escapeHtml(resetUrl)
  return shell({
    title: 'Réinitialiser votre mot de passe',
    intro: `Une demande de réinitialisation a été faite pour le compte ${email}. Le lien expire dans 1 heure.`,
    bodyHtml: `
      <p style="margin:0 0 8px;font-size:13px;line-height:1.45;color:#5b6b8a;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur&nbsp;:</p>
      <p style="margin:0 0 10px;font-size:12px;line-height:1.4;word-break:break-all;"><a href="${safeUrl}" style="color:#0755f5;text-decoration:underline;">${safeUrl}</a></p>
      <p style="margin:0;font-size:12px;line-height:1.45;color:#5b6b8a;">Si vous n’êtes pas à l’origine de cette demande, ignorez ce courriel. Votre mot de passe actuel restera inchangé.</p>`,
    ctaHref: resetUrl,
    ctaLabel: 'Choisir un nouveau mot de passe',
  })
}
