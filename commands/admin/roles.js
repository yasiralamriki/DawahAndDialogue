/*
    Name: roles.js
    Description: Command for the bot to display server roles
    Author: Salafi Bot Team
    License: MIT
*/

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'; // Import necessary classes from discord.js

// Try to load local config, fallback to default config
let config;
try {
	config = await import('../../config.local.json', { with: { type: 'json' } });
	config = config.default;
} catch (e) {
	config = await import('../../config.json', { with: { type: 'json' } });
	config = config.default;
}

export default {
	data: new SlashCommandBuilder()
		.setName('roles')
		.setDescription('Gets the roles in the server'),
	async execute(interaction) {
		try {
			const rolesList = interaction.guild.roles.cache
				.sort((a, b) => b.position - a.position)
				.map(role => role.name === '@everyone' ? '@everyone' : `<@&${role.id}>`)
				.join('\n') || 'No Roles';

			const rolesEmbed = new EmbedBuilder()
				.setColor(config.colors.primary)
				.setTitle('Server Roles Information')
				.addFields([
					{ name: 'Role Count', value: `\`${interaction.guild.roles.cache.size}\``, inline: false },
					{ name: 'Roles', value: rolesList.length < 1024 ? rolesList : '[ERROR] Too many roles to display.', inline: false }
				])
				.setThumbnail(interaction.client.user.displayAvatarURL())
				.setTimestamp()
				.setFooter({ text: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() });

			await interaction.reply({ embeds: [rolesEmbed] });
		} catch (error) {
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'An error occurred while displaying roles.', ephemeral: true });
			} else {
				await interaction.reply({ content: 'An error occurred while displaying roles.', ephemeral: true });
			}
			console.error('Roles command error:', error);
		}
	},
};
