import { Collection, InteractionType } from "discord.js";
import { slashCommandHandler } from "../../../handlers/SlashCommandHandler.mjs";
import { contextMenuHandler } from "../../../handlers/ContextMenuHandler.mjs";

/** 
 * @param {import("../../../cores/BotClient.mjs").BotClient} client
 * @param {import("discord.js").Interaction} interaction
*/
export default async (client, interaction) => {
  if (interaction.guildId && !interaction.guild) return;

  interaction.user = interaction.user ?? client.users.cache.get(interaction.user.id) ?? await client.users.fetch(interaction.user.id).catch(() => null);
  interaction.member = interaction.member ?? interaction.guild.members.cache.get(interaction.user.id) ?? await interaction.guild.members.fetch(interaction.user.id).catch(() => null)
  interaction.attachments = new Collection();

  if (interaction.isUserContextMenuCommand() || interaction.isMessageContextMenuCommand()) return contextMenuHandler(client, interaction);

  if (interaction.type === InteractionType.ApplicationCommand) return slashCommandHandler(client, interaction);
}
