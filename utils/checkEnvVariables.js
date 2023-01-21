const checkEnvVariables = () => {
	if (!process.env.SERVER_ID || !process.env.TOKEN || !process.env.COHERE) {
		console.error('Error: TOKEN || SERVER_ID || COHERE environment variable is not set');
		process.exit(1);
	}
};
exports.checkEnvVariables = checkEnvVariables;
