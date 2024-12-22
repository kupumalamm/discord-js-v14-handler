# **Discord.js Base Command Handler**

This repository offers a flexible **command handler** for building Discord bots using `Discord.js v14` and modern JavaScript (ESM). It provides support for **Slash Commands**, **Sub-Slash Commands**, **Group-Sub-Slash Commands**, **Context Menus**, and more, streamlining bot development.

---

## **Features**

- **Slash Commands**  
  Efficiently manage and register slash commands that users can invoke using `/`.

- **Sub-Slash Commands**  
  Structure your commands hierarchically, e.g., `/info ping`, for a more organized user experience.

- **Group-Sub-Slash Commands**  
  Create advanced command structures, e.g., `/info bot info`, for specialized functionalities.

- **Context Menus**  
  Enable right-click interactions for **users** and **messages**, such as "Report Message" or "User Info."

- **`discord.js` Extension**  
  Enhance your bot's type definitions, improving error handling and code completion in your IDE.

- **Sharding Support**  
  Scale your bot seamlessly across multiple shards using [discord-hybrid-sharding](https://npmjs.com/discord-hybrid-sharding).

- **JSDoc Integration**  
  In-editor documentation through **JSDoc comments** to increase readability and developer productivity.

- **Color-Coded Logger**  
  Customizable logger with color-coded messages, log levels, optional timestamps, and prefixes.

- **Webhook Logging**  
  Send logs directly to a **Discord channel** via webhooks for real-time monitoring.

- **MongoDB Support**  
  Persistent data storage using **MongoDB**, perfect for saving configurations and user data.

- **Slash Command Caching**  
  Enhanced caching for slash command mentions, optimizing performance and reducing API calls.

- **Modern ESM Syntax**  
  Fully written in **ESM** with `.mjs` extensions for compatibility with modern JavaScript practices.

---

## **Folder Structure**

The command structure is logically organized to promote scalability and ease of maintenance.

```
/src/commands/
├── Info.mjs           # Main Slash Command
├── Info/
│   ├── Ping.mjs       # Sub-Slash Command for /info ping
│   └── Bot/
│       └── Info.mjs   # Group-Sub-Slash Command for /info bot info
```

### **Command Breakdown**:

- **Main Slash Commands**:  
  Top-level commands, e.g., `/help`, defined directly in `/src/commands/`.

- **Sub-Slash Commands**:  
  Nested under a parent command, e.g., `/info ping`, stored in subdirectories like `/src/commands/Info/`.

- **Group-Sub-Slash Commands**:  
  Complex command structures, e.g., `/info bot info`, located deeper in nested folders like `/src/commands/Info/Bot/`.

### **Benefits**:
- **Organized**: Commands are grouped by type and purpose, making them easy to find.
- **Scalable**: Easily add more commands or groups without cluttering the project.
- **Maintainable**: Each command is self-contained, simplifying debugging and updates.

---

## **Slash Command Limitations**

Discord enforces the following limits on command registration:

- **Main Slash Commands**: A bot can register up to **100 main commands**.
- **Sub-Slash Commands**: Each main command can have up to **25 subcommands**.
- **Group-Sub-Slash Commands**: Each subcommand can have up to **25 group-subcommands**.

It’s essential to keep these limits in mind when designing your bot’s command structure.

---

## **Configuration**

The bot uses a `.env` file to manage sensitive information like tokens, database URIs, and logging configurations. Alternatively, configurations can be set in the [Config.mjs](src/data/Config.mjs) file, though `.env` is preferred for security reasons. Rename `example.env` to `.env` for proper setup.

**Modified by kupumalamm** for additional custom configuration options.

### **.env Example**

```env
# Discord Bot Token
DISCORD_TOKEN=""

# Discord Client ID
CLIENT_I=""

# MongoDB Connection URI
MONGODB_URI=""

# Number of Shards (use "auto" for auto-scaling)
TOTAL_SHARDS="auto"

# Shard Distribution per Cluster
SHARDS_PER_CLUSTER=4

# Sharding Mode: "process" or "worker"
SHARDING_MODE="process"

# Log Level: 0 (all logs), 1 (no debug logs), etc.
LOG_LEVEL=0

# Log Prefix
LOG_PREFIX="INFO-LOG"

# Log Timestamps (true/false)
LOG_TIMESTAMP="true"

# Webhook URL for Logging
LOG_WEBHOOK=""

# Whether Slash Commands are publicly available
PUBLIC_SLASH="true"

# If limiting Slash Commands to specific guilds, enter the guild ID
DEV_GUILD=""
```

---

## **Requirements & Dependencies**  

- **Node.js v18 or higher**
- **npm** or **yarn** for package management
- **MongoDB** (for database integration)

---

## **Installation**

### **1. Clone the Repository**
```bash
git clone https://github.com/kupumalamm/discord-js-v14-handler.git
cd discord-js-v14-handler
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Configure Environment**
- Create a `.env` file in the root directory.  
- Add your bot token, database URI, and other necessary configurations (refer to `.env Example`).

### **4. Run the Bot**
To start the bot with Node.js:
```bash
node src/index.mjs
```
Or use the included npm script:
```bash
npm run start
```

---

## **Logger Levels**

Control verbosity with the `LOG_LEVEL` setting in `.env`:

- **Level 0**: Show all logs (debug, info, warnings, errors).  
- **Level 1**: Exclude debug logs.  
- **Level 2**: Exclude debug and info logs.  
- **Level 3**: Exclude success messages.  
- **Level 4**: Show only warnings and errors.  
- **Level 5**: Show only errors.

---

## **Credits**

This project was initially created by [Tomato6966](https://github.com/Tomato6966).  
Modified by [kupumalamm](https://github.com/kupumalamm) for custom enhancements.

---

## **License**

Licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
