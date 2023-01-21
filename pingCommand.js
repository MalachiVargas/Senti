const pingCommand = {
    name: `ping`,
    description: `Ping!`,
    async execute(interaction) {
        // Execute function
        await interaction.reply({
            content: `Pong.`,
        });
    },
};
exports.pingCommand = pingCommand;
