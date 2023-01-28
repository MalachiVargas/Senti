// Requirements and Variables
require('dotenv').config();
const { checkEnvVariables } = require('./utils/checkEnvVariables');
const { client } = require('./utils/client');
const keepAlive = require('./utils/server');
const { cmds } = require('./commands');
const { chatModel } = require('./commands/chat/chatModel');
const { sessionIds } = require('./sessionIds');

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
		const data = {
			model: 'command-xlarge-nightly',
			persona: 'cohere',
			query: chatModel(prompt),
			session_id: 'chat-cae2aafb-836f-4496-b0f5-462758aa76bb-6cf497f0-e730-4729-a3b0-e8080edff122',
		};
		let text;
		let sessionId;
		await fetch('https://api.cohere.ai/chat', {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${process.env.COHERE}`,
			},
		})
			.then(res => res.json())
			.then(res => {
				text = res.reply;
				sessionId = res.session_id;
				const found = sessionIds.find(i => i.session_id === res.session_id);
				if (!found) sessionIds.push({ session_id: res.session_id, title: prompt.substring(0, 100) });
				console.log('Success:', JSON.stringify(res));
			})
			.catch(error => console.error('Error:', error));

		if (text == '-' || text.length <= 5) {
			await msg.author.send('Error With express Please ReSubmit');
		}
		else {
			await msg.author.send(`${text}\n${sessionId}`);
		}
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
