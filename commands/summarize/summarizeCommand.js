const { SlashCommandBuilder } = require('discord.js');
const cohere = require('cohere-ai');
const { client } = require('../../utils/client');
const { processMemories } = require('../../utils/memoryHelper');
const { summarizeMemories } = require('../../utils/memoryHelper');

cohere.init(process.env.COHERE);

const summarizeCommand = {
	...new SlashCommandBuilder()
		.setName('summarize')
		.setDescription('Summarize messages in the channel')
		.addIntegerOption(option =>
			option.setName('amount').setDescription('Enter the amount of messages to summarize. Default: 10'),
		),

	async execute(interaction) {
		const channel = client.channels.cache.get(interaction.channel.id);
		const input = interaction.options.getInteger('number') ? interaction.options.getInteger('number') : 10;
		await interaction.deferReply({
			ephemeral: true,
		});
		const users = [];
		const memories = [];
		await channel.messages
			.fetch({ limit: input + 1 })
			.then(async messages => {
				const promises = await processMemories(messages);
				const allInfo = await Promise.all(promises);
				allInfo.forEach(info => {
					if (info) {
						memories.push(info);
						users.push(info.speaker);
					}
				});
			})
			.then(async () => {
				if (memories === []) {
					throw new Error('Could Not Retrieve Messages');
				}
				await interaction.editReply({
					content: 'Generating Response...',
				});
				const inputUser = [...new Set(users)].join(', ');
				const summary = await summarizeMemories(memories)
					.catch(async () => {
						await interaction.editReply({
							content: 'Error with COHERE',
						});
					});

				if (summary == '-' || summary.length <= 5) {
					throw new Error('Empty');
				}
				await interaction.editReply({
					content: `**Users:**\n\n${inputUser}\n\n**Reply:**\n${summary}`,
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
