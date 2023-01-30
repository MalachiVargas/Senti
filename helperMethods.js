const { Collection } = require('discord.js');
const { Users } = require('./dbObjects.js');


const currentSessionCache = new Collection();

const setCurrentSession = async (userId, sessionId) => {
	const user = await getCurrentSession(userId);
	console.log(user);
	if (user) {
		user.current_session_id = sessionId;
		return user.save();
	}

	const newUser = await Users.create({ user_id: userId, current_session_id: sessionId });
	currentSessionCache.set(userId, newUser);

	return newUser;
};

const getCurrentSession = async (userId) => {
	const user = currentSessionCache.get(userId);
	if (!user) {
		return null;
	}

	return user.current_session_id;
};


exports.currentSessionCache = currentSessionCache;
exports.setCurrentSession = setCurrentSession;
exports.getCurrentSession = getCurrentSession;