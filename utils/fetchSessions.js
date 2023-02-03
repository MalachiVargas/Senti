const fetchSessions = async (user_id) => {
	const res = await fetch(`https://SentiBot.malachivargas.repl.co/get_chatroom_ids/${user_id}`);
	const data = await res.json();
	return data;
};

module.exports = {
	fetchSessions,
};