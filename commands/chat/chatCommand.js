const { SlashCommandBuilder } = require('discord.js');
const cohere = require('cohere-ai');
const { chatModel } = require('./chatModel');

cohere.init(process.env.COHERE);

const chatCommand = {
	...new SlashCommandBuilder()
		.setName('chat')
		.setDescription('Have a chat...')
		.addStringOption(option =>
			option.setName('prompt').setDescription('Say anything...').setRequired(true),
		)
		.addStringOption(option =>
			option
				.setName('session')
				.setDescription('Input session id of existing chat')),
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
				query:  chatModel(prompt),
			};
		}
		else {
			data = {
				model: 'command-xlarge-nightly',
				persona: 'cohere',
				query:  chatModel(prompt),
				session_id:  sessionId,
			};
		}
		await fetch('https://api.cohere.ai/chat', {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${process.env.COHERE}`,
			},
		}).then(res => res.json())
			.then(res => {
				text = res.reply;
				sessionId = res.session_id;
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
