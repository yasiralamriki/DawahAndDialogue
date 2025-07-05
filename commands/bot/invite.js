/*
    Name: invite.js
    Description: Command to get the bot's invite link
    Author: Salafi Bot Team
    License: MIT
*/

import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, OAuth2Scopes } from 'discord.js'; // Import necessary classes from discord.js
import config from '../../config.json' with { type: 'json' }; // Import the config file

export default {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Gets the bot\'s invite link'),
	async execute(interaction) {
		// Generate the invite link
		const link = interaction.client.generateInvite({
			permissions: [
				PermissionFlagsBits.ViewChannel,
				PermissionFlagsBits.SendMessages,
				PermissionFlagsBits.SendMessagesInThreads,
				PermissionFlagsBits.ReadMessageHistory,
			],
			scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
		});

		// Create an embed with the bot's invite link
		const inviteEmbed = new EmbedBuilder()
			.setColor(config.colors.primary) // Set the embed color from the config file
			.setTitle('Bot Invite Link')
			.addFields(
				{ name: 'Bot Invite Link', value: `[Invite the bot](${link})`, inline: false },
				{ name: 'App Invite Link', value: `[Invite the app](https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id})`, inline: false },
			)
			.setThumbnail(interaction.client.user.displayAvatarURL())
			.setTimestamp()
			.setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

		// Reply to the interaction with the embed
		await interaction.reply({ embeds: [inviteEmbed] });
	},
};