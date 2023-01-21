const trimText = response => {
	const index = response.body.generations[0].text.indexOf('==');
	return response.body.generations[0].text.slice(0, index);
};
exports.trimText = trimText;
