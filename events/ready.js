/*
    Name: ready.js
    Description: Event that runs when the bot is ready
    Author: Salafi Bot Team
    License: MIT
*/

const { Events, ActivityType } = require('discord.js'); // Import the Events object from discord.js

// This event is fired when the client becomes ready to start working
module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        
        // Set custom activity status
        client.user.setActivity('Following the Sunnah', { type: ActivityType.Custom });
    },
};