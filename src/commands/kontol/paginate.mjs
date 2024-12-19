import { optionTypes } from "../../cores/BotClient.mjs";

export default {
  name: "paginate",
  description: "Test",
  category: "kontol",
  cooldown: {
    user: 5000,
    guild: 0,
    global: 0,
  },
  options: [
    {
      name: "ephemeral",
      description: "Whether the message should be hide from everyone or not",
      type: optionTypes.stringchoices,
      required: false,
      choices: [
        {
          name: "True",
          value: "true",
        },
        {
          name: "False",
          value: "false",
        },
      ],
    },
  ],
  async execute(client, interaction) {
    const ephemeral = await interaction.options.getString("ephemeral") || false;

    await client.utils.paginator.paginate(interaction, ["Page 1", "Page 2", "Page 3", "Page 4", "Page 5", "Page 6", "Page 7", "Page 8", "Page 9", "Page 10"], { timeout: 120000, ephemeral });
  }
}