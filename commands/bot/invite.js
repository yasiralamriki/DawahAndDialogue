/*
    Name: invite.js
    Description: Debug command for the bot to display server resources
    Author: Salafi Bot Team
    License: MIT
*/

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, OAuth2Scopes } = require('discord.js'); // Import necessary classes from discord.js
const colors = require('../../config.json').colors; // Import colors from the config file

module.exports = {
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
			.setColor(colors.primary) // Set the embed color from the config file
			.setTitle('Bot Invite Link')
			.addFields(
				{ name: 'Bot Invite Link', value: `[Invite the bot](${link})`, inline: false },
				{ name: 'App Invite Link', value: `[Invite the app](https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id})`, inline: false },
			)
			.setDescription(`[Click here to invite the bot](${link})`)
			.setThumbnail(interaction.client.user.displayAvatarURL())
			.setTimestamp()
			.setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

		// Reply to the interaction with the embed
		await interaction.reply({ embeds: [inviteEmbed] });
	},
};