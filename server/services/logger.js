import path from "path";
import util from "util";
import fs from "fs";
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
const { LOG_LEVEL, LOG_FOLDER } = process.env;

export function getLogger(name, level = LOG_LEVEL, folder = LOG_FOLDER) {
  let logFormat = format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.label({ label: name }),
    format.printf(({ label, timestamp, level, message }) =>
      [[label, process.pid, timestamp, level].map((s) => `[${s}]`).join(" "), util.format(message)].join(" - "),
    ),
  );

  let logTransports = [new transports.Console()];

  if (folder) {
    fs.mkdirSync(folder, { recursive: true });
    logTransports.push(
      new DailyRotateFile({
        filename: path.resolve(folder, `${name}-%DATE%.log`),
        datePattern: "YYYY-MM-DD-HH",
        zippedArchive: false,
        maxSize: "1024m",
        timestamp: true,
        maxFiles: "1d",
        prepend: true,
      }),
    );
  }

  return new createLogger({
    level: level || "info",
    format: logFormat,
    transports: logTransports,
    exitOnError: false,
  });
}
