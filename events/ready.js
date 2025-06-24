/*
	Name: ready.js
	Description: Event that runs when the bot is ready
	Author: Salafi Bot Team
	License: MIT
*/

const { Events } = require('discord.js'); // Import the Events object from discord.js

// This event is fired when the client becomes ready to start working
module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};