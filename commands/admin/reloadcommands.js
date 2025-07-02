/*
	Name: reloadCommands.js
	Description: Command to reload the bot commands
	Author: Salafi Bot Team
	License: MIT
*/

import { SlashCommandBuilder } from 'discord.js'; // Import necessary classes from discord.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url'; // Import for __dirname fix

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
	data: new SlashCommandBuilder()
		.setName('reloadcommands')
		.setDescription('Reloads the bot commands.')
		.setDefaultMemberPermissions(0)
		.addBooleanOption(option =>
			option.setName('global')
				.setDescription('Reload commands globally or to the test server.')
				.setRequired(true),
		),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true }); // Defer the reply to allow time for command processing

		// Check if the user is the bot owner
		if (interaction.user.id !== config.ownerid) {
			await interaction.editReply({ content: 'You are not authorized to use this command.', ephemeral: true });
			return;
		}

		const reloadedCommands = [];
		const failedCommands = [];

		// Grab all the command folders from the commands directory you created earlier
		const foldersPath = path.join(__dirname, '..', '..', 'commands');
		const commandFolders = fs.readdirSync(foldersPath);

		// Loop through each folder in the commands directory
		for (const folder of commandFolders) {
			// Grab all the command files from the commands directory you created earlier
			const commandsPath = path.join(foldersPath, folder);
			const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

			// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
			for (const file of commandFiles) {
				// Import the command file
				// Ensure the file is a valid command file by checking for 'data' and 'execute' properties
				if (!file.endsWith('.js')) continue; // Skip non-JS files
				const filePath = path.join(commandsPath, file);

				try {
					// Convert file path to file URL for ES6 import
					const fileURL = pathToFileURL(filePath).href;

					// Add cache busting parameter to force reload
					const cacheBustURL = `${fileURL}?update=${Date.now()}`;

					// Re-import the command file
					const command = await import(cacheBustURL);

					if ('data' in command.default && 'execute' in command.default) {
						// Add module name to command
						command.default.module = folder;
						interaction.client.commands.set(command.default.data.name, command.default);
						reloadedCommands.push(command.default.data.name);
					} else {
						failedCommands.push(`${file} - Missing "data" or "execute" property`);
					}
				} catch (error) {
					console.error(error);
					failedCommands.push(`${file} - ${error.message}`);
				}
			}
		}

		// Send a single reply with the results
		let replyMessage = '';
		if (reloadedCommands.length > 0) {
			replyMessage += `Reloaded ${reloadedCommands.length} commands: ${reloadedCommands.join(', ')}`;
		}
		if (failedCommands.length > 0) {
			replyMessage += `Failed to reload ${failedCommands.length} commands:\n${failedCommands.join('\n')}`;
		}
		if (!replyMessage) {
			replyMessage = 'No commands found to reload.';
		}

		await interaction.editReply(replyMessage);
	},
};