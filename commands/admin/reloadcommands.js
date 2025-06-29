/*
	Name: reloadCommands.js
	Description: Command to reload the bot commands
	Author: Salafi Bot Team
	License: MIT
*/

const { SlashCommandBuilder } = require('discord.js'); // Import necessary classes from discord.js
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

module.exports = {
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
					// Clear the require cache for this file
					delete require.cache[require.resolve(filePath)];

					// Re-require the command file
					const command = require(filePath);

					if ('data' in command && 'execute' in command) {
						interaction.client.commands.set(command.data.name, command);
						reloadedCommands.push(command.data.name);
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
			replyMessage += `Reloaded ${reloadedCommands.length} commands`;
		}
		if (failedCommands.length > 0) {
			replyMessage += `Failed to reload ${failedCommands.length} commands`;
		}
		if (!replyMessage) {
			replyMessage = 'No commands found to reload.';
		}

		await interaction.editReply(replyMessage);
	},
};