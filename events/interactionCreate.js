/*
    Name: interactionCreate.js
    Description: Event that runs when an interaction is created
    Author: Salafi Bot Team
    License: MIT
*/

import { Events, MessageFlags } from 'discord.js'; // Import necessary classes from discord.js
import { Modules } from '../src/modules.js'; // Import the Modules class to manage bot modules
import { Commands } from '../src/commands.js'; // Import the Commands class to manage bot commands

export default {
	name: Events.InteractionCreate,
	async execute(interaction) {
		// Check if the interaction is a chat input command (slash command)
		// If not, return early to avoid unnecessary processing
		if (!interaction.isChatInputCommand()) return;

		// Log the interaction to the console
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`[ERROR] No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			// Check if module is enabled in config
			if (Modules.getModuleByName(Commands.getCommandByName(command.data.name).module) && Modules.getModuleByName(Commands.getCommandByName(command.data.name).module).enabled === true) {
				//Check if the command is enabled
				if (Commands.getCommandByName(command.data.name) && Commands.getCommandByName(command.data.name).enabled === true) {
					await command.execute(interaction);
				}
				// If the command is not enabled, send an error message to the user
				else {
					await interaction.reply({
						content: `The command \`${command.data.name}\` is currently disabled.`,
						flags: MessageFlags.Ephemeral,
					});
				}
			} else {
				// If the module is disabled, send an error message to the user
				await interaction.reply({
					content: `The module \`${Modules.getModuleByName(Commands.getCommandByName(command.data.name).module)}\` is currently disabled.`,
					flags: MessageFlags.Ephemeral,
				});
			}
		} catch (error) {
			console.error(`[ERROR] Error executing ${interaction.commandName}:`, error);

			const errorMessage = {
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			};

			if (interaction.replied || interaction.deferred) {
				await interaction.followUp(errorMessage);
			} else {
				await interaction.reply(errorMessage);
			}
		}
	},
};