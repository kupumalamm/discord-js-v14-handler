/** @type {import("../data/BotTypes.mjs").CommandExport} */
export default {
  name: "help",
  description: "Shows the list of commands",
  category: "bot",
  cooldown: {
    user: 5000,
    guild: 0,
    global: 0,
  },
  options: [],
  async execute(client, interaction) {
    await interaction.reply({
      ephemeral: true,
      content: `Here is the list of commands:\n${client.commands.map((c, i) => `**${i + 1}**. ${c.mention} - ${c.description}`).join("\n")}`,
    });
  }
}
