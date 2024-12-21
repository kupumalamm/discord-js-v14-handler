import { PermissionFlagsBits } from "discord.js";
import { checkCommand, parseSlashCommandKey } from "./SlashCommandHandler.mjs";

/** 
 * @param {import("../structures/BotClient.mjs").BotClient} client
 * @param {import("discord.js").CommandInteraction} interaction
 */
export async function contextMenuHandler(client, interaction) {

  if (!client.utils.perms.checkPerms(interaction.channel, [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel])) {
    return interaction.reply({
      ephemeral: true,
      embeds: [
        client.embed.create({
          title: "Permission Error",
          description: `${client.DeezEmojis.error.str} I can't view or send messages in this channel.`,
          type: "error",
        }),
      ],
    });
  }

  const contextCmd = client.commands.get(parseSlashCommandKey(interaction, true));

  if (!client.utils.perms.checkPerms(interaction.channel, [PermissionFlagsBits.EmbedLinks])) {
    return interaction.reply({
      ephemeral: true,
      embeds: [
        client.embed.create({
          title: "Permission Error",
          description: ">>> I need permission to embed links in this channel.",
          type: "error",
        }),
      ],
    });
  }

  if (contextCmd) {
    try {
      if (!(await checkCommand(client, contextCmd, interaction))) return;

      await contextCmd.execute(client, interaction);
    } catch (e) {
      client.logger.error(e);
      const content = `**Something went wrong while executing \`${contextCmd?.name || "???"}\`:**\`\`\`\n${String(e?.message ?? e).substring(0, 500)}\n\`\`\``.substring(0, 1000);
      const errorEmbed = client.embed.create({
        title: "Execution Error",
        description: `>>> ${content}`,
        type: "error",
      });

      if (interaction.replied) {
        interaction.channel.send({ embeds: [errorEmbed] }).catch(() => null);
      } else {
        interaction.reply({ embeds: [errorEmbed], ephemeral: true }).catch(() => {
          interaction.channel.send({ embeds: [errorEmbed] }).catch(() => null);
        });
      }
    }
  }
}
