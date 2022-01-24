import { randomBytes } from "crypto";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import {
  ChangeMessageVisibilityCommand,
  DeleteMessageCommand,
  GetQueueUrlCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";

/**
 * Helper function to enqueue a large message to SQS, using S3 to store the message.
 * @param {*} param0
 * @param {*} message
 * @returns
 */
export async function enqueue({ sqsQueueName, s3Bucket, s3KeyPrefix }, message) {
  const sqs = new SQSClient();
  const s3 = new S3Client();
  const id = randomBytes(16).toString("hex");
  const s3Key = `${s3KeyPrefix}${id}.json`;

  const { QueueUrl: queueUrl } = await sqs.send(
    new GetQueueUrlCommand({
      QueueName: sqsQueueName,
    }),
  );

  await s3.send(
    new PutObjectCommand({
      Bucket: s3Bucket,
      Key: s3Key,
      Body: JSON.stringify(message),
    }),
  );

  await sqs.send(
    new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageDeduplicationId: id,
      MessageGroupId: id,
      MessageBody: JSON.stringify({
        bucket: s3Bucket,
        key: s3Key,
      }),
    }),
  );

  return id;
}

/**
 * Processes large messages from a SQS queue which uses S3 as the storage mechanism.
 * @param {*} config
 */
export async function processMessages({
  queueName,
  visibilityTimeout = 60,
  pollInterval = 60,
  waitTime = 20,
  messageHandler,
  errorHandler = console.error,
}) {
  const s3 = new S3Client();
  const sqs = new SQSClient();

  try {
    const { QueueUrl: queueUrl } = await sqs.send(
      new GetQueueUrlCommand({
        QueueName: queueName,
      }),
    );

    // to simplify running multiple workers in parallel,
    // fetch one message at a time
    const data = await sqs.send(
      new ReceiveMessageCommand({
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 1,
        VisibilityTimeout: visibilityTimeout,
        WaitTimeSeconds: waitTime,
      }),
    );

    if (data.Messages && data.Messages.length > 0) {
      const message = data.Messages[0];
      const { bucket, key } = JSON.parse(message.Body);

      // while processing is not complete, update the message's visibilityTimeout
      const intervalId = setInterval(async () => {
        await sqs.send(
          new ChangeMessageVisibilityCommand({
            QueueUrl: queueUrl,
            ReceiptHandle: message.ReceiptHandle,
            VisibilityTimeout: visibilityTimeout,
          }),
        );
      }, 1000 * (visibilityTimeout / 2));

      try {
        const s3Response = await s3.send(
          new GetObjectCommand({
            Bucket: bucket,
            Key: key,
          }),
        );
        let messageBody = "";
        for await (const chunk of s3Response.Body) {
          messageBody += chunk;
        }
        await messageHandler(JSON.parse(messageBody));
      } catch (e) {
        await errorHandler(e, message);
      } finally {
        // remove original message from queue/bucket once processed
        clearInterval(intervalId);
        await sqs.send(
          new DeleteMessageCommand({
            QueueUrl: queueUrl,
            ReceiptHandle: message.ReceiptHandle,
          }),
        );
        await s3.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
          }),
        );
      }
    }
  } catch (e) {
    await errorHandler(e);
  } finally {
    // schedule processing next message
    setTimeout(
      () =>
        processMessages({
          queueName,
          visibilityTimeout,
          pollInterval,
          waitTime,
          messageHandler,
          errorHandler,
        }),
      1000 * pollInterval,
    );
  }
}
