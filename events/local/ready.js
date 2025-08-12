/*
    Name: ready.js
    Description: Event that runs when the bot is ready
    Author: Salafi Bot Team
    License: MIT
*/

import { Events, ActivityType } from 'discord.js';

export default {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		console.log(`[INFO] Ready! Logged in as ${client.user.tag}`);

		// Set custom activity status
		client.user.setActivity('Monitoring Dawah & Dialogue', { type: ActivityType.Custom });
	},
};
