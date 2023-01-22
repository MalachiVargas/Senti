const { SlashCommandBuilder } = require('discord.js');
const cohere = require('cohere-ai');
const { suggesModel } = require('./suggesModel');

cohere.init(process.env.COHERE);

const suggestCommand = {
	...new SlashCommandBuilder()
		.setName('suggest')
		.setDescription('Suggest What to Say Next!')
		.addStringOption(option =>
			option.setName('input').setDescription('The input text you want me to respond to.').setRequired(true),
		),
	async execute(interaction) {
		await interaction.deferReply({
			ephemeral: true,
		});
		const input = interaction.options.getString('input');
		const response = await cohere
			.generate({
				model: 'command-xlarge-nightly',
				prompt: suggesModel(input),
				max_tokens: 650,
				temperature: 1.1,
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
		if (text == '-' || text.length <= 5) {
			await interaction.editReply({
				content: 'Error With Suggest Please ReSubmit',
			});
		} else {
			await interaction.editReply({
				content: `${input} ${text}`,
			});
		}
	},
};
exports.suggestCommand = suggestCommand;
