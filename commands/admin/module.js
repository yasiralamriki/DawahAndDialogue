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
		),
	async execute(interaction) {
		// Check if the user is an admin
		if (!interaction.client.config.admins.includes(interaction.user.id)) {
			await interaction.editReply({ content: 'You are not authorized to use this command.', ephemeral: true });
			return;
		}

		// Get the subcommand and module name from the interaction
		const subcommand = interaction.options.getSubcommand();
		const moduleName = interaction.options.getString('module');

		if (Modules.getModuleByName(moduleName) === null) {
			// If the module does not exist, send an error message
			await interaction.reply({ content: `The module **${moduleName}** does not exist.`, ephemeral: true });
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
					moduleEmbed.setDescription(`The module **${moduleName}** is already enabled.`);
				} else {
					Modules.enableModule(moduleName); // Enable the module
					moduleEmbed.setDescription(`The module **${moduleName}** has been enabled.`);
				}
			} else if (subcommand === 'disable') {
				// Check if the module is already disabled
				if (Modules.getModuleByName(moduleName) && Modules.getModuleByName(moduleName).enabled === false) {
					moduleEmbed.setDescription(`The module **${moduleName}** is already disabled.`);
				} else {
					Modules.disableModule(moduleName); // Disable the module
					moduleEmbed.setDescription(`The module **${moduleName}** has been disabled.`);
				}
			}
			
			// Reply to the interaction with the embed
			await interaction.reply({ embeds: [moduleEmbed] });
		}
	},
};