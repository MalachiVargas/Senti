const { SlashCommandBuilder } = require("discord.js");
const { client } = require("./client");

const cohere = require("cohere-ai");
cohere.init(process.env.COHERE);

const summarizeCommand = {
    ...new SlashCommandBuilder()
        .setName("summarize")
        .setDescription("Summarize Messages in Channel")
        .addIntegerOption((option) =>
            option
                .setName("number")
                .setDescription("How Many Messages to Summarize")
                .setRequired(true)
        ),

    async execute(interaction) {
        const channel = client.channels.cache.get(interaction.channel.id);
        const input = interaction.options.getInteger("number");
        await interaction.deferReply();
        let messagesTxt = "";
        await channel.messages
            .fetch({ limit: input })
            .then((messages) => {
                messages.forEach((message) => {
                    messagesTxt += message.content;
                });
            })
            .then(async () => {
                if (messagesTxt === "") {
                    throw new Error("Empty");
                }
                await interaction.editReply({
                    content: `Generating Response...`,
                });
                const response = await cohere.generate({
                    model: "xlarge",
                    prompt: `Summarize this dialogue:\nCustomer: Please connect me with a support agent.\nAI: Hi there, how can I assist you today?\nCustomer: I forgot my password and lost access to the email affiliated to my account. Can you please help me?\nAI: Yes of course. First I\'ll need to confirm your identity and then I can connect you with one of our support agents.\nTLDR: A customer lost access to their account.\n--\nSummarize this dialogue:\nAI: Hi there, how can I assist you today?\nCustomer: I want to book a product demo.\nAI: Sounds great. What country are you located in?\nCustomer: I\'ll connect you with a support agent who can get something scheduled for you.\nTLDR: A customer wants to book a product demo.\n--\nSummarize this dialogue:\nAI: Hi there, how can I assist you today?\nCustomer: ${messagesTxt} \nAI: I can pull this for you, just a moment.\nTLDR:"`,
                    max_tokens: 300,
                    temperature: 0.6,
                    k: 0,
                    p: 1,
                    frequency_penalty: 0,
                    presence_penalty: 0,
                    stop_sequences: ["--"],
                    return_likelihoods: "NONE",
                }).catch(async () => {
                    await interaction.editReply({
                        content: `Error with COHERE`,
                    });
                });

                const index = response.body.generations[0].text.indexOf("==");
                const replyTxt = response.body.generations[0].text.slice(0, index);
                await interaction.editReply({
                    content: `Summary: ${replyTxt}`,
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
