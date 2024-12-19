import { BotClient } from "./cores/BotClient.mjs";

const client = new BotClient();

client.on("@KupumalamLoaded", () => {
  client.logger.info("Now starting the bot");

  client.login(client.config.bot.token).catch(e => {
    process.exit(1);
  })
})
