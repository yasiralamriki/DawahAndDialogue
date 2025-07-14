/*
    Name: debug.js
    Description: Debug command for the bot to display server resources
    Author: Salafi Bot Team
    License: MIT
*/

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'; // Import necessary classes from discord.js
import config from '../../config.json' with { type: 'json' }; // Import the config file
import { Modules } from '../../src/modules.js'; // Import the Modules class for module management
import { Commands } from '../../src/commands.js'; // Import the Commands class for command management
import packageJson from '../../package.json' with { type: 'json' }; // Import the package.json file
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';

// Extend dayjs with utc plugin
dayjs.extend(utc);

// Get Discord.js version from package.json
const version = packageJson.dependencies['discord.js'];

// Function to format seconds into HH:MM:SS format
function formatSeconds(seconds) {
	return dayjs.utc(seconds * 1000).format('HH:mm:ss');
}

export default {
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
				{ name: 'Modules Loaded', value: `\`${Modules.getEnabledModuleCount()} / ${Modules.getModuleCount()}\``, inline: true },
				{ name: 'Commands Loaded', value: `\`${Commands.getEnabledCommandsCount()} / ${Commands.getCommandCount()}\``, inline: true },
			])
			.setThumbnail(interaction.client.user.displayAvatarURL())
			.setTimestamp()
			.setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

		// Reply to the interaction with the embed
		await interaction.reply({ embeds: [debugEmbed] });
	},
};