const { fetchMemories, summarizeMemories } = require('../../utils/memoryHelper');

const analyzeModel = async (target, author, conversation) => {
	const firstMessageVector = conversation[0].vector;
	const previousMessages = conversation.slice(1);
	// choose the top 10 matches
	const topMatchAmount = 10;
	const memories = await fetchMemories(firstMessageVector, previousMessages, topMatchAmount);
	const notes = await summarizeMemories(memories);
	const recent = [...conversation].slice(-4).map(m => m.message).join('\n\n');

	return `The following is a conversation with Senti, an expert in teaching emotional intelligence and social skills. Senti is helpful, creative, clever, and very friendly. Senti is a master in emotional intelligence and navigating social situations. Senti gives long elaborate, verbose and detailed answers to all social questions.\n\nHuman:The following are notes from earlier conversations with ${author} and ${target}:\n${notes}\n\nThe following are the most recent messages in the conversation:\n${recent}\n\nAnalyze the content and tone of the conversation between ${author} and ${target}, and provide feedback on strengths and weaknesses in ${author}'s communication. If there are no clear strengths just say "there are no clear strengths", if there are no clear weaknesses just say "there are no clear weaknesses"\n\nSenti:`;
};

exports.analyzeModel = analyzeModel;

