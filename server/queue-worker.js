import { getLogger } from "./services/logger.js";
import { getSmtpTransport } from "./services/email.js";
import { processMessages } from "./services/queue.js";
import { renderTemplate, stringifyCsv } from "./services/utils.js";
import { recurrence } from "./services/recurrence.js";

const logger = getLogger("recurrence-risk-queue");
const { SQS_QUEUE_NAME, SQS_VISIBILITY_TIMEOUT, SQS_POLL_INTERVAL, EMAIL_ADMINS, EMAIL_SENDER } = process.env;

processMessages({
  queueName: SQS_QUEUE_NAME,
  visibilityTimeout: SQS_VISIBILITY_TIMEOUT,
  pollInterval: SQS_POLL_INTERVAL,
  messageHandler: async (message) => {
    const mailer = getSmtpTransport(process.env);

    try {
      logger.info("Retrieved message from SQS queue");
      const { version, functionName, params } = message;
      const start = new Date().getTime();
      const results = await recurrence[version][functionName](params);
      const duration = new Date().getTime() - start;
      logger.info(`Finished calculation in ${duration / 1000}s, sending results`);

      await mailer.sendMail({
        from: EMAIL_SENDER,
        to: params.email,
        subject: "Recurrence Risk Tool Results",
        html: await renderTemplate("templates/user-success-email.html", params),
        attachments: [
          {
            filename: "results.csv",
            content: stringifyCsv(results),
          },
        ],
      });

      logger.info(`Sent results email to: ${params.email}`);
    } catch (exception) {
      logger.error(exception);

      const templateParams = {
        ...input.params,
        id: message.MessageId,
        exception,
      };

      await transport.sendMail({
        from: EMAIL_SENDER,
        to: EMAIL_ADMINS,
        subject: "Recurrence Risk Tool Failure",
        html: await renderTemplate("templates/admin-failure-email.html", templateParams),
      });

      if (input.params) {
        // send user failure email only if parameters are available
        await transport.sendMail({
          from: EMAIL_SENDER,
          to: input.params.email,
          subject: "Recurrence Risk Tool Results",
          html: await renderTemplate("templates/user-failure-email.html", templateParams),
        });
      }
    }
  },
});
