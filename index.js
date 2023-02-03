// Requirements and Variables
require('dotenv').config();
const { checkEnvVariables } = require('./utils/checkEnvVariables');
const { client } = require('./utils/client');
const keepAlive = require('./utils/server');
const { cmds } = require('./commands');
const { chatModel } = require('./commands/chat/chatModel');
const { fetchCurrentSession } = require('./utils/fetchCurrentSession');


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
	else if (interaction.isAutocomplete()) {
		cmds.forEach(async command => {
			if (interaction.commandName === command.name) {
				try {
					await command.autocomplete(interaction);
				}
				catch (error) {
					console.error(error);
				}
			}
		});
	}
});


client.on('messageCreate', async msg => {
	if (msg.author.bot) return;
	if (msg.channel.type == 1) {
		const prompt = msg.content;
		const target = msg.author;
		let currentSessionId = await fetchCurrentSession(target);
		const data = {
			'value': chatModel(prompt),
			// eslint-disable-next-line quotes
			'chatroom_id': currentSessionId ?? "",
			'user_id': target.id,
		};
		let text;
		try {
			const res = await fetch('https://SentiBot.malachivargas.repl.co/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (res.status !== 200) {
				console.log(data);
				throw new Error(`Error with API, status code: ${res.status}`);
			}

			const jsonRes = await res.text();
			const response = JSON.parse(jsonRes);
			const { reply, chatroom_id } = response.body;
			currentSessionId = chatroom_id;
			text = reply;

			console.log('Success:', JSON.stringify(response));
		}
		catch (error) {
			console.error('Error:', error);
			await msg.author.send('Error please resubmit');
			return;
		}

		if (text | text == '-' || text.length <= 5) {
			await msg.author.send('Error With chat please re-submit');
		}
		else {
			await msg.author.send(`${text}\n${currentSessionId}\n`);
		}
		return;
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
