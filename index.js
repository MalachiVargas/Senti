// Requirements and Variables
require("dotenv").config();
const { Client } = require("discord.js");
const { pingCommand } = require("./pingCommand");
const keepAlive = require(`./server`);
const { suggestCommand } = require("./suggestCommand");
const client = new Client({ intents: 32767 });

// Array of Command objects
const cmds = [
  suggestCommand,
  pingCommand
];

// Interaction Create Event
client.on("interactionCreate", async (interaction) => {
  if (interaction.isCommand()) {
    cmds.forEach(async (command) => {
      if (interaction.commandName == command.name) {
        try {
          await command.execute(interaction);
        } catch (error) {
          console.error(error);
        }
      }
    });
  }
});

// Ready Event
client.on("ready", async () => {
  console.log(`Testing bot is now online successfully!`);
  await client.guilds.cache.get(process.env["serverId"]).commands.set(cmds);
});

// Bot Login
client.login(process.env["TOKEN"]);
keepAlive();