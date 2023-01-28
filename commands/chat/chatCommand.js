const { SlashCommandBuilder } = require('discord.js');
const cohere = require('cohere-ai');
const { chatModel } = require('./chatModel');
const { sessionIds } = require('../../sessionIds');

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
		let text;
		let data = {};
		if (!sessionId) {
			data = {
				model: 'command-xlarge-nightly',
				persona: 'cohere',
				query: chatModel(prompt),
			};
		}
		else {
			data = {
				model: 'command-xlarge-nightly',
				persona: 'cohere',
				query: chatModel(prompt),
				session_id: sessionId,
			};
		}
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
			await interaction.editReply({
				content: 'Error With express Please ReSubmit',
			});
		}
		else {
			await interaction.editReply({
				content: `${text}\n${sessionId}`,
			});
		}
	},
};
exports.chatCommand = chatCommand;
