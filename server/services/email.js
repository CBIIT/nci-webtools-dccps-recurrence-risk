import { createTransport } from "nodemailer";

export function getSmtpTransport(env = process.env) {
  const { EMAIL_STMP_HOST, EMAIL_STMP_USER, EMAIL_STMP_PASSWORD } = env;

  let config = {
    host: EMAIL_STMP_HOST,
  };

  if (EMAIL_STMP_USER && EMAIL_STMP_PASSWORD) {
    config.auth = {
      user: EMAIL_STMP_USER,
      pass: EMAIL_STMP_PASSWORD,
    };
  }

  return createTransport(config);
}
