/*
    Name: date.js
    Description: Command to get the current date and time
    Author: Salafi Bot Team
    License: MIT
*/

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'; // Import necessary classes from discord.js
import config from '../../config.json' with { type: 'json' }; // Import config file (Node.js 20+ or with loader)

// Get current date
const now = new Date();

// Gregorian date (formatted)
const gregorianDate = now.toLocaleDateString('en-GB', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

// Hijri date (formatted)
const hijriDate = now.toLocaleDateString('en-TN-u-ca-islamic', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

export default {
    data: new SlashCommandBuilder()
        .setName('date')
        .setDescription('Gets the current date and time'),
    async execute(interaction) {
        // Create an embed with the current date and time
        const dateEmbed = new EmbedBuilder()
            .setColor(config.colors.primary) // Set the embed color from the config file
            .setTitle('Current Date and Time')
            .addFields(
                { name: 'Hijri Date', value: hijriDate, inline: false },
                { name: 'Gregorian Date', value: gregorianDate, inline: false },
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

        // Reply to the interaction with the embed
        await interaction.reply({ embeds: [dateEmbed] });
    },
};