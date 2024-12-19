import { Array } from "./Array.mjs";
import { Number } from "./Number.mjs";
import { Permissions } from "./Permissions.mjs";
import { Time } from "./Time.mjs";
import { Paginator } from "./Paginator.mjs";

export default class Utils {
  /** @param {import("./cores/BotClient.mjs").BotClient} client */
  constructor(client) {
    this.client = client;
    /** @type {Time} */
    this.time = new Time(client);
    /** @type {Permissions} */
    this.perms = new Permissions(client);
    /** @type {Number} */
    this.number = new Number(client);
    /** @type {Array} */
    this.array = new Array(client);
    /** @type {Paginator} */
    this.paginator = new Paginator(client);
  }
}