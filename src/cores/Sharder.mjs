import { ClusterManager } from 'discord-hybrid-sharding';
import Config from '../data/Config.mjs';
const validModes = ["process", "worker"];
const config = new Config();

/**
 * Retrieves the total number of shards for the ClusterManager.
 * This value must be greater than 0. Defaults to "auto" if not set or invalid.
 * 
 * @returns {"auto" | number} - Returns the total number of shards, or "auto" if it should be determined automatically.
 */
const getTotalShards = () => {
  // If total shards is not specified, return "auto"
  if (!config.shards.total) return "auto";

  // If the value is explicitly set to "auto", return "auto"
  if (config.shards.total.toLowerCase() === "auto") return "auto";

  // If the value is a valid number greater than 0, return that number
  if (!isNaN(config.shards.total) && Number(config.shards.total) > 0) return Number(config.shards.total);

  // Default to "auto" if the value is invalid
  return "auto";
}

/**
 * Retrieves the number of shards per cluster for the ClusterManager.
 * This value must be greater than 0. Defaults to 4 if not specified or invalid.
 * 
 * @returns {number} - The number of shards per cluster.
 */
const getShardsPerCluster = () => {
  // If the number of shards per cluster is valid and greater than 0, return it
  if (!isNaN(config.shards.shardsPerCluster) && Number(config.shards.shardsPerCluster) > 0) {
    return Number(config.shards.shardsPerCluster);
  }
  // Return default value (4) if the number is invalid or not specified
  return 4;
}

/**
 * Retrieves the sharding mode for the ClusterManager.
 * This can be either "process" or "worker". Defaults to "process" if not specified or invalid.
 * 
 * @returns {"process" | "worker"} - The sharding mode used by the ClusterManager.
 */
const getShardingMode = () => {
  // If a valid mode ("process" or "worker") is specified, return it
  if (config.shards.mode && validModes.includes(config.shards.mode.toLowerCase())) {
    return config.shards.mode;
  }

  // Return default mode ("process") if the value is invalid or not specified
  return 'process';
}

/**
 * Creates and starts the ClusterManager for sharding.
 * It initializes the ClusterManager with the necessary configurations,
 * listens for cluster creation events, and spawns the clusters.
 */
export const CreateManager = () => {
  // Instantiate the ClusterManager with the specified settings
  const manager = new ClusterManager(`${process.cwd()}/src/bot.mjs`, {
    totalShards: getTotalShards(),  // Total number of shards to use
    shardsPerClusters: getShardsPerCluster(),  // Number of shards per cluster
    mode: getShardingMode(),  // The sharding mode (process or worker)
    token: config.bot.token,  // The bot's token for authentication
  });

  // Event listener for when a cluster is created
  manager.on('clusterCreate', cluster => {
    // Optionally, handle messages from the cluster (commented out here)
    // cluster.on("message", async (message) => {});
  });

  // Spawn all clusters without a timeout limit
  manager.spawn({ timeout: -1 });
};
