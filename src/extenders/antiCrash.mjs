/** @param {import("../cores/BotClient.mjs").BotClient} client - the bot client instance */
export default (client) => {
  /**
   * Handles unhandled promise rejections to prevent crashes.
   * Logs the reason and promise that caused the rejection.
   */
  process.on('unhandledRejection', (reason, p) => {
    console.log(' [antiCrash] :: Unhandled Rejection/Catch');
    console.log(reason, p);
  });

  /**
   * Handles uncaught exceptions to prevent crashes.
   * Logs the error and its origin for debugging purposes.
   */
  process.on("uncaughtException", (err, origin) => {
    console.log(' [antiCrash] :: Uncaught Exception/Catch');
    console.log(err, origin);
  });

  /**
   * Monitors uncaught exceptions specifically for logging and debugging.
   * This does not replace the default uncaughtException handler.
   */
  process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.log(' [antiCrash] :: Uncaught Exception/Catch (MONITOR)');
    console.log(err, origin);
  });
};
