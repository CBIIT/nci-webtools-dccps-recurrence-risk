import { Router, json } from "express";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { withAsync } from "../services/middleware.js";
import { enqueue } from "../services/queue.js";
import { recurrence } from "../services/recurrence.js";
const { SQS_QUEUE_NAME, S3_BUCKET, S3_INPUT_KEY_PREFIX, S3_OUTPUT_KEY_PREFIX } = process.env;

export const api = Router();

api.use(json({ limit: "100MB" }));

api.get(
  "/ping",
  withAsync(async (request, response) => {
    response.json(await recurrence.ping());
  }),
);

api.post(
  "/:version(v1|v2)/risk/group-data",
  withAsync(async ({ body, params }, response) => {
    response.json(await recurrence[params.version].getRiskFromGroupData(body));
  }),
);

api.post(
  "/:version(v1|v2)/risk/individual-data",
  withAsync(async ({ body, params }, response) => {
    const shouldQueue = recurrence.shouldQueue(body);

    if (!body.queue && !shouldQueue) {
      response.json(await recurrence[params.version].getRiskFromIndividualData(body));
    } else {
      if (!body.email) {
        throw new Error("Please provide an email.");
      }
      response.json(
        await enqueue(
          {
            sqsQueueName: SQS_QUEUE_NAME,
            s3Bucket: S3_BUCKET,
            s3KeyPrefix: S3_INPUT_KEY_PREFIX,
          },
          {
            version: params.version,
            functionName: "getRiskFromIndividualData",
            params: {
              ...body,
              timestamp: new Date().toISOString(),
            },
          },
        ),
      );
    }
  }),
);

api.get(
  "/risk/individual-data/:id",
  withAsync(async ({ params }, response) => {
    if (!params.id) throw new Error("Please provide a valid id.");

    const s3 = new S3Client();
    const s3Response = await s3.send(
      new GetObjectCommand({
        Bucket: S3_BUCKET,
        Key: `${S3_OUTPUT_KEY_PREFIX}${params.id}.json`,
      }),
    );

    response.writeHead(200, { "Content-Type": "application/json" });
    for await (const chunk of s3Response.Body) {
      response.write(chunk);
    }
    response.end();
  }),
);
