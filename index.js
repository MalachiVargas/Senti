// Requirements and Variables
require('dotenv').config();
const { checkEnvVariables } = require('./utils/checkEnvVariables');
const { client } = require('./utils/client');
const keepAlive = require('./utils/server');
const { cmds } = require('./commands');
const { chatModel } = require('./commands/chat/chatModel');
const { Users, Sessions } = require('./dbObjects.js');
const { Events } = require('discord.js');
const { currentSessionCache, setCurrentSession, getCurrentSession } = require('./helperMethods');

client.once(Events.ClientReady, async () => {
	const storedCurrentSessions = await Users.findAll();
	storedCurrentSessions.forEach(cs => currentSessionCache.set(cs.user_id, cs));
});

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
		let data;
		const currentSessionId = await getCurrentSession(target.id);
		if (currentSessionId) {
			data = {
				model: 'command-xlarge-nightly',
				persona: 'cohere',
				query: chatModel(prompt),
				session_id: currentSessionId,
			};
		}
		else {
			data = {
				model: 'command-xlarge-nightly',
				persona: 'cohere',
				query: chatModel(prompt),
			};
		}

		let text;
		let desc;
		try {
			const res = await fetch('https://api.cohere.ai/chat', {
				method: 'POST',
				body: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${process.env.COHERE}`,
				},
			});

			if (res.status !== 200) {
				console.log(data);
				throw new Error(`Error with API, status code: ${res.status}`);
			}

			const jsonRes = await res.json();
			text = jsonRes.reply;
			if (!currentSessionId) {
				setCurrentSession(target.id, jsonRes.session_id);
			}

			const sessions = await Sessions.findAll({
				where: {
					user_id: target.id,
				},
				defaultValue: [],
			});

			const found = sessions.find(i => i.session_id === jsonRes.session_id);
			if (!found) {
				const newSession = await Sessions.create({ user_id: target.id, session_id: jsonRes.session_id, description: prompt.substring(0, 50) });
				desc = newSession.description;
				sessions.push(newSession);
			}
			else {
				desc = found.description;
			}
			console.log('Success:', JSON.stringify(jsonRes));
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
			await msg.author.send(`Room name: ${desc}\n${text}\n${currentSessionId}\n`);
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
