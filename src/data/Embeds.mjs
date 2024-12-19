import { EmbedBuilder, resolveColor } from "discord.js";

export default class Embeds {
  /**
   * @param {import('../cores/BotClient.mjs').BotClient} client - The bot client instance.
   */
  constructor(client) {
    this.client = client;
    this.colors = {
      normal: "#5865f2",
      success: "#57f287",
      warning: "#fee75c",
      error: "#ed4245",
    };
  }

  /**
   * Creates a new embed with the provided parameters.
   *
   * @param {Object} options - Options for customizing the embed.
   * @param {string} options.title - The title of the embed.
   * @param {string} options.description - The description text of the embed.
   * @param {string|null} [options.color] - A custom HEX color or resolved color for the embed.
   * @param {import("discord.js").EmbedFieldData[]} [options.fields] - Array of fields to include in the embed.
   * @param {import("discord.js").EmbedFooterData} [options.footer] - Footer data for the embed.
   * @param {import("discord.js").EmbedImageData} [options.image] - Image URL for the embed.
   * @param {import("discord.js").EmbedThumbnailData} [options.thumbnail] - Thumbnail URL for the embed.
   * @param {import("discord.js").EmbedAuthorData} [options.author] - Author data for the embed.
   * @param {"normal" | "success" | "warning" | "error"} [options.type] - Type of the embed (determines color if no custom color is provided).
   * @param {boolean} [options.timestamps=true] - Whether to include a timestamp in the footer.
   * @returns {import("discord.js").EmbedBuilder} - Returns an EmbedBuilder instance.
   */
  create({
    title,
    description,
    color = null,
    fields = [],
    footer = null,
    image = null,
    thumbnail = null,
    author = null,
    type = "normal",
    timestamps = true,
  }) {
    const embedColor = color
      ? resolveColor(color)
      : resolveColor(this.colors[type] || this.colors.normal);

    const time = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour12: false,
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });

    const embed = new EmbedBuilder().setColor(embedColor);

    if (footer) {
      if (footer.text) {
        let footerText = footer.text;
        if (timestamps) {
          footerText += ` | ${time}`;
        }

        const footerData = { text: footerText };
        if (footer.iconURL) {
          footerData.iconURL = footer.iconURL;
        }

        embed.setFooter(footerData);
      }
    } else {
      if (timestamps) {
        embed.setFooter({
          text: `${this.client.user.username} | ${time}`,
          iconURL: this.client.user.displayAvatarURL({ dynamic: true }),
        });
      } else {
        embed.setFooter({
          text: this.client.user.username,
          iconURL: this.client.user.displayAvatarURL({ dynamic: true }),
        });
      }
    }

    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    if (fields.length > 0) embed.addFields(fields);
    if (image) embed.setImage(image);
    if (thumbnail) embed.setThumbnail(thumbnail);
    if (author) embed.setAuthor(author);

    return embed;
  }
}
