const trimText = (response, find = '==') => {
	let obj = {};
	if (response && response.body && response.body.generations) {
		obj = response.body.generations[0].text;
	} else {
		obj = response;
	}
	const index = obj.indexOf(find);
	if (find == '==') {
		return trimText(obj.slice(0, index), 'Human:');
	} else {
		return obj.slice(0, index);
	}
};
exports.trimText = trimText;
