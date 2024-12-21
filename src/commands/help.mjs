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
  options: [
    {
      name: "silent",
      description: "Whether the message should be hidden from everyone or not",
      type: "stringchoices",
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
    try {
      const silentOption = interaction.options.getString("silent") || "false";
      const silent = silentOption === "true";

      const commands = client.commands.filter((cmd) => cmd.category && cmd.category !== "kontol");

      if (!commands.size) {
        return interaction.reply({
          content: "No commands available.",
          ephemeral: silent,
        });
      }

      const categories = [];
      commands.forEach((cmd) => {
        if (!categories.includes(cmd.category)) {
          categories.push(cmd.category);
        }
      });

      const homepage = client.embed.create({
        title: "Welcome to the Help Command",
        description: "Here you can find all the available commands for this bot. Use the navigation buttons to view them by category.",
        footer: {
          text: `Requested by ${interaction.user.username} | Page 1 of ${categories.length + 1}`,
          iconURL: interaction.user.displayAvatarURL({
            dynamic: true,
          }),
        },
      });

      const embeds = [{ embeds: [homepage] }];

      let currentPage = 2;

      for (const category of categories) {
        const categoryCommands = commands.filter((cmd) => cmd.category === category);
        const text = categoryCommands.map((cmd) => `${cmd.mention} - ${cmd.description}`);

        const embed = client.embed.create({
          title: category ? category.charAt(0).toUpperCase() + category.slice(1) + " " + "Category" : "Uncategorized",
          description: text.length ? text.map((cmd, index) => `**${index + 1}**. ${cmd}`).join("\n") : "No commands in this category",
          footer: {
            text: `Requested by ${interaction.user.username} | Page ${currentPage} of ${categories.length + 1}`,
            iconURL: interaction.user.displayAvatarURL({
              dynamic: true,
            }),
          },
        });

        embeds.push({ embeds: [embed] });
        currentPage++;
      }

      await client.utils.paginator.paginate(interaction, embeds, {
        timeout: 120000,
        ephemeral: silent,
      });
    } catch (error) {
      client.logger.error(`Error executing help command: ${error.message}`);
      return interaction.reply({
        content: "An error occurred while processing the help command.",
        ephemeral: true,
      });
    }
  },
};
