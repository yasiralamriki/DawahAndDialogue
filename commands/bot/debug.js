/*
    Name: debug.js
    Description: Debug command for the bot to display server resources
    Author: Salafi Bot Team
    License: MIT
*/

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js'); // Import necessary classes from discord.js
const config = require('../../config.json'); // Import the config file
const dayjs = require('dayjs'); // Import dayjs for date formatting
const utc = require('dayjs/plugin/utc'); // Import UTC plugin for dayjs to handle UTC time
const version = require('../../package.json').dependencies['discord.js']; // Import the Discord.js version

dayjs.extend(utc);

function formatSeconds(seconds) {
	return dayjs.utc(seconds * 1000).format('HH:mm:ss');
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('debug')
		.setDescription('Gets the bot\'s debug information'),
	async execute(interaction) {
		// Create an embed with the bot's debug information
		const debugEmbed = new EmbedBuilder()
			.setColor(config.colors.primary) // Set the embed color from the config file
			.setTitle('Bot Debug Information')
			.addFields([
				{ name: 'Latency', value: `\`${interaction.client.ws.ping} ms\``, inline: true },
				{ name: 'Uptime', value: `\`${formatSeconds(Math.floor(interaction.client.uptime / 1000))}\``, inline: true },
				{ name: 'Memory Usage', value: `\`${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB\``, inline: true },
				{ name: 'CPU Usage', value: `\`${(process.cpuUsage().system / 1024 / 1024).toFixed(2)} %\``, inline: true },
				{ name: 'Node.js Version', value: `\`${process.version}\``, inline: true },
				{ name: 'Discord.js Version', value: `\`${version}\``, inline: true },
				{ name: 'Guild Count', value: `\`${interaction.client.guilds.cache.size}\``, inline: true },
				{ name: 'User Count', value: `\`${interaction.client.users.cache.size}\``, inline: true },
				{ name: 'Modules Loaded', value: `\`${Object.keys(config.modules).length} / ${Object.values(config.modules).filter(Boolean).length}\``, inline: true },
				{ name: 'Commands Loaded', value: `\`${Object.keys(config.commands).length} / ${Object.values(config.commands).filter(Boolean).length}\``, inline: true },
			])
			.setThumbnail(interaction.client.user.displayAvatarURL())
			.setTimestamp()
			.setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

		// Reply to the interaction with the embed
		await interaction.reply({ embeds: [debugEmbed] });
	},
};