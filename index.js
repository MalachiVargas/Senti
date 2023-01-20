// Requirements and Variables
require('dotenv').config();
const keepAlive = require(`./server`);
const { Client } = require('discord.js');
const client = new Client({ intents: 32767 });

// Array of Command objects
const cmds = [{
    name: `ping`, // Command name
    description: `Ping!`, // Command description
    async execute(interaction) { // Execute function
        await interaction.reply({
            content: `Pong.`
        });
    }
}]

// Interaction Create Event
client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        await cmds.forEach(async command => {
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
client.on('ready', async () => {
    console.log(`Testing bot is now online successfully!`);
    await client.guilds.cache
            .get(process.env['serverId'])
            .commands.set(cmds);
});

// Bot Login
client.login(process.env['token']);
keepAlive();