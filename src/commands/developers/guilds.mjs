import { optionTypes } from "../../cores/BotClient.mjs";

export default {
  name: "guilds",
  description: "List all servers where the bot is currently in.",
  developerOnly: true,
  category: "developers",
  cooldown: {
    user: 10000,
    guild: 0,
    global: 0,
  },
  options: [
    {
      name: "limit",
      description: "The number of guilds to display (default: 10).",
      type: optionTypes.number,
      required: false,
    },
  ],
  async execute(client, interaction) {
    const limit = interaction.options.getNumber("limit") || 10;

    if (limit <= 0) {
      return interaction.reply({
        content: "❌ The limit must be a positive number.",
        ephemeral: true,
      });
    }

    const guilds = client.guilds.cache.map(
      (guild) => `- name: ${guild.name}\n  id: ${guild.id}\n  members: ${guild.memberCount || "Unknown"}`
    );

    const totalGuilds = guilds.length;

    const displayedGuilds = guilds.slice(0, limit).join("\n\n");

    await interaction.reply({
      content: `📋 **Guilds (Showing ${Math.min(limit, totalGuilds)}/${totalGuilds}):**\n\`\`\`yaml\n${displayedGuilds}\n\`\`\``,
      ephemeral: true,
    });
  },
};
