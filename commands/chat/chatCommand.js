const { SlashCommandBuilder } = require('discord.js');
const cohere = require('cohere-ai');
const { chatModel } = require('./chatModel');
const { sessionIds } = require('../../sessionIds');
const { Users, Sessions } = require('../../dbObjects');

cohere.init(process.env.COHERE);


const chatCommand = {
	...new SlashCommandBuilder()
		.setName('chat')
		.setDescription('Have a chat...')
		.addStringOption(option => option.setName('prompt').setDescription('Say anything...').setRequired(true))
		.addStringOption(option =>
			option.setName('session').setDescription('Input session id of existing chat').setAutocomplete(true),
		),
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused();
		const filtered = sessionIds.filter(choice => (choice && choice.sessionId && choice.sessionId.startsWith(focusedValue)) ||
			(choice && choice.title && choice.title.startsWith(focusedValue)));

		if (filtered.length > 0) {
			await interaction.respond(filtered.map(choice => ({ name: choice.title, value: choice.session_id })));

		}
	},
	async execute(interaction) {
		await interaction.deferReply({
			ephemeral: true,
		});
		const prompt = interaction.options.getString('prompt');
		let sessionId = interaction.options.getString('session');
		const target = interaction.user;
		const data = {
			'value': chatModel(prompt),
			// eslint-disable-next-line quotes
			'chatroom_id': sessionId ?? "",
			'user_id': target.id,
		};

		let desc;
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
			text = reply;
			console.log(reply, chatroom_id);
			if (!sessionId) {
				await Users.update({ current_session_id: chatroom_id }, { where: { user_id: target.id } })
					.then(() => {
						console.log('Record updated successfully!');
					})
					.catch((error) => {
						console.error('Error updating record:', error);
					});
			}

			const sessions = await Sessions.findAll({
				where: {
					user_id: target.id,
				},
				defaultValue: [],
			});
			const found = sessions.find(i => i.session_id === chatroom_id);
			if (!found) {
				const newSession = await Sessions.create({ user_id: target.id, session_id: chatroom_id, description: prompt.substring(0, 50) });
				desc = newSession.description;
				sessionId = chatroom_id;
				sessions.push(newSession);
			}
			else {
				desc = found.description;
			}
			console.log('Success:', JSON.stringify(response));
		}
		catch (error) {
			await interaction.editReply({
				content: `Error please resubmit ${error}`,
			});
			return;
		}

		if (text == '-' || text.length <= 5) {
			await interaction.editReply({
				content: 'Error please resubmit',
			});
		}
		else {
			await interaction.editReply({
				content: `${text}\n${sessionId}\n${desc}`,
			});
		}
	},
};
exports.chatCommand = chatCommand;
