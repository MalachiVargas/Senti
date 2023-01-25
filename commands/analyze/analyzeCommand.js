const { SlashCommandBuilder } = require('discord.js');

const cohere = require('cohere-ai');
const { client } = require('../../utils/client');
const { analyzeModel } = require('./analyzeModel');
const { processMemories } = require('../../utils/memoryHelper');


cohere.init(process.env.COHERE);

const analyzeCommand = {
	...new SlashCommandBuilder()
		.setName('analyze')
		.setDescription('Analyze the content and tone of a conversation, and provide feedback on strengths and weaknesses')
		.addUserOption(option =>
			option.setName('user').setDescription('Choose the a convo with a user to analyze').setRequired(true),
		)
		.addIntegerOption(option =>
			option.setName('amount').setDescription('Enter the amount of messages to analyze. Default: 10'),
		),

	async execute(interaction) {
		const channel = client.channels.cache.get(interaction.channel.id);
		const messageAmount = interaction.options.getInteger('amount') ? interaction.options.getInteger('amount') : 10;
		const targetUser = interaction.options.getUser('user');
		const interactionAuthor = interaction.user;
		await interaction.deferReply({
			ephemeral: true,
		});
		const conversation = [];

		await channel.messages.fetch({ limit: messageAmount + 1 })
			.then(async messages => {
				const promises = await processMemories(messages, targetUser, interactionAuthor);
				const allInfo = await Promise.all(promises);
				allInfo.forEach(info => {
					if (info) {
						conversation.push(info);
					}
				});
			})
			.then(async () => {
				if (conversation === []) {
					throw new Error('Could Not Retrieve Messages');
				}
				await interaction.editReply({
					content: 'Analyzing...',
				});
				conversation.sort((a, b) => a.time - b.time);
				console.log(targetUser, interactionAuthor);
				const prompt = await analyzeModel(targetUser, interactionAuthor, conversation);
				console.log(prompt);
				const response = await cohere
					.generate({
						model: 'command-xlarge-nightly',
						prompt: prompt,
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
					content: `**Users:**\n\n${targetUser}\n${interactionAuthor}\n\n**Reply:**\n${text}`,
				});
			})
			.catch(async error => {
				console.log(error);
				await interaction.editReply({
					content: `Error Generating Response with ${targetUser} please select present target.`,
				});
			});
	},
};

exports.analyzeCommand = analyzeCommand;
