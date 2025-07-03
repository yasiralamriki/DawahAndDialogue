/*
    Name: deployCommand.js
    Description: Command to deploy the bot commands to the server with individual targeting
    Author: Salafi Bot Team
    License: MIT
*/

import { SlashCommandBuilder, REST, Routes } from 'discord.js'; // Import necessary classes from discord.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import dotenv from 'dotenv';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load config json
import config from '../../config.json' with { type: 'json' };

// Load environment variables from .env file
dotenv.config();
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.DISCORD_TOKEN;

export default {
	data: new SlashCommandBuilder()
		.setName('deploycommand')
		.setDescription('Deploys the bot commands to the server.')
		.addBooleanOption((option) =>
			option
				.setName('global')
				.setDescription('Deploy commands globally or to the test server.')
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName('command')
				.setDescription(
					'Specific command to deploy (leave empty to deploy all commands)',
				)
				.setRequired(false),
		),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true }); // Defer the reply to allow time for command processing

		// Check if the user is an admin
		if (!interaction.client.config.admins.includes(interaction.user.id)) {
			await interaction.editReply({ content: 'You are not authorized to use this command.', ephemeral: true });
			return;
		}

		const specificCommand = interaction.options.getString('command');
		const commands = []; // Create an array to hold the command data
		// Grab all the command folders from the commands directory you created earlier
		const foldersPath = path.join(__dirname, '..', '..', 'commands');
		const commandFolders = fs.readdirSync(foldersPath);

		// Loop through each folder in the commands directory
		for (const folder of commandFolders) {
			// Grab all the command files from the commands directory you created earlier
			const commandsPath = path.join(foldersPath, folder);
			const commandFiles = fs
				.readdirSync(commandsPath)
				.filter((file) => file.endsWith('.js'));
			// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
			for (const file of commandFiles) {
				// Import the command file
				// Ensure the file is a valid command file by checking for 'data' and 'execute' properties
				if (!file.endsWith('.js')) continue; // Skip non-JS files
				const filePath = path.join(commandsPath, file);
				const fileURL = pathToFileURL(filePath).href; // Convert to file URL
				const command = await import(fileURL); // Use dynamic import

				if ('data' in command.default && 'execute' in command.default) {
					// If a specific command is requested, only deploy that command
					if (specificCommand && command.default.data.name !== specificCommand) {
						continue;
					}
					commands.push(command.default.data.toJSON());
				} else {
					await interaction.editReply(
						`The command at ${filePath} is missing a required "data" or "execute" property.`,
					);
					return;
				}
			}
		}

		// Check if specific command was found
		if (specificCommand && commands.length === 0) {
			await interaction.editReply(`Command "${specificCommand}" not found.`);
			return;
		}

		// Construct and prepare an instance of the REST module
		const rest = new REST().setToken(token);

		// and deploy your commands!
		(async () => {
			try {
				const global = interaction.options.getBoolean('global'); // Get the value of the 'global' option from the interaction
				let route; // Declare a variable to hold the route for deploying commands

				if (specificCommand) {
					await interaction.editReply(
						`Started deploying command "${specificCommand}". This may take a few seconds...`,
					);
				} else {
					await interaction.editReply(
						`Started refreshing ${commands.length} application (/) commands. This may take a few seconds...`,
					);
				}

				// Determine the route based on the user's choice of global or test server deployment
				if (global === true) {
					// If the user selected 'true', deploy commands globally
					route = Routes.applicationCommands(clientId);
				} else {
					// If the user selected 'false', deploy commands to the test server
					route = Routes.applicationGuildCommands(clientId, guildId);
				}

				// The put method is used to fully refresh all commands in the guild with the current set
				if (specificCommand) {
					// If deploying a specific command, we need to get all existing commands first
					// and replace/add the specific one
					const existingCommands = await rest.get(route);
					const updatedCommands = existingCommands.filter(
						(cmd) => cmd.name !== specificCommand,
					);
					updatedCommands.push(...commands);

					await rest.put(route, { body: updatedCommands });
					await interaction.editReply(
						`Successfully deployed command "${specificCommand}".`,
					);
				} else {
					// The put method is used to fully refresh all commands in the guild with the current set
					const data = await rest.put(route, { body: commands });

					await interaction.editReply(
						`Successfully reloaded ${data.length} application (/) commands.`,
					);
				}
			} catch (error) {
				// And of course, make sure you catch and log any errors!
				console.error(error);
				await interaction.editReply(
					`There was an error while deploying commands: ${error.message}`,
				);
			}
		})();
	},
};