const { Client, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.DirectMessages,
	GatewayIntentBits.DirectMessageReactions,
], partials: [Partials.Message, Partials.Channel, Partials.Reaction] });
exports.client = client;
