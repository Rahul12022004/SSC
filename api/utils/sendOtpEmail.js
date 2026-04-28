/* global process */
import { Resend } from "resend";

/**
 * Centralized OTP email sender.
 *
 * Uses a single Resend client + a single template so the look-and-feel of
 * "register OTP" and "resend OTP" stay in sync.  The sender address is
 * read from RESEND_FROM (the verified domain in Resend).  RESEND_API_KEY
 * is consumed by the SDK at construction time.
 */
const resend = new Resend(process.env.RESEND_API_KEY);

const buildTemplate = ({ firstName, otp, heading, intro }) => `
  <div style="font-family:Inter,Segoe UI,sans-serif;max-width:480px;margin:auto;padding:32px;background:#f8fafc;border-radius:12px">
    <h2 style="color:#0b2545;margin:0 0 8px">${heading}</h2>
    <p style="color:#475569;margin:0 0 24px;line-height:1.5">
      Hi ${firstName || "there"}, ${intro}
      This code expires in <strong>10 minutes</strong>.
    </p>
    <div style="font-size:36px;font-weight:700;letter-spacing:10px;color:#f77f00;text-align:center;padding:20px;background:#fff;border-radius:10px;border:2px dashed #f77f00;margin-bottom:20px">
      ${otp}
    </div>
    <p style="color:#94a3b8;font-size:12px;margin:0">
      If you did not request this email, you can safely ignore it.
    </p>
  </div>
`;

/**
 * Send a 6-digit OTP to the given user.
 *
 * @param {Object}  params
 * @param {string}  params.to         Recipient email address.
 * @param {string}  params.firstName  Used for personalised greeting.
 * @param {string}  params.otp        6-digit code.
 * @param {"register"|"resend"} [params.context]  Controls subject & copy.
 *
 * @returns {Promise<void>} Resolves on success, throws on transport error.
 */
export const sendOtpEmail = async ({ to, firstName, otp, context = "register" }) => {
  if (!process.env.RESEND_FROM) {
    throw new Error("RESEND_FROM env var is not configured");
  }

  const isResend = context === "resend";

  const subject = isResend
    ? "Your new SSC Pathnirman OTP"
    : "Verify your SSC Pathnirman email";

  const heading = isResend ? "New verification code" : "Verify your email";

  const intro = isResend
    ? "here is the new OTP you requested."
    : "thanks for signing up. Use the code below to verify your email and unlock your account.";

  await resend.emails.send({
    from: process.env.RESEND_FROM,
    to,
    subject,
    html: buildTemplate({ firstName, otp, heading, intro }),
  });
};

export default sendOtpEmail;
