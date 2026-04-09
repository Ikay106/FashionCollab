// backend/lib/email.js
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses')

const ses = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
})

const FROM = process.env.SES_FROM_EMAIL

/**
 * Core send function
 */
const sendEmail = async ({ to, subject, html }) => {
  const command = new SendEmailCommand({
    Source: `FashionCollab <${FROM}>`,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject, Charset: 'UTF-8' },
      Body: {
        Html: { Data: html, Charset: 'UTF-8' }
      }
    }
  })

  try {
    await ses.send(command)
    console.log(`Email sent to ${to} — "${subject}"`)
  } catch (err) {
    // Never crash the app if email fails — just log it
    console.error(`Email failed to ${to}:`, err.message)
  }
}

/**
 * 1. Invite sent → notify the invitee
 */
const sendInviteEmail = async ({ toEmail, inviteeName, projectTitle, ownerName, projectId }) => {
  await sendEmail({
    to: toEmail,
    subject: `You've been invited to collaborate on "${projectTitle}"`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
        <div style="margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 700; margin: 0; color: #0f172a;">FashionCollab</h1>
        </div>

        <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 12px;">You've been invited to a project</h2>

        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
          Hi ${inviteeName || 'there'},<br/><br/>
          <strong>${ownerName || 'Someone'}</strong> has invited you to collaborate on
          <strong>"${projectTitle}"</strong> on FashionCollab.
        </p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
          <p style="margin: 0; font-size: 14px; color: #64748b;">Project</p>
          <p style="margin: 4px 0 0; font-size: 18px; font-weight: 600; color: #0f172a;">${projectTitle}</p>
        </div>

        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 28px;">
          Log in to FashionCollab to view the invite and accept or decline.
        </p>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 8px;">
          <p style="margin: 0; font-size: 13px; color: #94a3b8;">
            You're receiving this because your email is registered on FashionCollab.
          </p>
        </div>
      </div>
    `
  })
}

/**
 * 2. Invite accepted → notify the project owner
 */
const sendAcceptedEmail = async ({ toEmail, ownerName, inviteeName, inviteeRole, projectTitle, projectId }) => {
  await sendEmail({
    to: toEmail,
    subject: `${inviteeName || 'Someone'} accepted your invite to "${projectTitle}"`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
        <div style="margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 700; margin: 0; color: #0f172a;">FashionCollab</h1>
        </div>

        <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 12px;">Invite accepted 🎉</h2>

        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
          Hi ${ownerName || 'there'},<br/><br/>
          <strong>${inviteeName || 'A collaborator'}</strong>${inviteeRole ? ` (${inviteeRole})` : ''} has accepted your invite
          and joined <strong>"${projectTitle}"</strong>.
        </p>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
          <p style="margin: 0; font-size: 14px; color: #16a34a;">New team member</p>
          <p style="margin: 4px 0 0; font-size: 18px; font-weight: 600; color: #0f172a;">${inviteeName || 'Unknown'}</p>
          ${inviteeRole ? `<p style="margin: 4px 0 0; font-size: 14px; color: #64748b;">${inviteeRole}</p>` : ''}
        </div>

        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 28px;">
          Head over to FashionCollab to see your updated team.
        </p>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 8px;">
          <p style="margin: 0; font-size: 13px; color: #94a3b8;">
            You're receiving this because you own this project on FashionCollab.
          </p>
        </div>
      </div>
    `
  })
}

/**
 * 3. Invite declined → notify the project owner
 */
const sendDeclinedEmail = async ({ toEmail, ownerName, inviteeName, projectTitle }) => {
  await sendEmail({
    to: toEmail,
    subject: `${inviteeName || 'Someone'} declined your invite to "${projectTitle}"`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
        <div style="margin-bottom: 32px;">
          <h1 style="font-size: 24px; font-weight: 700; margin: 0; color: #0f172a;">FashionCollab</h1>
        </div>

        <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 12px;">Invite declined</h2>

        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
          Hi ${ownerName || 'there'},<br/><br/>
          <strong>${inviteeName || 'A collaborator'}</strong> has declined your invite
          to join <strong>"${projectTitle}"</strong>.
        </p>

        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
          <p style="margin: 0; font-size: 14px; color: #dc2626;">Declined invite</p>
          <p style="margin: 4px 0 0; font-size: 18px; font-weight: 600; color: #0f172a;">${projectTitle}</p>
        </div>

        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 28px;">
          You can invite someone else from the project page on FashionCollab.
        </p>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 8px;">
          <p style="margin: 0; font-size: 13px; color: #94a3b8;">
            You're receiving this because you own this project on FashionCollab.
          </p>
        </div>
      </div>
    `
  })
}

module.exports = { sendInviteEmail, sendAcceptedEmail, sendDeclinedEmail }