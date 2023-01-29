const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	storage: 'database.sqlite',
});

const Users = require('./models/Users.js')(sequelize, Sequelize.DataTypes);
const Sessions = require('./models/Sessions.js')(sequelize, Sequelize.DataTypes);

Sessions.belongsTo(Users, { foreignKey: 'user_id', as: 'user' });

Reflect.defineProperty(Users.prototype, 'setCurrentSession', {
	value: async session => {
		await Users.update({ current_session_id: session.session_id }, { where: { user_id: this.user_id } });
		const updatedUser = await Users.findOne({ where: { user_id: this.user_id } });
		return updatedUser;
	},
});

Reflect.defineProperty(Sessions.prototype, 'addSession', {
	value: async session => {
		const newSession = await Sessions.create({ user_id: this.user_id, session_id: session.session_id, description: session.description });
		return newSession;
	},
});


Reflect.defineProperty(Sessions.prototype, 'sessions', {
	value: () => {
		return Sessions.findAll({
			where: { user_id: this.user_id },
			include: ['user'],
		});
	},
});

module.exports = { Users, Sessions };
