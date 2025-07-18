/*
    Name: command.js
    Description: Command to manage bot commands
    Author: Salafi Bot Team
    License: MIT
*/

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'; // Import necessary classes from discord.js
import config from '../../config.json' with { type: 'json' }; // Import the config file for colors and other settings
import path from 'node:path'; // Import the path module for file paths
import { fileURLToPath } from 'node:url'; // Import for __dirname fix
import { Commands } from '../../src/commands.js';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
	data: new SlashCommandBuilder()
		.setName('command')
		.setDescription('Manages bot commands')
		.addSubcommand(subcommand =>
			subcommand
				.setName('enable')
				.setDescription('Enable a bot command')
				.addStringOption(option =>
					option.setName('command')
						.setDescription('The name of the command to enable')
						.setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('disable')
				.setDescription('Disable a bot command')
				.addStringOption(option =>
					option.setName('command')
						.setDescription('The name of the command to disable')
						.setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('deploy')
				.setDescription('Deploy a bot command')
				.addStringOption(option =>
					option.setName('command')
						.setDescription('The name of the command to deploy')
						.setRequired(true))
				.addBooleanOption(option =>
					option.setName('globally')
						.setDescription('Deploy the command globally (default: false)')
						.setRequired(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('reload')
				.setDescription('Reload a bot command')
				.addStringOption(option =>
					option.setName('command')
						.setDescription('The name of the command to reload')
						.setRequired(true))
		),
	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true }); // Defer the reply to allow time for command processing

		// Check if the user is an admin
		if (!config.admins.includes(interaction.user.id)) {
			await interaction.editReply({ content: 'You are not authorized to use this command.', ephemeral: true });
			return;
		}

		// Get the subcommand and command name from the interaction
		const subcommand = interaction.options.getSubcommand();
		const commandName = interaction.options.getString('command');

		if (subcommand === 'enable' || subcommand === 'disable') {
			if (Commands.getCommandByName(commandName) === null) {
				// If the command does not exist, send an error message
				const errorEmbed = new EmbedBuilder()
					.setColor(config.colors.primary) // Set the embed color from the config file
					.setTitle(`${subcommand === 'enable' ? 'Enable' : 'Disable'} Command: ${commandName}`)
					.setDescription(`The command **${commandName}** does not exist. Please check the command name and try again.`)
					.setTimestamp()
					.setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

				await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
				return;
			} else {
				// Create an embed with the user's avatar
				const commandEmbed = new EmbedBuilder()
					.setColor(config.colors.primary) // Set the embed color from the config file
					.setTitle(`${subcommand === 'enable' ? 'Enable' : 'Disable'} Command: ${commandName}`)
					.setDescription(`You have requested to ${subcommand === 'enable' ? 'enable' : 'disable'} the command: **${commandName}**.`)
					.setTimestamp()
					.setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

				commandEmbed.setDescription(`${subcommand === 'enable' ? 'Enabling' : 'Disabling'} the command: **${commandName}**.`);
				if (subcommand === 'enable') {
					// Check if the command is already enabled
					if (Commands.getCommandByName(commandName) && Commands.getCommandByName(commandName).enabled === true) {
						commandEmbed.setDescription(`[ERROR] The command **${commandName}** is already enabled.`);
					} else {
						// Enable the command
						try {
							const result = Commands.enableCommand(commandName);

							commandEmbed.setDescription(result);
							await interaction.editReply({ embeds: [commandEmbed], ephemeral: true });
						} catch (error) {
							commandEmbed.setDescription(`[ERROR] Failed to enable command: **${commandName}**\n${error.message}`);
							await interaction.editReply({ embeds: [commandEmbed], ephemeral: true });
						}
					}
				} else if (subcommand === 'disable') {
					// Check if the command is already disabled
					if (Commands.getCommandByName(commandName) && Commands.getCommandByName(commandName).enabled === false) {
						commandEmbed.setDescription(`[ERROR] The command **${commandName}** is already disabled.`);
					} else {
						// Disable the command
						try {
							const result = Commands.disableCommand(commandName);

							commandEmbed.setDescription(result);
							await interaction.editReply({ embeds: [commandEmbed], ephemeral: true });
						} catch (error) {
							commandEmbed.setDescription(`[ERROR] Failed to disable command: **${commandName}**\n${error.message}`);
							await interaction.editReply({ embeds: [commandEmbed], ephemeral: true });
						}
					}
				}
				
				// Reply to the interaction with the embed
				await interaction.editReply({ embeds: [commandEmbed] });
			}
		} else if (subcommand === 'deploy' || subcommand === 'reload') {
			if (subcommand === 'deploy') {
				// Create an embed for the deployment result
				const resultEmbed = new EmbedBuilder()
					.setColor(config.colors.primary)
					.setTitle('Command Deployment')
					.setDescription(`Deploying command: **${commandName}**`)
					.setTimestamp()
					.setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

				// Call the deploy function
				try {
					const result = await Commands.deployCommand(commandName, interaction.options.getBoolean('globally'));

					resultEmbed.setDescription(result);
					await interaction.editReply({ embeds: [resultEmbed], ephemeral: true });
				} catch (error) {
					resultEmbed.setDescription(`[ERROR] Failed to deploy command: **${commandName}**\n${error.message}`);
					await interaction.editReply({ embeds: [resultEmbed], ephemeral: true });
				}
			} else if (subcommand === 'reload') {
				// Create an embed for the reload result
				const reloadEmbed = new EmbedBuilder()
					.setColor(config.colors.primary)
					.setTitle('Command Reload')
					.setDescription(`Reloading command: **${commandName}**`)
					.setTimestamp()
					.setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

				// Call the deploy function
				try {
					const result = await Commands.reloadCommand(commandName, interaction);

					reloadEmbed.setDescription(result);
					await interaction.editReply({ embeds: [reloadEmbed], ephemeral: true });
				} catch (error) {
					reloadEmbed.setDescription(`[ERROR] Failed to reload command: **${commandName}**\n${error.message}`);
					await interaction.editReply({ embeds: [reloadEmbed], ephemeral: true });
				}
			}
		}
	},
};