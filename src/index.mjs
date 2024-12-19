import("dotenv").then(dotenv => dotenv.config());
import("./cores/Sharder.mjs").then(Sharder => Sharder.CreateManager());