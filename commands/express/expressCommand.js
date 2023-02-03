const { SlashCommandBuilder } = require('discord.js');
const cohere = require('cohere-ai');
const { expressChatModel } = require('./expressChatModel');

cohere.init(process.env.COHERE);

const expressCommand = {
	...new SlashCommandBuilder()
		.setName('express')
		.setDescription('For when you can\'t find the right words...')
		.addStringOption(option =>
			option.setName('convo').setDescription('The conversation text you want me to respond to.').setRequired(true),
		)
		.addStringOption(option =>
			option
				.setName('context')
				.setDescription('Add some of your thoughts and how you want to express yourself.'))
		.addStringOption(option =>
			option
				.setName('session')
				.setDescription('Input session id of existing chat')),
	async execute(interaction) {
		await interaction.deferReply({
			ephemeral: true,
		});
		const convo = interaction.options.getString('convo');
		const context = interaction.options.getString('context') === null ? '' : interaction.options.getString('context');
		let sessionId = interaction.options.getString('session');
		let text;
		let data = {};
		if (!sessionId) {
			data = {
				value_list:  [convo, context],
				chatroom_id: 'command-xlarge-nightly',
				user_id: 'cohere',
			};
		}
		else {
			data = {
				model: 'command-xlarge-nightly',
				persona: 'cohere',
				query:  expressChatModel(convo, context),
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

		// const response = await cohere
		// 	.generate({
		// 		model: 'command-xlarge-nightly',
		// 		prompt: expressModel(convo, context),
		// 		max_tokens: 650,
		// 		temperature: 0.2,
		// 		k: 0,
		// 		p: 0.75,
		// 		frequency_penalty: 0,
		// 		presence_penalty: 0,
		// 		stop_sequences: ['Human:'],
		// 		return_likelihoods: 'NONE',
		// 	})
		// 	.catch(async () => {
		// 		await interaction.editReply({
		// 			content: 'Error with COHERE',
		// 		});
		// 	});

		// const text = response.body.generations[0].text;
		// console.log(text);
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
exports.expressCommand = expressCommand;
