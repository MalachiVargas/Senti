const { SlashCommandBuilder } = require('discord.js');
const cohere = require('cohere-ai');
const { client } = require('../../utils/client');
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
		await interaction.deferReply({
			ephemeral: true,
		});
		let messagesTxt = '';
		const users = [];
		await channel.messages
			.fetch({ limit: input + 1 })
			.then(messages => {
				messages.forEach(message => {
					messagesTxt = `${message.author.username}\n${message.content}\n${messagesTxt}`;
					users.push(message.author.username);
				});
			})
			.then(async () => {
				if (messagesTxt.trim() === '') {
					throw new Error('Could Not Retrieve Messages');
				}
				await interaction.editReply({
					content: 'Generating Response...',
				});
				const inputUser = [...new Set(users)].join(', ');
				const response = await cohere
					.generate({
						model: 'command-xlarge-nightly',
						prompt: summarizeModel(inputUser, messagesTxt),
						max_tokens: 600,
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
					throw new Error('Empty');
				}
				await interaction.editReply({
					content: `**Users:**\n\n${inputUser}\n\n**Messages:**\n\n${messagesTxt}\n\n**Reply:**\n${text}`,
				});
			})
			.catch(async error => {
				console.log(error);
				await interaction.editReply({
					content: `Error Generating Response with ${input} please increase input.`,
				});
			});
	},
};

exports.summarizeCommand = summarizeCommand;
