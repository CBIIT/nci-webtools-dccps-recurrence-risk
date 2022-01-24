import { createTransport } from "nodemailer";

export function getSmtpTransport(env = process.env) {
  const { EMAIL_SMTP_HOST, EMAIL_SMTP_PORT, EMAIL_SMTP_USER, EMAIL_SMTP_PASSWORD } = env;

  let config = {
    host: EMAIL_SMTP_HOST,
    port: EMAIL_SMTP_PORT,
  };

  if (EMAIL_SMTP_USER && EMAIL_SMTP_PASSWORD) {
    config.auth = {
      user: EMAIL_SMTP_USER,
      pass: EMAIL_SMTP_PASSWORD,
    };
  }

  return createTransport(config);
}
