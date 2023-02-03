const fetchCurrentSession = async (user_id) => {
	const res = await fetch('https://SentiBot.malachivargas.repl.co/get_chatroom_ids',
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.strngify({
				user_id,
			}),
		});
	const data = await res.json();
	return data;
};

module.exports = {
	fetchCurrentSession,
};