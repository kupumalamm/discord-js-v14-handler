import { inspect } from "util";
import { optionTypes } from "../../cores/BotClient.mjs";

export default {
  name: "eval",
  description: "Evaluates JavaScript code, supports async/await and return",
  developerOnly: true,
  category: "developers",
  cooldown: {
    user: 5000,
    guild: 0,
    global: 0,
  },
  options: [
    {
      name: "code",
      description: "The code to evaluate",
      type: optionTypes.string,
      required: true,
    },
  ],
  async execute(client, interaction) {
    const code = interaction.options.getString("code");

    try {
      const asyncCode = code.includes("await") ? `(async () => { ${code} })()` : code;

      let result = await eval(asyncCode);

      let stringResult = "";
      if (typeof result === "string") {
        stringResult = result;
      } else {
        stringResult = inspect(result, { depth: 2, maxArrayLength: 10 });
      }

      const prefix = "✅ **Result:**\n";

      if (stringResult.length > 1890) {
        const chunkedResults = await client.utils.array.chunks(stringResult, 1890);

        await interaction.reply({
          content: `📋 **Result too long. Splitting into chunks:**`,
          ephemeral: true,
        });

        for (const chunk of chunkedResults) {
          await interaction.followUp({
            content: `\`\`\`js\n${chunk}\n\`\`\``,
            ephemeral: true,
          });
        }
      } else {
        await interaction.reply({
          content: `${prefix}\`\`\`js\n${stringResult}\n\`\`\``,
          ephemeral: true,
        });
      }
    } catch (error) {
      client.logger.error(error);
      await interaction.reply({
        content: `❌ **Error:**\n\`\`\`js\n${error.stack}\n\`\`\``,
        ephemeral: true,
      });
    }
  },
};
