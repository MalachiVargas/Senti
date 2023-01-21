const { Client } = require('discord.js');

const client = new Client({ intents: 32767 });
exports.client = client;
