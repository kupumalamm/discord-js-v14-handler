export default class Config {
  constructor() {
    this.bot = {
      token: process.env.DISCORD_TOKEN || "",
      id: process.env.CLIENT_ID || "",
    };
    this.database_uri = process.env.MONGODB_URI || "";
    this.deploy = {
      public: parseBoolean(process.env.PUBLIC_SLASH || "true"),
      devGuild: process.env.DEV_GUILD || "",
    }
    this.shards = {
      total: process.env.CLUSTER_TOTAL || "auto",
      shardsPerCluster: parseInt(process.env.SHARDING_PER_CLUSTER || "4"),
      mode: process.env.SHARDING_MODE || "process",
    };
    this.developers = process.env.DEVELOPERS?.split(",") || [""];
    this.log = {
      level: parseInt(process.env.LOG_LEVEL || "0"),
      prefix: process.env.LOG_PREFIX || "INFO-LOG",
      timestamp: parseBoolean(process.env.LOG_TIMESTAMP || "true"),
      webhook: process.env.LOG_WEBHOOK || "",
    };
  }
}

function parseBoolean(value) {
  if (typeof value === "string") {
    value = value.trim().toLowerCase();
  }

  switch (value) {
    case true:
    case "true":
      return true;
    case false:
    case "false":
      return false;
    default:
      return null;
  }
}
