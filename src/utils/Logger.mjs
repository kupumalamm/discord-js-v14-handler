import { validColors } from "../data/ValidColors.mjs";
import { Time } from "./Time.mjs";
import { WebhookClient } from "discord.js";

export const time = new Time(undefined);

/**
 * Displays a colorful log in the console and optionally sends it to a Discord webhook.
 *
 * @param {string[]} colorDisplay - Array of valid color keys for the console log.
 * @param {string} text - The text to be displayed in the log.
 * @param {boolean} dateEnabled - Whether to include a timestamp.
 * @param {string} [prefix] - Optional prefix for the log.
 * @param {string} [webhookUrl] - Discord webhook URL for sending logs.
 * @returns {void}
 */
export const color_log = (
  colorDisplay = ["FgGreen"],
  text = "No Text added",
  dateEnabled = true,
  prefix,
  webhookUrl
) => {
  const color = colorDisplay
    .map((col) => validColors[col] || validColors.FgWhite)
    .join(" ");

  if (text instanceof Error) {
    text = `Error: ${text.message}\nStack Trace: ${text.stack}`;
  }

  const logPrefix = prefix
    ? `${validColors.BgBlue}${validColors.FgWhite} ${prefix} ${validColors.Reset}${validColors.FgRed}[::]`
    : "";

  const dateTime = dateEnabled
    ? `${validColors.FgMagenta}${time.getDateTimeString()} ${validColors.FgRed}[::]`
    : "";

  const formattedLog = `${dateTime} ${logPrefix} ${color}${text}${validColors.Reset}`;

  if (webhookUrl) {
    try {
      const webhookClient = new WebhookClient({ url: webhookUrl });
      const content = `${dateTime}${logPrefix}\`\`\`js\n${text}\n\`\`\``;
      webhookClient
        .send(content)
        .catch((err) => console.error("Failed to send log to Discord webhook:", err));
    } catch (error) {
      console.error("Error initializing WebhookClient:", error);
    }
  }

  return console.log(formattedLog);
};

/**
 * Logger class with colorful output.
 */
export class Logger {
  /**
   * Creates a Logger instance with options.
   *
   * @param {Object} [options={}] - Logger configuration options.
   * @param {string|false} [options.prefix="INFO-LOG"] - Prefix for log messages.
   * @param {boolean} [options.dateEnabled=true] - Whether to include timestamps in log messages.
   * @param {0|1|2|3|4|5} [options.logLevel=1] - Log level (0 = debug, 1 = log, 2 = info, 3 = success, 4 = warn, 5 = error).
   * @param {string|false} [options.webhookUrl=false] - Discord webhook URL for sending logs.
   */
  constructor(options = {}) {
    this.prefix = options.prefix ?? "INFO-LOG";
    this.dateEnabled = options.dateEnabled ?? true;
    this.logLevel = Number.isInteger(options.logLevel) ? options.logLevel : 1;
    this.webhookUrl = options.webhookUrl || false;
  }

  /**
   * Handles a log message with colorful output.
   *
   * @param {string[]} colors - Colors for the message.
   * @param {string} level - Log level label.
   * @param {any[]} text - Log content.
   * @returns {void}
   */
  _log(colors, level, text) {
    const logText = Array.isArray(text) && text.length ? text.join(" ") : "No content provided";
    const prefix = typeof this.prefix === "string" ? `${this.prefix} - ${level}` : level;
    return color_log(colors, logText, this.dateEnabled, prefix, this.webhookUrl);
  }

  debug(...text) {
    if (this.logLevel > 0) return;
    return this._log(["FgWhite", "Dim"], "Debug", text);
  }

  log(...text) {
    if (this.logLevel > 1) return;
    return this._log(["FgCyan"], "Log", text);
  }

  info(...text) {
    if (this.logLevel > 2) return;
    return this._log(["FgBlue", "Bright"], "Info", text);
  }

  success(...text) {
    if (this.logLevel > 3) return;
    return this._log(["FgGreen", "Bright", "BgBlack"], "Success", text);
  }

  warn(...text) {
    if (this.logLevel > 4) return;
    return this._log(["FgYellow", "Bright"], "Warn", text);
  }

  error(...text) {
    if (this.logLevel > 5) return;

    text.forEach((item) => {
      if (item instanceof Error) {
        return this._log(["FgRed", "Bright"], "Error", [
          `Error: ${item.message}`,
          `Stack Trace: ${item.stack}`,
        ]);
      }
    });

    return this._log(["FgRed", "Bright"], "Error", text);
  }

  pure(...text) {
    return console.log(...text);
  }
}
