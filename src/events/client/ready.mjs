import { ActivityType } from "discord.js";

/**
 * Event handler executed when the bot is ready.
 * @param {import("../../cores/BotClient.mjs").BotClient} client - The bot client instance.
 */
export default async (client) => {
  client.logger.info(`Discord Bot is ready as ${client.user.tag}`);

  updateStatus(client);
  setInterval(() => updateStatus(client), client.utils.time.Millisecond.Minute(1));

  if (client.config.deploy.public === true) {
    await client.publishCommands(client.config.deploy.guildId || undefined);
  }

  client.prepareCommands();
};

/**
 * Updates the bot's status and activity.
 * @param {import("../../structures/BotClient.mjs").BotClient} client - The bot client instance.
 */
async function updateStatus(client) {
  try {
    const { guilds, members } = await client.cluster
      .broadcastEval("this.guildsAndMembers")
      .then((results) => ({
        guilds: results.reduce((sum, v) => sum + (v.guilds || 0), 0),
        members: results.reduce((sum, v) => sum + (v.members || 0), 0),
      }));

    const shardIds = [...client.cluster.ids.keys()];

    for (const shardId of shardIds) {
      client.user.setActivity(
        `Serving ${guilds} guilds and ${members} members on shard #${shardId}`,
        { type: ActivityType.Custom }
      );
    }
  } catch (error) {
    client.logger.error(`Failed to update status: ${error.message}`);
  }
}
