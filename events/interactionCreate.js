/*
	Name: interactionCreate.js
	Description: Event that runs when an interaction is created
	Author: Salafi Bot Team
	License: MIT
*/

const { Events, MessageFlags } = require('discord.js'); // Import necessary classes from discord.js

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		// Check if the interaction is a chat input command (slash command)
		// If not, return early to avoid unnecessary processing
		if (!interaction.isChatInputCommand()) return;

		// Log the command name for debugging purposes
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			// Log the command execution
			await command.execute(interaction);
		} catch (error) {
			// Log the error to the console and send an ephemeral message to the user
			// Ephemeral messages are only visible to the user who invoked the command
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				// If the interaction has already been replied to or deferred, use followUp
				await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
			} else {
				// If the interaction has not been replied to, use reply
				await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
			}
		}
	},
};