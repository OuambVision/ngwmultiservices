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
    return `<span style="display:inline-block;background:#f5b301;color:#071b4b;font-size:12px;font-weight:700;letter-spacing:0.02em;padding:4px 10px;border-radius:999px;">${escapeHtml(value)}</span>`
  }
  return `<span style="color:#071b4b;font-size:15px;font-weight:700;">${escapeHtml(value)}</span>`
}

export function renderBookingEmail(title: string, intro: string, rows: Array<[string, string]>) {
  const details = rows
    .filter(([, value]) => value.trim())
    .map(
      ([label, value], index, list) => `
        <tr>
          <td style="padding:12px 16px;${index === list.length - 1 ? '' : 'border-bottom:1px solid #e4ebf7;'}color:#5b6b8a;font-size:13px;width:120px;vertical-align:middle;">${escapeHtml(label)}</td>
          <td style="padding:12px 16px;${index === list.length - 1 ? '' : 'border-bottom:1px solid #e4ebf7;'}vertical-align:middle;">${detailValue(label, value)}</td>
        </tr>`,
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="fr">
  <body style="margin:0;padding:0;background:#f1f5fc;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5fc;margin:0;padding:0;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;background:#ffffff;border:1px solid #d9e2f2;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="background:#071b4b;padding:28px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-right:14px;vertical-align:middle;">
                      <img src="${logoUrl}" width="72" height="76" alt="NGW MULTISERVICES" style="display:block;border:0;width:72px;height:76px;" />
                    </td>
                    <td style="vertical-align:middle;font-family:Arial,Helvetica,sans-serif;">
                      <div style="font-size:20px;font-weight:700;line-height:1.1;letter-spacing:0.01em;">
                        <span style="color:#e52329;">NGW</span>
                        <span style="color:#ffffff;"> MULTISERVICES</span>
                      </div>
                      <div style="margin-top:6px;font-size:12px;line-height:1.2;color:#f5b301;">Cleaning . Moving . Maintenance</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="height:5px;background:#f5b301;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:32px 32px 8px;font-family:Arial,Helvetica,sans-serif;">
                <h1 style="margin:0 0 12px;font-size:26px;line-height:1.25;color:#071b4b;">${escapeHtml(title)}</h1>
                <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#3d4d6b;">${escapeHtml(intro)}</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#f1f5fc;border-radius:12px;">
                  ${details}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 28px;font-family:Arial,Helvetica,sans-serif;">
                <a href="https://ngwmultiservices.com" style="display:inline-block;background:#0755f5;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 18px;border-radius:10px;">Voir le site</a>
              </td>
            </tr>
            <tr>
              <td style="background:#071b4b;padding:20px 32px;font-family:Arial,Helvetica,sans-serif;color:#ffffff;font-size:13px;line-height:1.7;">
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
