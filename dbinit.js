const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const Sessions = require('./models/Sessions.js')(sequelize, Sequelize.DataTypes);
const Users = require('./models/Users.js')(sequelize, Sequelize.DataTypes);


const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {

	const userList = [
		// Users.create({ user_id: '243235850777919488', current_session_id: null }),
		Users.create({ user_id: '333750716675915776', current_session_id: null }),
	];

	await Promise.all(userList);
	console.log('Users Created');

	const sessionList = [
		// Sessions.upsert({ user_id: '243235850777919488', session_id: 'chat-cae2aafb-836f-4496-b0f5-462758aa76bb-dcfc3e07-7189-413e-a42f-68bb50df284f', description: 'Social Advice' }),
		Sessions.upsert({ user_id: '333750716675915776', session_id: 'chat-cae2aafb-836f-4496-b0f5-462758aa76bb-75a19881-dbf3-4b8b-bd52-9b8c51c2c797', description: 'Emotional Intelligence' }),
	];

	await Promise.all(sessionList);
	console.log('Sessions created');

	sequelize.close();
}).catch(console.error);
