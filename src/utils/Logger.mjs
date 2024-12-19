import { validColors, validColorsStrings } from "../data/ValidColors.mjs";
import { Time } from "./Time.mjs";
import { WebhookClient } from "discord.js";

export const time = new Time(undefined);

/**
 * Function to display color-coded logs in the console and optionally send them to Discord webhook.
 * @param {string[]} Colordisplay - Array of valid color keys for the console log.
 * @param {string} text - The text to be displayed in the log.
 * @param {boolean} dateEnabled - Whether to include a timestamp in Cyan.
 * @param {string} [prefix] - Optional prefix to be displayed before the log text.
 * @param {string} [webhookUrl] - Discord webhook URL for sending logs (optional).
 */
export const color_log = (Colordisplay = ["FgGreen"], text = "No Text added", dateEnabled = true, prefix, webhookUrl) => {
  const color = Colordisplay.map(color => validColors[color] || validColors.FgWhite).join(` `);

  if (text instanceof Error) {
    text = `Error: ${text.message}\nStack Trace: ${text.stack}`;
  }

  if (!dateEnabled) {
    if (prefix) return console.log(
      validColors.FgCyan, prefix,
      validColors.FgRed, `[::]`,
      color, ...text, validColors.Reset
    );
    return console.log(color, ...text, validColors.Reset);
  }
  if (prefix) {
    return console.log(
      validColors.FgCyan, time.getDateTimeString(),
      validColors.FgRed, `[::]`,
      validColors.FgCyan, prefix,
      validColors.FgRed, `[::]`,
      color, ...text, validColors.Reset
    );
  }

  if (webhookUrl) {
    try {
      const webhookClient = new WebhookClient({ url: webhookUrl });
      const content = `${dateEnabled ? `${time.getDateTimeString()} [::] ` : ""}${prefix ? `${prefix} - ` : ""}\`\`\`js\n${text}\n\`\`\``;
      webhookClient.send(content).catch(err => console.error("Failed to send log to Discord webhook:", err));
    } catch (error) {
      console.error("Invalid Webhook URL or error initializing WebhookClient:", error);
    }
  }

  return console.log(
    validColors.FgCyan, time.getDateTimeString(),
    validColors.FgRed, `[::]`,
    color, ...text, validColors.Reset
  );
};

/**
 * Logger class to handle different levels of logging with custom configurations.
 */
export class Logger {
  /**
   * Creates a Logger instance with specified log level and settings.
   * @param {{prefix?: string|false, dateEnabled?: boolean, logLevel?: 0|1|2|3|4|5, webhookUrl?: string|false}} options - Options for the Logger.
   */
  constructor(options = {}) {
    this.prefix = options.prefix ?? "INFO-LOG";
    this.dateEnabled = options.dateEnabled ?? true;
    this.logLevel = Number.isInteger(options.logLevel) ? options.logLevel : 1;
    this.webhookUrl = options.webhookUrl || false;
  }

  /**
   * Internal method to handle log messages.
   * @param {string[]} colors - Color codes for the log message.
   * @param {string} level - Log level description.
   * @param {any[]} text - Content to log.
   */
  _log(colors, level, text) {
    if (!Array.isArray(text) || !text.length) text = ["No content provided"];
    const prefix = typeof this.prefix === "string" ? `${level} - ${this.prefix}` : level;
    return color_log(colors, text.join(" "), this.dateEnabled, prefix, this.webhookUrl);
  }

  debug(...text) {
    if (this.logLevel > 0) return;
    return color_log(["FgWhite", "Dim"], text, this.dateEnabled, this.prefix && typeof this.prefix === "string" ? `Debug  - ${this.prefix}` : "Debug", this.webhookUrl);
  }

  log(...text) {
    if (this.logLevel > 1) return;
    return color_log(["FgWhite"], text, this.dateEnabled, this.prefix && typeof this.prefix === "string" ? `Log    - ${this.prefix}` : "Log", this.webhookUrl);
  }

  info(...text) {
    if (this.logLevel > 2) return;
    return color_log(["FgCyan", "Bright"], text, this.dateEnabled, this.prefix && typeof this.prefix === "string" ? `Info   - ${this.prefix}` : "Info", this.webhookUrl);
  }

  success(...text) {
    if (this.logLevel > 3) return;
    return color_log(["FgGreen", "Bright"], text, this.dateEnabled, this.prefix && typeof this.prefix === "string" ? `Success- ${this.prefix}` : "Success", this.webhookUrl);
  }

  warn(...text) {
    if (this.logLevel > 4) return;
    return color_log(["FgYellow"], text, this.dateEnabled, this.prefix && typeof this.prefix === "string" ? `Warn   - ${this.prefix}` : "Warn", this.webhookUrl);
  }

  error(...text) {
    if (this.logLevel > 5) return;

    text.forEach(item => {
      if (item instanceof Error) {
        return color_log(["FgRed"], [`Error: ${item.message}\nStack Trace: ${item.stack}`], this.dateEnabled, this.prefix && typeof this.prefix === "string" ? `Error  - ${this.prefix}` : "Error", this.webhookUrl);
      }
    });

    return color_log(["FgRed"], text, this.dateEnabled, this.prefix && typeof this.prefix === "string" ? `Error  - ${this.prefix}` : "Error", this.webhookUrl);
  }

  pure(...text) {
    return console.log(...text);
  }
}
