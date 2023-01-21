const { SlashCommandBuilder } = require('discord.js');
const cohere = require('cohere-ai');
const { client } = require('../../utils/client');
const { trimText } = require('../../utils/trimText');
const { summarizeModel } = require('./summarizeModel');

cohere.init(process.env.COHERE);

const summarizeCommand = {
	...new SlashCommandBuilder()
		.setName('summarize')
		.setDescription('Summarize Messages in Channel')
		.addIntegerOption(option =>
			option.setName('number').setDescription('How Many Messages to Summarize').setRequired(true),
		),

	async execute(interaction) {
		const channel = client.channels.cache.get(interaction.channel.id);
		const input = interaction.options.getInteger('number');
		await interaction.deferReply();
		let messagesTxt = '';
		await channel.messages
			.fetch({ limit: input })
			.then(messages => {
				messages.forEach(message => {
					messagesTxt += message.content;
				});
			})
			.then(async () => {
				if (messagesTxt === '') {
					throw new Error('Empty');
				}
				await interaction.editReply({
					content: 'Generating Response...',
				});
				const response = await cohere
					.generate({
						model: 'xlarge',
						prompt: summarizeModel(input),
						max_tokens: 300,
						temperature: 0.6,
						k: 0,
						p: 1,
						frequency_penalty: 0,
						presence_penalty: 0,
						stop_sequences: ['--'],
						return_likelihoods: 'NONE',
					})
					.catch(async () => {
						await interaction.editReply({
							content: 'Error with COHERE',
						});
					});

				const text = trimText(response);
				if (text == '-' || text.length <= 5) {
					throw new Error('Empty');
				}
				await interaction.editReply({
					content: `Summary: ${text}`,
				});
			})
			.catch(async () => {
				await interaction.editReply({
					content: `Error Generating Response with ${input} please increase input.`,
				});
			});
	},
};

exports.summarizeCommand = summarizeCommand;
