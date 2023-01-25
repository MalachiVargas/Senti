const { SlashCommandBuilder } = require('discord.js');
const cohere = require('cohere-ai');
const { expressModel } = require('./expressModel');

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
				.setDescription('Add some of your thoughts and how you want to express yourself.')),
	async execute(interaction) {
		await interaction.deferReply({
			ephemeral: true,
		});
		const convo = interaction.options.getString('convo');
		const context = interaction.options.getString('context') === null ? '' : interaction.options.getString('context');
		const response = await cohere
			.generate({
				model: 'command-xlarge-nightly',
				prompt: expressModel(convo, context),
				max_tokens: 650,
				temperature: 0.2,
				k: 0,
				p: 0.75,
				frequency_penalty: 0,
				presence_penalty: 0,
				stop_sequences: ['Human:'],
				return_likelihoods: 'NONE',
			})
			.catch(async () => {
				await interaction.editReply({
					content: 'Error with COHERE',
				});
			});

		const text = response.body.generations[0].text;
		console.log(text);
		if (text == '-' || text.length <= 5) {
			await interaction.editReply({
				content: 'Error With Express Please ReSubmit',
			});
		}
		else {
			await interaction.editReply({
				content: `${convo}\n${text}`,
			});
		}
	},
};
exports.expressCommand = expressCommand;
