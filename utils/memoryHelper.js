const math = require('mathjs');
const cohere = require('cohere-ai');
const { summarizeModel } = require('../commands/summarize/summarizeModel');
const { v4: uuidv4 } = require('uuid');
cohere.init(process.env.COHERE);

const processMemories = async (messages, targetUser = '', interactionAuthor = '') => {
	const processedMemories = [];
	await Promise.all(messages.map(async message => {
		if (targetUser != '' && interactionAuthor != '') {
			if (!(message.author.id === targetUser.id || message.author.id === interactionAuthor.id) || message.content === '') {
				return;
			}
		}
		console.log(message);
		const texts = message.content.replace(/[^\w\s]/gi, '').split(' ');
		const vector = await cohere.embed({ texts: texts })
			.catch(async () => {
				console.log('Error with COHERE');
			});
		const info = {
			speaker: message.author.username,
			time: message.createdTimestamp,
			vector: vector.body.embeddings[0],
			message: `@<${message.author.id}>\n${message.content}`,
			uuid: uuidv4(),
			timestring: Date(message.createdTimestamp),
		};
		processedMemories.push(info);
	}));
	// discord outputs memories from most recent to last recent
	processedMemories.sort((a, b) => a.time - b.time);
	return processedMemories;
};

const similarity = (v1, v2) => {
	return math.divide(math.dot(v1, v2), math.multiply(math.norm(v1), math.norm(v2)));
};

const summarizeMemories = async (memories) => {
	memories = memories.sort((a, b) => a.time - b.time);
	let block = '';
	for (const mem of memories) {
		block += `${mem.message}\n\n`;
	}
	block = block.trim();
	const prompt = summarizeModel(block);
	const notes = await cohere
		.generate({
			model: 'command-xlarge-nightly',
			prompt: prompt,
			max_tokens: 200,
			temperature: 1.1,
			k: 0,
			p: 0.75,
			frequency_penalty: 0,
			presence_penalty: 0,
			stop_sequences: ['Human:'],
			return_likelihoods: 'NONE',
		})
		.catch(async () => {
			console.log('Error with COHERE');
		});

	const notesText = notes.body.generations[0].text;
	return notesText;
};

const fetchMemories = (vector, convo, count) => {
	const scores = [];
	for (let i = 0; i < convo.length; i++) {
		if (math.deepEqual(vector, convo[i].vector)) {
			continue;
		}
		const score = similarity(convo[i].vector, vector);
		convo[i].score = score;
		scores.push(convo[i]);
	}
	const ordered = scores.sort((a, b) => b.score - a.score);
	try {
		return ordered.slice(0, count);
	}
	catch (error) {
		return ordered;
	}
};

exports.fetchMemories = fetchMemories;
exports.summarizeMemories = summarizeMemories;
exports.processMemories = processMemories;