import { optionTypes } from "../../../cores/BotClient.mjs";

export default {
  name: "command",
  description: "Reload a specific command dynamically.",
  developerOnly: true,
  options: [
    {
      name: "name",
      description: "The name of the command to reload.",
      type: optionTypes.string,
      required: true,
    },
  ],
  async execute(client, interaction) {
    const commandName = interaction.options.getString("name");

    const reloadedCommand = await client.reloadCommand(commandName);

    if (reloadedCommand) {
      await interaction.reply({
        content: `✅ Successfully reloaded command: **${commandName}**.`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: `❌ Failed to reload command: **${commandName}**. Check the logs for details.`,
        ephemeral: true,
      });
    }
  },
};
