const expressChatModel = (convo, context) =>
	// eslint-disable-next-line no-useless-escape
	`How should I respond to the following message?: "${convo}". Some context: ${context}. Why do you recommended responding this way?`;
exports.expressChatModel = expressChatModel;