---

# **Discord.js Base Command Handler**

### **Written by Tomato6966**  
Built for [Deezcord](https://github.com/Tomato6966/deezcord-music-bot).

This project provides a powerful and flexible **command handler** for Discord bots using `Discord.js V14` and modern JavaScript (ESM). It supports **Slash Commands**, **Sub-Slash Commands**, **Group-Sub-Slash Commands**, **Context Menus**, and more, making bot development simpler and more efficient.

---

## **Features**

✔ **Slash Commands**  
- Manage and register **slash commands**, which users can invoke with `/`.

✔ **Sub-Slash Commands**  
- Group commands under a parent command for a **structured user experience**, e.g., `/info ping`.

✔ **Group-Sub-Slash Commands**  
- Create **hierarchical command structures** like `/info bot info` for advanced functionality.

✔ **Context Menus**  
- Add right-click interactions to **users and messages**, such as "Report Message" or "User Info."

✔ **Extends `discord.js`**  
- Improved type definitions for **better error handling** and **IDE code completion**.

✔ **Sharding**  
- Built-in **sharding support** using [discord-hybrid-sharding](https://npmjs.com/discord-hybrid-sharding). Ideal for scaling across large servers.

✔ **JSDoc Types**  
- Type definitions through **JSDoc comments** enhance code readability and provide in-editor documentation.

✔ **Color-Coded Logger**  
- A customizable logger with:  
  - **Color-coded messages** for clarity.  
  - **Log levels** to control verbosity.  
  - Optional timestamps and prefixes.

✔ **Webhook Logging**  
- Send logs to a **Discord channel** via webhooks for real-time monitoring.

✔ **MongoDB Integration**  
- Supports **MongoDB** for persistent data storage, perfect for saving user data or configurations.

✔ **Slash Command Mentions Cache**  
- Efficient caching ensures **faster responses** and optimized API usage.

✔ **Modern ESM Style**  
- Fully written in **ESM** with `.mjs` extensions for modern JavaScript compatibility.

---

## **Folder Structure**

The bot's command system is organized for scalability and clarity. Each type of command is categorized logically.

```
/src/commands/
├── Help.mjs           # Main Slash Command
├── Info/
│   ├── Ping.mjs       # Sub-Slash Command for /info ping
│   └── Bot/
│       └── Info.mjs   # Group-Sub-Slash Command for /info bot info
```

### **Explanation**:

- **Main Slash Commands**:  
  - Top-level commands, e.g., `/help`.  
  - Defined directly in `/src/commands/`.  

- **Sub-Slash Commands**:  
  - Commands nested under a main command, e.g., `/info ping`.  
  - Stored in folders like `/src/commands/Info/`.  

- **Group-Sub-Slash Commands**:  
  - Advanced nested commands for complex structures, e.g., `/info bot info`.  
  - Located in deeper nested folders, e.g., `/src/commands/Info/Bot/`.

### **Benefits**:
- **Organized**: Commands are neatly categorized into folders.  
- **Scalable**: Easily add new commands or groups without cluttering.  
- **Maintainable**: Each command resides in its own file for easy debugging.

---

## **Configuration**

The bot uses a `.env` file to manage its settings, such as tokens, database connections, and logging preferences. Rename `example.env` to `.env`.

### **.env Example**

```env
# Discord Bot Token for authentication
DISCORD_TOKEN=""

# Client ID of the Discord bot (usually the application or bot's ID)
CLIENT_I=""

# URI for MongoDB connection (database connection)
MONGODB_URI=""

# Total number of shards used by the bot
TOTAL_SHARDS="auto"

# Number of shards per cluster
SHARDS_PER_CLUSTER=4

# Sharding mode: "process" or "worker"
SHARDING_MODE="process"

# Log level for logging: 0 (all logs), 1 (no debug logs), 2 (no debug or info logs), etc.
LOG_LEVEL=0

# Prefix used in the log messages
LOG_PREFIX="INFO-LOG"

# Determines whether to include timestamps in the logs
LOG_TIMESTAMP="true"

# Discord Webhook URL for sending logs
LOG_WEBHOOK=""

# Determines whether slash commands will be publicly available
PUBLIC_SLASH="true"

# If you want to limit slash commands to a specific guild, enter the guild ID here
DEV_GUILD=""
```

---

## **Installation**

### **1. Clone the Repository**
```bash
git clone https://github.com/Tomato6966/discord-js-v14-handler.git
cd discord-js-v14-handler
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Configure Environment**
- Create a `.env` file in the root directory.  
- Add your bot token, database URI, and other settings (see `.env Example` above).

### **4. Run the Bot**
- Start the bot using Node.js:
  ```bash
  node src/index.mjs
  ```
  Or use the included npm script:
  ```bash
  npm run start
  ```

---

## **Logger Levels**

Control log verbosity using the `LOG_LEVEL` variable in the `.env` file:

- **Level 0**: Show all logs (debug, info, warnings, errors).  
- **Level 1**: Exclude debug logs.  
- **Level 2**: Exclude debug and info logs.  
- **Level 3**: Exclude success messages.  
- **Level 4**: Show only warnings and errors.  
- **Level 5**: Show only errors.

---

## **License**

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.

---