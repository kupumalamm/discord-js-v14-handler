// categories or commands, which shall have the "high" Cooldown
export const cooldownCategoriesHigh = ["developers"]; // all commands inside those folder-Categories, will be using defaultCooldownMsHigh
export const cooldownCommandsHigh = [""]; // all those command-names will be using defaultCooldownMsHigh
export const defaultCooldownMsHigh = 60000;

// categories or commands, which shall have a general cooldown
export const cooldownCategories = [""]; // all commands inside those folder-Categories, will be using defaultCooldownMs
export const cooldownCommands = [""];  // all those command-names will be using defaultCooldownMs
export const defaultCooldownMs = 400;

// global Commands Cooldowns Data
export const maximumCoolDownCommands = {
  time: 10000,
  amount: 6, // over 10 seconds a user can do 6 commands, 
}