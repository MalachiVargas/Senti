// Requirements and Variables
require("dotenv").config();
const { client } = require("./client");
const { pingCommand } = require("./pingCommand");
const keepAlive = require(`./server`);
const { suggestCommand } = require("./suggestCommand");
const { summarizeCommand } = require("./summarizeCommand");
if (!process.env.SERVER_ID || !process.env.TOKEN || !process.env.COHERE) {
  console.error(
    "Error: TOKEN || SERVER_ID || COHERE environment variable is not set"
  );
  process.exit(1);
}

// Array of Command objects
const cmds = [suggestCommand, pingCommand, summarizeCommand];

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
  await client.guilds.cache.get(process.env.SERVER_ID).commands.set(cmds);
});

// Bot Login
client.login(process.env.TOKEN);
keepAlive();
