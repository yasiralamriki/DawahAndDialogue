/*
	Name: ping.js
	Description: Command to get the bot's latency
	Author: Salafi Bot Team
	License: MIT
*/

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js'); // Import necessary classes from discord.js
const colors = require('../../config.json').colors; // Import colors from the config file

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Gets the bot\'s latency'),
	async execute(interaction) {
		// Create an embed with the bot's latency
		const pingEmbed = new EmbedBuilder()
			.setColor(colors.primary) // Set the embed color from the config file
			.setTitle('Bot latency')
			.setDescription(`🏓 Pong! Latency is ${Date.now() - interaction.createdTimestamp}ms`)
			.setTimestamp()
			.setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

		// Reply to the interaction with the embed
		await interaction.reply({ embeds: [pingEmbed] });
	},
};