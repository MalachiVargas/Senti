const { SlashCommandBuilder } = require('discord.js');
const cohere = require('cohere-ai');
const { suggesModel } = require('./suggesModel');
const { trimText } = require('../../utils/trimText');

cohere.init(process.env.COHERE);

const suggestCommand = {
	...new SlashCommandBuilder()
		.setName('suggest')
		.setDescription('Suggest What to Say Next!')
		.addStringOption(option =>
			option.setName('input').setDescription('The input text you want me to respond to.').setRequired(true),
		),
	async execute(interaction) {
		await interaction.deferReply();
		const input = interaction.options.getString('input');
		const response = await cohere
			.generate({
				model: 'xlarge',
				prompt: suggesModel(input),
				max_tokens: 300,
				temperature: 0.4,
				k: 0,
				p: 0.75,
				frequency_penalty: 0,
				presence_penalty: 0,
				stop_sequences: [],
				return_likelihoods: 'NONE',
			})
			.catch(async () => {
				await interaction.editReply({
					content: 'Error with COHERE',
				});
			});

		await interaction.editReply({
			content: `Prediction: ${trimText(trimText(response), 'Human:')}`,
		});
	},
};
exports.suggestCommand = suggestCommand;
