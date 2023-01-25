// Requirements and Variables
require('dotenv').config();
const { checkEnvVariables } = require('./utils/checkEnvVariables');
const { client } = require('./utils/client');
const keepAlive = require('./utils/server');
const { cmds } = require('./commands');

// Interaction Create Event
client.on('interactionCreate', async interaction => {
	if (interaction.isCommand()) {
		cmds.forEach(async command => {
			if (interaction.commandName === command.name) {
				try {
					await command.execute(interaction);
				}
				catch (error) {
					console.error(error);
				}
			}
		});
	}
});

// Ready Event
client.on('ready', async () => {
	console.log('Testing bot is now online successfully!');
	await client.guilds.cache.get(process.env.SERVER_ID).commands.set(cmds);
});

// Bot Login
checkEnvVariables();
client.login(process.env.TOKEN);
keepAlive();
