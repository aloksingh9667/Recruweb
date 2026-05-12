import nodemailer from "nodemailer";
import { logger } from "./logger.js";

function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const host = process.env.EMAIL_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.EMAIL_PORT || "587", 10);

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const FROM_NAME  = "Recruweb";
const FROM_EMAIL = process.env.EMAIL_USER || "noreply@recruweb.in";

const STATUS_LABELS = {
  pending:             "Pending Review",
  reviewed:            "Application Under Review",
  shortlisted:         "Shortlisted",
  interview_scheduled: "Interview Scheduled",
  hired:               "Hired — Congratulations!",
  rejected:            "Application Not Selected",
};

const STATUS_COLORS = {
  pending:             "#6366f1",
  reviewed:            "#3b82f6",
  shortlisted:         "#a855f7",
  interview_scheduled: "#14b8a6",
  hired:               "#22c55e",
  rejected:            "#ef4444",
};

function baseHtml(title, bodyHtml) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:24px 32px">
            <div style="font-size:20px;font-weight:800;color:#fff">Recruweb</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.75);margin-top:2px">Recruweb Resources Pvt. Ltd.</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px">
            <h1 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 16px">${title}</h1>
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px 24px;border-top:1px solid #e5e7eb">
            <p style="font-size:11px;color:#9ca3af;margin:0">© 2025 Recruweb Resources Pvt. Ltd. · Noida & Delhi NCR</p>
            <p style="font-size:11px;color:#9ca3af;margin:4px 0 0">This is an automated notification from Recruweb.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendEmail({ to, subject, html }) {
  const transporter = createTransporter();
  if (!transporter) {
    logger.info({ to, subject }, "Email skipped — EMAIL_USER/EMAIL_PASS not configured");
    return;
  }
  try {
    await transporter.sendMail({ from: `"${FROM_NAME}" <${FROM_EMAIL}>`, to, subject, html });
    logger.info({ to, subject }, "Email sent");
  } catch (err) {
    logger.error({ err, to, subject }, "Email send failed");
  }
}

export async function sendApplicationReceivedEmail({ to, employerName, candidateName, jobTitle, applicationId }) {
  const subject = `New Application Received — ${jobTitle}`;
  const html = baseHtml("New Application Received", `
    <p style="font-size:14px;color:#374151;margin:0 0 16px">Hi ${employerName},</p>
    <p style="font-size:14px;color:#374151;margin:0 0 20px">
      A new application has been submitted for your job posting.
    </p>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;margin-bottom:24px">
      <div style="font-size:12px;color:#6b7280;margin-bottom:4px">Job Position</div>
      <div style="font-size:16px;font-weight:700;color:#111827">${jobTitle}</div>
      <div style="margin-top:12px;font-size:12px;color:#6b7280">Candidate</div>
      <div style="font-size:14px;font-weight:600;color:#6366f1">${candidateName}</div>
    </div>
    <p style="font-size:13px;color:#6b7280;margin:0">
      Log in to your Recruweb employer dashboard to review this application and update its status.
    </p>
  `);
  await sendEmail({ to, subject, html });
}

export async function sendStatusChangedEmail({ to, candidateName, jobTitle, company, status }) {
  const label = STATUS_LABELS[status] || status;
  const color = STATUS_COLORS[status] || "#6366f1";
  const subject = `Application Update: ${label} — ${jobTitle}`;
  const companyStr = company ? ` at ${company}` : "";
  const encouragement = {
    reviewed:            "Your application is actively being evaluated — great news!",
    shortlisted:         "You've made it to the shortlist. Stay prepared!",
    interview_scheduled: "Get ready — an interview is on the way. Best of luck!",
    hired:               "Congratulations on your new role! Wishing you a great journey ahead.",
    rejected:            "Don't be discouraged — keep applying. The right opportunity is out there for you.",
    pending:             "Your application has been received and is pending review.",
  }[status] || "";

  const html = baseHtml("Application Status Update", `
    <p style="font-size:14px;color:#374151;margin:0 0 16px">Hi ${candidateName},</p>
    <p style="font-size:14px;color:#374151;margin:0 0 20px">
      There's an update on your application for <strong>${jobTitle}${companyStr}</strong>.
    </p>
    <div style="background:#f9fafb;border:1.5px solid ${color};border-radius:10px;padding:16px 20px;margin-bottom:20px">
      <div style="font-size:12px;color:#6b7280;margin-bottom:4px">New Status</div>
      <div style="font-size:16px;font-weight:800;color:${color}">${label}</div>
    </div>
    ${encouragement ? `<p style="font-size:14px;color:#374151;margin:0 0 16px">${encouragement}</p>` : ""}
    <p style="font-size:13px;color:#6b7280;margin:0">
      Log in to your Recruweb candidate dashboard to view your full application history.
    </p>
  `);
  await sendEmail({ to, subject, html });
}
