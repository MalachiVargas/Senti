const { SlashCommandBuilder } = require("discord.js");
const cohere = require("cohere-ai");
cohere.init(process.env["COHERE"]);

const suggestCommand = {
    ...new SlashCommandBuilder()
        .setName("suggest")
        .setDescription("Suggest What to Say Next!")
        .addStringOption((option) => option
            .setName("input")
            .setDescription("The input text you want me to respond to.")
            .setRequired(true)
        ),
    async execute(interaction) {
        // Execute
        await interaction.deferReply();
        const input = interaction.options.getString("input");
        const response = await cohere.generate({
            model: "xlarge",
            prompt: `The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly. The assistant is a master in emotional intelligence and navigating social situations. The assistant gives elaborate and detailed answers to all social questions.  \n\nHuman: Hello, who are you?\nAI: I am an AI created by Cohere. How can I help you today?\nHuman: I'm talking to a friend and don't know how to respond to them. They say \"I've been using it the past few days just to help me get out of writing rut I've been in for a hot minute and just... it expresses what I'm trying to write perfectly lol\" Tell me how to respond to them based on what they said, in my voice. Explain why you recommended saying that after.\n\nAI:\"That's great to hear, I'm glad you found something that works for you! It sounds like this tool is really helping you express yourself and break through your writing rut. It can be tough to find the right words sometimes, so having something that helps you express yourself perfectly is a big plus. Keep up the good work, and let me know if you need any other resources to help you with your writing.\"\nThe reason for this response is that it acknowledges and validates the friend's experience of finding a tool that helps them express themselves better and break through their writing rut. It also shows interest in the friend's progress and encourages them to continue using the tool and let you know if they need any other resources. It also could be seen as encouraging and supportive.\n\nHuman: I'm talking to a friend and don't know how to respond to them. They say \"Hey everyone my name is Kaliel. I’m a working data scientist with education and work experience in Machine Learning. I’d like to network and contribute to any interesting projects related to AI. If there are any open source projects floating around I’d be happy for the suggestion!\" Tell me how to respond to them in my voice. Explain why you recommended saying that after.\n\nAI: \"Hi Kaliel, nice to meet you! It's great to hear that you're a working data scientist with experience in machine learning. I'm always on the lookout for new and interesting AI projects to get involved in, so I'd love to hear more about what you're currently working on or any projects you're particularly interested in. Also, I know some great open source projects that you may be interested in. Let's connect and see if there's any way we can collaborate or support each other in our work.\"\nI recommended this response because it shows interest in what Kaliel is currently working on and also opens up the possibility of collaboration or networking opportunities. Additionally, by suggesting open source projects, it shows that you are familiar with the field and can provide valuable information.\n\nHuman: I'm talking to a friend and don't know how to respond to them. They say \"${input}" Tell me how to respond to them based on what they said, in my voice. Explain why you recommended saying that after.`,
            max_tokens: 80,
            temperature: 0.4,
            k: 0,
            p: 0.75,
            frequency_penalty: 0,
            presence_penalty: 0,
            stop_sequences: [],
            return_likelihoods: "NONE",
        });

        await interaction.editReply({
            content: `Prediction: ${response.body.generations[0].text}`,
        });
    },
};
exports.suggestCommand = suggestCommand;