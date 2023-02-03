const fetchCurrentSession = async (user_id) => {
	const res = await fetch(`https://SentiBot.malachivargas.repl.co/get_current_chatroom/${user_id}`);
	const data = await res.json();
	return data;
};

module.exports = {
	fetchCurrentSession,
};