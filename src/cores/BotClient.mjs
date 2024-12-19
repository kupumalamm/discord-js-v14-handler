import {
  Client,
  Partials,
  GatewayIntentBits,
  ActivityType,
  PresenceUpdateStatus,
  Collection,
  Options,
  ChannelType,
  SlashCommandBuilder,
  ShardClientUtil,
  PermissionFlagsBits,
} from "discord.js";
import { ClusterClient, getInfo } from "discord-hybrid-sharding";
import { promises } from "fs";
import path, { resolve } from "path";
import { pathToFileURL } from "url";
import { Logger } from "../utils/Logger.mjs";
import Embeds from "../data/Embeds.mjs";
import Config from "../data/Config.mjs";
import DatabaseClient from "./DatabaseClient.mjs";
import Utils from "../utils/Index.mjs";

export const globalFilePath = (path) => pathToFileURL(path)?.href || path;

export class BotClient extends Client {
  constructor(options = {}) {
    super({
      ...getDefaultClientOptions(),
      ...options,
    });

    this.config = new Config();
    this.embed = new Embeds(this);
    this.utils = new Utils(this);
    this.db = new DatabaseClient(this, this.config.database_uri);
    this.commands = new Collection();
    this.eventPaths = new Collection();
    this.cooldowns = {
      user: new Collection(),
      guild: new Collection(),
      global: new Collection(),
    };

    this.allCommands = [];
    this.reloadCommandCache = new Map();
    this.logger = new Logger({
      logLevel: this.config.log.level,
      prefix: this.config.log.prefix,
      dateEnabled: this.config.log.timestamp,
      webhookUrl: this.config.log.webhook,
    });
    this.cluster = new ClusterClient(this);

    this.botCache = {
      fetchedApplication: [],
    };
    this.init();
  }

  async init() {
    console.log(`\n${"-=".repeat(40)}-`);
    this.logger.info(`Loading Events`);
    await this.loadEvents();

    console.log(`\n${"-=".repeat(40)}-`);
    this.logger.info(`Loading Commands`);
    await this.loadCommands();

    console.log(`\n${"-=".repeat(40)}-`);
    this.logger.info(`Loading Extenders`);
    await this.loadExtenders();

    if (this.config.database_uri) {
      console.log(`\n${"-=".repeat(40)}-`);
      this.logger.info(`Loading Database`);
      this.db.connect();
    }

    return this.emit("@KupumalamLoaded", this);
  }

  get guildsAndMembers() {
    return {
      guilds: this.guilds.cache.size,
      members: this.guilds.cache
        .map((x) => x.memberCount)
        .reduce((a, b) => a + b, 0),
    };
  }

  async loadExtenders() {
    try {
      const paths = await walks(`${process.cwd()}/src/extenders`);
      await Promise.all(
        paths.map(async (path) => {
          const extender = await import(globalFilePath(resolve(path))).then(
            (x) => x.default,
          );
          const name = resolve(path).includes("\\")
            ? resolve(path).split("\\").reverse()[0]
            : resolve(path).split("/").reverse()[0];
          this.logger.debug(
            `✅ Extender Loaded: ${name.replace(".mjs", "").replace(".js", "")}`,
          );
          return extender(this);
        }),
      );
    } catch (e) {
      this.logger.error(e);
    }
    return true;
  }

  async loadEvents() {
    try {
      this.eventPaths.clear();
      const paths = await walks(`${process.cwd()}/src/events`);
      await Promise.all(
        paths.map(async (path) => {
          const event = await import(globalFilePath(resolve(path))).then(
            (x) => x.default,
          );
          const splitted = resolve(path).includes("\\")
            ? resolve(path).split("\\")
            : resolve(path).split("/");
          const eventName = splitted
            .reverse()[0]
            .replace(".mjs", "")
            .replace(".js", "");
          this.eventPaths.set(eventName, { eventName, path: resolve(path) });
          this.logger.debug(`✅ Event Loaded: ${eventName}`);
          return this.on(eventName, event.bind(null, this));
        }),
      );
    } catch (e) {
      this.logger.error(e);
    }
    return true;
  }

  async loadCommands(path = "/src/commands") {
    try {
      this.allCommands = [];
      this.commands.clear();
      const dirs = await promises.readdir(`${process.cwd()}${path}`);

      for (const dir of dirs) {
        const dirPath = `${process.cwd()}${path}/${dir}`;

        if (!dir.endsWith(".mjs") && (await promises.lstat(dirPath).catch(() => null))?.isDirectory?.()) {
          const subSlash = new SlashCommandBuilder()
            .setName(dir.toLowerCase())
            .setDescription(`Subcommands for ${dir}`);

          const slashCommands = await promises.readdir(dirPath);

          for (let file of slashCommands) {
            const curPath = `${dirPath}/${file}`;

            if ((await promises.lstat(curPath).catch(console.error))?.isDirectory?.()) {
              const groupPath = curPath;
              const groupFiles = await promises.readdir(groupPath).then(x => x.filter(v => v.endsWith(".mjs")));
              if (groupFiles.length) {
                const commands = {};
                for (let sFile of groupFiles) {
                  const groupCurPath = `${groupPath}/${sFile}`;
                  commands[sFile] = await import(globalFilePath(groupCurPath)).then(x => x.default);
                }

                subSlash.addSubcommandGroup(group => {
                  group.setName(file.toLowerCase())
                    .setDescription(`Group of ${file} subcommands`);

                  for (let sFile of groupFiles) {
                    const groupCurPath = `${groupPath}/${sFile}`;
                    const command = commands[sFile];
                    if (!command.name) {
                      this.logger.error(`${groupCurPath} not containing a Command-Name`);
                      continue;
                    }

                    group.addSubcommand(slash => {
                      slash.setName(command.name)
                        .setDescription(command.description || "No description provided");
                      this.buildOptions(command, slash);
                      return slash;
                    });

                    command.commandId = this.botCache?.fetchedApplication?.find?.(c => c?.name == subSlash.name)?.permissions?.commandId ?? "commandId";
                    command.slashCommandKey = `/${subSlash.name} ${group.name} ${command.name}`;
                    command.mention = `<${command.slashCommandKey}:${command.commandId}>`;

                    this.logger.debug(`✅ Group Command Loaded: /${file} ${dir} ${command.name}`);
                    this.commands.set(`groupcmd_${file.toLowerCase()}_${dir.toLowerCase()}_${command.name}`, command);
                  }

                  return group;
                });
              }
            } else {
              const command = await import(globalFilePath(curPath)).then(x => x.default);
              if (!command.name) {
                this.logger.error(`${curPath} not containing a Command-Name`);
                continue;
              }

              subSlash.addSubcommand(slash => {
                slash.setName(command.name)
                  .setDescription(command.description || "No description provided");
                this.buildOptions(command, slash);
                return slash;
              });

              command.commandId = this.botCache?.fetchedApplication?.find?.(c => c?.name == subSlash.name)?.permissions?.commandId ?? "commandId";
              command.slashCommandKey = `/${subSlash.name} ${command.name}`;
              command.mention = `<${command.slashCommandKey}:${command.commandId}>`;

              this.logger.debug(`✅ Sub Command Loaded: /${dir} ${command.name}`);
              this.commands.set(`subcmd_${dir.toLowerCase()}_${command.name}`, command);
            }
          }

          this.allCommands.push(subSlash.toJSON());
        } else {
          const curPath = `${process.cwd()}${path}/${dir}`;
          const command = await import(globalFilePath(curPath)).then(x => x.default);
          if (!command.name) {
            this.logger.error(`${curPath} not containing a Command-Name`);
            continue;
          }

          const Slash = new SlashCommandBuilder()
            .setName(command.name)
            .setDescription(command.description || "No description provided");

          this.buildOptions(command, Slash);

          command.commandId = this.botCache?.fetchedApplication?.find?.(c => c?.name == command.name)?.permissions?.commandId ?? "commandId";
          command.slashCommandKey = `/${command.name}`;
          command.mention = `<${command.slashCommandKey}:${command.commandId}>`;

          this.logger.debug(`✅ Slash Command Loaded: /${command.name}`);
          this.commands.set(`slashcmd_${command.name}`, command);
          this.allCommands.push(Slash.toJSON());
        }
      }
    } catch (e) {
      this.logger.error(e);
    }
    return true;
  }


  async loadContextMenu(path = "/src/contextmenu/") {
    try {
      const paths = await walks(`${process.cwd()}${path}`);

      if (!paths?.length) {
        this.logger.debug("No Context Menus found.");
        return true;
      }

      for (const filePath of paths) {
        try {
          const command = await import(resolve(filePath)).then((x) => x.default);

          if (!command.name || typeof command.name !== "string") {
            this.logger.error(`❌ ${filePath} does not contain a valid Context-Command-Name.`);
            continue;
          }
          if (!command.type || ![2, 3].includes(command.type)) {
            this.logger.error(`❌ ${filePath} does not contain a valid Context-Command-Type.`);
            continue;
          }

          const builder = new ContextMenuCommandBuilder()
            .setName(command.name)
            .setType(command.type);

          if (command.defaultPermissions) {
            builder.setDefaultMemberPermissions(command.defaultPermissions);
          }

          if (command.localizations?.length) {
            for (const [locale, localizedName] of Object.entries(command.localizations)) {
              builder.setNameLocalization(locale, localizedName);
            }
          }

          command.isContext = true;

          this.logger.debug(`✅ Context Command Loaded: /${command.name}`);
          this.commands.set(`contextcmd_${command.name.toLowerCase()}`, command);
          this.allCommands.push(builder.toJSON());
        } catch (err) {
          this.logger.error(`❌ Failed to load context menu at ${filePath}: ${err.message}`);
        }
      }

      this.logger.info(`✅ Successfully loaded ${this.commands.size} context menus.`);
    } catch (err) {
      this.logger.error(`❌ Error loading context menus: ${err.message}`);
    }
    return true;
  }

  async prepareCommands() {
    if (!this.config.bot.id) this.config.bot.id = this.user.id;
    if (!this.config.bot.name) this.config.bot.name = this.user.tag;

    const allSlashs =
      (await this.application.commands
        .fetch(undefined)
        .then((x) => [...x.values()])
        .catch(console.warn)) || [
        ...this.application.commands.cache.values(),
      ] ||
      [];
    if (allSlashs?.length) {
      this.botCache.fetchedApplication = allSlashs;
      for (const [key, value] of [...this.commands.entries()]) {
        if (!value.slashCommandKey) continue;
        const Base = value.slashCommandKey.split(" ")[0].replace("/", "");
        value.commandId =
          allSlashs.find((c) => c.name === Base)?.permissions?.commandId || 0;
        value.mention = value.mention.replace(
          "commandId",
          value.commandId || "4206966420",
        );
        this.commands.set(key, value);
      }
      this.logger.debug(
        `✅ Set Command Mentions of: ${allSlashs?.length} Commands`,
      );
    }
    return true;
  }

  async publishCommands(guildId) {
    if (!guildId) {
      if (this.cluster.id !== 0) return;
      await this.application.commands
        .set([])
        .then(() => {
          this.logger.info(`SLASH-CMDS | All existing slashCommands have been removed!`);
        })
        .catch((e) => {
          this.logger.error(e);
        });

      await this.application.commands
        .set(this.allCommands)
        .then(() => {
          this.logger.info(`SLASH-CMDS | Set ${this.commands.size} slashCommands!`);
          this.logger.warn(
            `Because you are Using Global Settings, it can take up to 1 hour until the Commands are changed!`,
          );
        })
        .catch((e) => {
          this.logger.error(e);
        });
      return true;
    }

    const shardId = ShardClientUtil.shardIdForGuildId(
      guildId,
      getInfo().TOTAL_SHARDS,
    );

    if (![...this.cluster.ids.keys()].includes(shardId))
      return this.logger.warn("CANT UPDATE SLASH COMMANDS - WRONG CLUSTER");

    const guild = this.guilds.cache.get(guildId);
    if (!guild)
      return this.logger.error("Could not find the guild for updating slash commands");

    guild.commands
      .set([])
      .then(() => {
        this.logger.info(`SLASH-CMDS | All existing slashCommands for this guild have been removed!`);
      })
      .catch(this.logger.error);

    guild.commands
      .set(this.allCommands)
      .then(() => {
        this.logger.info(`SLASH-CMDS | Set ${this.commands.size} slashCommands!`);
      })
      .catch(this.logger.error);
  }

  async reloadCommand(commandName, path = "/src/commands") {
    try {
      const dirs = await promises.readdir(`${process.cwd()}${path}`);

      for (const dir of dirs) {
        const dirPath = `${process.cwd()}${path}/${dir}`;
        const stats = await promises.lstat(dirPath);

        if (stats.isDirectory()) {
          const subDirs = await promises.readdir(dirPath);

          for (const subDir of subDirs) {
            const subDirPath = `${dirPath}/${subDir}`;
            const subDirStats = await promises.lstat(subDirPath);

            if (subDirStats.isDirectory()) {
              const subSlash = new SlashCommandBuilder()
                .setName(dir.toLowerCase())
                .setDescription(`Commands dalam kategori ${dir}`);

              const groupCommands = await promises.readdir(subDirPath);

              for (const file of groupCommands) {
                const filePath = `${subDirPath}/${file}`;
                await this.loadSingleCommand(
                  filePath,
                  subSlash,
                  "groupcmd",
                  dir,
                  subDir,
                );
              }

              if (subSlash.toJSON().name === commandName) {
                this.commands.set(commandName, subSlash);
                this.reloadCommandCache.set(commandName, subDirPath);
                this.logger.info(`✅ Group command reloaded: ${commandName}`);
                return;
              }
            } else if (subDir.endsWith(".mjs")) {
              const command = await this.importCommand(subDirPath);
              if (command?.name === commandName) {
                this.commands.set(command.name, command);
                this.reloadCommandCache.set(commandName, subDirPath);
                this.logger.info(`✅ Subcommand reloaded: ${commandName}`);
                return;
              }
            }
          }
        } else if (dir.endsWith(".mjs")) {
          const command = await this.importCommand(dirPath);
          if (command?.name === commandName) {
            this.commands.set(command.name, command);
            this.reloadCommandCache.set(commandName, dirPath);
            this.logger.info(`✅ Command reloaded: ${commandName}`);
            return;
          }
        }
      }

      throw new Error(`Command "${commandName}" not found`);
    } catch (e) {
      this.logger.error(`❌ Error reloading command "${commandName}": ${e.message}`);
    }
  }

  async importCommand(filePath) {
    try {
      delete require.cache[require.resolve(filePath)];
      const command = await import(globalFilePath(filePath)).then((x) => x.default);
      if (!command || typeof command.name !== "string") {
        this.logger.warn(`⚠️ Invalid command file: ${filePath}`);
        return null;
      }
      return command;
    } catch (e) {
      this.logger.error(`❌ Failed to import command: ${filePath}`);
      return null;
    }
  }

  buildOptions(command, Slash) {
    if (command.options?.length) {
      /*
        name: "songtitle",
        description: "Title/Link of the Song/Playlist",
        type: "STRING",
        required: true,
      */
      for (const option of command.options) {
        if (option.type.toLowerCase() === optionTypes.attachment) {
          Slash.addAttachmentOption(op => {
            op.setName(option.name.toLowerCase())
              .setDescription(option.description || "TEMP_DESC")
              .setRequired(!!option.required);
            if (option.localizations?.length) {
              for (const localization of option.localizations) {
                if (localization.name) op.setNameLocalization(localization.name[0], localization.name[1]);
                if (localization.description) op.setDescriptionLocalization(localization.description[0], localization.description[1]);
              }
            }
            return op;
          });
        }
        if (option.type.toLowerCase() === optionTypes.channel) {
          Slash.addChannelOption(op => {
            op.setName(option.name.toLowerCase())
              .setDescription(option.description || "TEMP_DESC")
              .setRequired(!!option.required);
            if (option.channelTypes) op.addChannelTypes(...option.channelTypes);

            if (option.localizations?.length) {
              for (const localization of option.localizations) {
                if (localization.name) op.setNameLocalization(localization.name[0], localization.name[1]);
                if (localization.description) op.setDescriptionLocalization(localization.description[0], localization.description[1]);
              }
            }
            return op;
          });
        }
        else if (option.type.toLowerCase() === optionTypes.number) {
          Slash.addNumberOption(op => {
            op.setName(option.name.toLowerCase())
              .setDescription(option.description || "TEMP_DESC")
              .setRequired(!!option.required)
              .setAutocomplete(!!option.autocomplete);

            if (option.localizations?.length) {
              for (const localization of option.localizations) {
                if (localization.name) op.setNameLocalization(localization.name[0], localization.name[1]);
                if (localization.description) op.setDescriptionLocalization(localization.description[0], localization.description[1]);
              }
            }
            if (option.max) op.setMaxValue(option.max);
            if (option.min) op.setMinValue(option.min);
            return op;
          });
        }
        else if (option.type.toLowerCase() === optionTypes.numberchoices) {
          Slash.addNumberOption(op => {
            op.setName(option.name.toLowerCase())
              .setDescription(option.description || "TEMP_DESC")
              .setRequired(!!option.required)
              .setAutocomplete(!!option.autocomplete);

            if (option.localizations?.length) {
              for (const localization of option.localizations) {
                if (localization.name) op.setNameLocalization(localization.name[0], localization.name[1]);
                if (localization.description) op.setDescriptionLocalization(localization.description[0], localization.description[1]);
              }
            }
            if (option.choices) op.setChoices(...option.choices);
            return op;
          });
        }
        else if (option.type.toLowerCase() === optionTypes.role) {
          Slash.addRoleOption(op => {
            op.setName(option.name.toLowerCase())
              .setDescription(option.description || "TEMP_DESC")
              .setRequired(!!option.required);
            if (option.localizations?.length) {
              for (const localization of option.localizations) {
                if (localization.name) op.setNameLocalization(localization.name[0], localization.name[1]);
                if (localization.description) op.setDescriptionLocalization(localization.description[0], localization.description[1]);
              }
            }
            return op;
          });
        }
        else if (option.type.toLowerCase() === optionTypes.string) {
          Slash.addStringOption(op => {
            op.setName(option.name.toLowerCase())
              .setDescription(option.description || "TEMP_DESC")
              .setRequired(!!option.required)
              .setAutocomplete(!!option.autocomplete);

            if (option.localizations?.length) {
              for (const localization of option.localizations) {
                if (localization.name) op.setNameLocalization(localization.name[0], localization.name[1]);
                if (localization.description) op.setDescriptionLocalization(localization.description[0], localization.description[1]);
              }
            }
            if (option.max) op.setMaxLength(option.max);
            if (option.min) op.setMinLength(option.min);
            return op;
          });
        }
        else if (option.type.toLowerCase() === optionTypes.stringchoices) {
          Slash.addStringOption(op => {
            op.setName(option.name.toLowerCase())
              .setDescription(option.description || "TEMP_DESC")
              .setRequired(!!option.required)
              .setAutocomplete(!!option.autocomplete);

            if (option.localizations?.length) {
              for (const localization of option.localizations) {
                if (localization.name) op.setNameLocalization(localization.name[0], localization.name[1]);
                if (localization.description) op.setDescriptionLocalization(localization.description[0], localization.description[1]);
              }
            }
            if (option.choices) op.setChoices(...option.choices);
            return op;
          });
        }
        else if (option.type.toLowerCase() === optionTypes.user) {
          Slash.addUserOption(op => {
            op.setName(option.name.toLowerCase())
              .setDescription(option.description || "TEMP_DESC")
              .setRequired(!!option.required);
            if (option.localizations?.length) {
              for (const localization of option.localizations) {
                if (localization.name) op.setNameLocalization(localization.name[0], localization.name[1]);
                if (localization.description) op.setDescriptionLocalization(localization.description[0], localization.description[1]);
              }
            }
            return op;
          });
        }
      }
    }
    return true;
  }
}

export function getDefaultClientOptions() {
  return {
    shards: getInfo().SHARD_LIST,
    shardCount: getInfo().TOTAL_SHARDS,
    partials: [
      Object.values(Partials).filter(x => !isNaN(x)).reduce((bit, next) => bit |= next, 0)
    ],
    intents: [
      Object.values(GatewayIntentBits).filter(x => !isNaN(x)).reduce((bit, next) => bit |= next, 0)
    ],
    presence: {
      activities: [
        {
          name: `Booting up`,
          type: ActivityType.Custom,
        },
      ],
      status: PresenceUpdateStatus.Online,
    },
    sweepers: {
      messages: {
        interval: 5 * 60 * 1000,
        lifetime: 1 * 60 * 60 * 1000,
      },
    },
    makeCache: Options.cacheWithLimits({
      ApplicationCommandManager: { maxSize: 0 },
      BaseGuildEmojiManager: { maxSize: 0 },
      GuildBanManager: { maxSize: 0 },
      GuildStickerManager: { maxSize: 0 },
      GuildScheduledEventManager: { maxSize: 0 },
      ReactionUserManager: { maxSize: 0 },
      PresenceManager: { maxSize: 0 },
      GuildInviteManager: { maxSize: 0 },
      ReactionManager: { maxSize: 0 },
      MessageManager: { maxSize: 0 },
    }),
    failIfNotExists: false,
    allowedMentions: {
      parse: [],
      users: [],
      roles: [],
      repliedUser: true,
    },
  };
}

export const optionTypes = {
  attachment: "attachment",
  string: "string",
  number: "number",
  role: "role",
  user: "user",
  channel: "channel",
  boolean: "boolean",
  stringchoices: "stringchoices",
  numberchoices: "numberchoices",
};

export const textBasedCats = [
  ChannelType.GuildText,
  ChannelType.AnnouncementThread,
  ChannelType.PublicThread,
  ChannelType.PrivateThread,
  ChannelType.GuildCategory,
  ChannelType.GuildAnnouncement,
];

async function walks(path, recursive = true) {
  let files = [];
  const items = await promises.readdir(path, { withFileTypes: true });
  for (const item of items) {
    if (item.isDirectory()) {
      files = [...files, ...(await walks(`${path}/${item.name}`))];
    } else if (item.isFile()) {
      files.push(`${path}/${item.name}`);
    }
  }
  return files;
}