/*
    Name: module.js
    Description: Command to manage bot modules
    Author: Salafi Bot Team
    License: MIT
*/

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'; // Import necessary classes from discord.js
import config from '../../config.json' with { type: 'json' }; // Import the config file for colors and other settings
import path from 'node:path'; // Import the path module for file paths
import { fileURLToPath } from 'node:url'; // Import for __dirname fix
import { Modules } from '../../src/modules.js'; // Import the Modules class for module management
import { Commands } from '../../src/commands.js'; // Import the Commands class for command management

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
	data: new SlashCommandBuilder()
		.setName('module')
		.setDescription('Manages bot modules')
		.addSubcommand(subcommand =>
			subcommand
				.setName('enable')
				.setDescription('Enable a bot module')
				.addStringOption(option =>
					option.setName('module')
						.setDescription('The name of the module to enable')
						.setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('disable')
				.setDescription('Disable a bot module')
				.addStringOption(option =>
					option.setName('module')
						.setDescription('The name of the module to disable')
						.setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('deploy')
				.setDescription('Deploy a bot module')
				.addStringOption(option =>
					option.setName('module')
						.setDescription('The name of the module to deploy')
						.setRequired(true))
				.addBooleanOption(option =>
					option.setName('globally')
						.setDescription('Deploy the module globally (default: false)')
						.setRequired(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('reload')
				.setDescription('Reload a bot module')
				.addStringOption(option =>
					option.setName('module')
						.setDescription('The name of the module to reload')
						.setRequired(true))
		),
	async execute(interaction) {
		// Check if the user is an admin
		if (!config.admins.includes(interaction.user.id)) {
			await interaction.editReply({ content: 'You are not authorized to use this command.', ephemeral: true });
			return;
		}

		await interaction.deferReply({ ephemeral: true }); // Defer the reply to allow time for command processing

		// Get the subcommand and module name from the interaction
		const subcommand = interaction.options.getSubcommand();
		const moduleName = interaction.options.getString('module');

		if (subcommand === 'enable' || subcommand === 'disable') {
			if (Modules.getModuleByName(moduleName) === null) {
				// If the module does not exist, send an error message
				const errorEmbed = new EmbedBuilder()
					.setColor(config.colors.primary) // Set the embed color from the config file
					.setTitle(`${subcommand === 'enable' ? 'Enable' : 'Disable'} Module: ${moduleName}`)
					.setDescription(`The module **${moduleName}** does not exist. Please check the module name and try again.`)
					.setTimestamp()
					.setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

				await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
				return;
			} else {
				// Create an embed with the user's avatar
				const moduleEmbed = new EmbedBuilder()
					.setColor(config.colors.primary) // Set the embed color from the config file
					.setTitle(`${subcommand === 'enable' ? 'Enable' : 'Disable'} Module: ${moduleName}`)
					.setDescription(`You have requested to ${subcommand === 'enable' ? 'enable' : 'disable'} the module: **${moduleName}**.`)
					.setTimestamp()
					.setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

				moduleEmbed.setDescription(`${subcommand === 'enable' ? 'Enabling' : 'Disabling'} the module: **${moduleName}**.`);
				if (subcommand === 'enable') {
					// Check if the module is already enabled
					if (Modules.getModuleByName(moduleName) && Modules.getModuleByName(moduleName).enabled === true) {
						moduleEmbed.setDescription(`[ERROR] The module **${moduleName}** is already enabled.`);
					} else {
						// Call the enable function
						try {
							const result = Modules.enableModule(moduleName);

							resultEmbed.setDescription(result);
							await interaction.editReply({ embeds: [resultEmbed], ephemeral: true });
						} catch (error) {
							resultEmbed.setDescription(`[ERROR] Failed to enable module: **${moduleName}**\n${error.message}`);
							await interaction.editReply({ embeds: [resultEmbed], ephemeral: true });
						}
					}
				} else if (subcommand === 'disable') {
					// Check if the module is already disabled
					if (Modules.getModuleByName(moduleName) && Modules.getModuleByName(moduleName).enabled === false) {
						moduleEmbed.setDescription(`[ERROR] The module **${moduleName}** is already disabled.`);
					} else {
						// Call the disable function
						try {
							const result = Modules.disableModule(moduleName);

							resultEmbed.setDescription(result);
							await interaction.editReply({ embeds: [resultEmbed], ephemeral: true });
						} catch (error) {
							resultEmbed.setDescription(`[ERROR] Failed to disable module: **${moduleName}**\n${error.message}`);
							await interaction.editReply({ embeds: [resultEmbed], ephemeral: true });
						}
					}
				}
				
				// Reply to the interaction with the embed
				await interaction.editReply({ embeds: [moduleEmbed] });
			}
		} else if (subcommand === 'deploy' || subcommand === 'reload') {
			if (subcommand === 'deploy') {
				// Create an embed for the deployment result
				const resultEmbed = new EmbedBuilder()
					.setColor(config.colors.primary)
					.setTitle('Module Deployment')
					.setDescription(`Deploying module: **${moduleName}**`)
					.setTimestamp()
					.setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

				// Call the deploy function
				try {
					const result = await Modules.deployModule(moduleName, interaction.options.getBoolean('globally'));

					resultEmbed.setDescription(result);
					await interaction.editReply({ embeds: [resultEmbed], ephemeral: true });
				} catch (error) {
					resultEmbed.setDescription(`[ERROR] Failed to deploy module: **${moduleName}**\n${error.message}`);
					await interaction.editReply({ embeds: [resultEmbed], ephemeral: true });
				}
			} else if (subcommand === 'reload') {
				// Create an embed for the reload result
				const reloadEmbed = new EmbedBuilder()
					.setColor(config.colors.primary)
					.setTitle('Module Reload')
					.setDescription(`Reloading module: **${moduleName}**`)
					.setTimestamp()
					.setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

				// Call the reload function
				try {
					const result = await Modules.reloadModule(moduleName, interaction);

					reloadEmbed.setDescription(result);
					await interaction.editReply({ embeds: [reloadEmbed], ephemeral: true });
				} catch (error) {
					reloadEmbed.setDescription(`[ERROR] Failed to reload module: **${moduleName}**\n${error.message}`);
					await interaction.editReply({ embeds: [reloadEmbed], ephemeral: true });
				}
			}
		}
	},
};