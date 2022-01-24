import { randomBytes } from "crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getLogger } from "./services/logger.js";
import { getSmtpTransport } from "./services/email.js";
import { processMessages } from "./services/queue.js";
import { renderTemplate, stringifyCsv } from "./services/utils.js";
import { recurrence } from "./services/recurrence.js";

const logger = getLogger("recurrence-risk-queue");
const {
  APP_BASE_URL,
  S3_BUCKET,
  S3_OUTPUT_KEY_PREFIX,
  SQS_QUEUE_NAME,
  SQS_VISIBILITY_TIMEOUT,
  SQS_POLL_INTERVAL,
  EMAIL_ADMINS,
  EMAIL_SENDER,
} = process.env;

processMessages({
  queueName: SQS_QUEUE_NAME,
  visibilityTimeout: SQS_VISIBILITY_TIMEOUT,
  pollInterval: SQS_POLL_INTERVAL,
  messageHandler: async (message) => {
    const s3 = new S3Client();
    const mailer = getSmtpTransport(process.env);

    try {
      logger.info("Retrieved message from SQS queue");
      const id = randomBytes(16).toString("hex");
      const { version, functionName, parameters } = message;
      const start = new Date().getTime();
      const results = await recurrence[version][functionName](parameters);
      const s3Results = JSON.stringify({ parameters, results });
      const s3ResultsKey = `${S3_OUTPUT_KEY_PREFIX}${id}.json`;
      const duration = new Date().getTime() - start;
      logger.info(`Finished calculation in ${duration / 1000}s, sending results`);

      await s3.send(
        new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: s3ResultsKey,
          Body: s3Results,
        }),
      );

      const emailParams = {
        ...parameters,
        resultsUrl: `${APP_BASE_URL}/#/individual-data/${id}`,
      };

      await mailer.sendMail({
        from: EMAIL_SENDER,
        to: parameters.email,
        subject: "Recurrence Risk Tool Results",
        html: await renderTemplate("templates/user-success-email.html", emailParams),
      });

      logger.info(`Sent results email to: ${params.email}`);
    } catch (exception) {
      logger.error(exception);

      const templateParams = {
        ...input.parameters,
        id: message.MessageId,
        exception,
      };

      await transport.sendMail({
        from: EMAIL_SENDER,
        to: EMAIL_ADMINS,
        subject: "Recurrence Risk Tool Failure",
        html: await renderTemplate("templates/admin-failure-email.html", templateParams),
      });

      if (input.parameters) {
        // send user failure email only if parameters are available
        await transport.sendMail({
          from: EMAIL_SENDER,
          to: input.parameters.email,
          subject: "Recurrence Risk Tool Results",
          html: await renderTemplate("templates/user-failure-email.html", templateParams),
        });
      }
    }
  },
});
