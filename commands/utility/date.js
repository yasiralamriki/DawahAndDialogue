/*
    Name: date.js
    Description: Command to get the current date and time
    Author: Salafi Bot Team
    License: MIT
*/

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'; // Import necessary classes from discord.js
import config from '../../config.json' with { type: 'json' }; // Import config file (Node.js 20+ or with loader)

export default {
    data: new SlashCommandBuilder()
        .setName('date')
        .setDescription('Gets the current date and time')
        .addBooleanOption(option =>
            option.setName('24_hour_time')
                .setDescription('Whether to show the time in 24-hour format')
                .setRequired(false) // Optional option
        ),
    async execute(interaction) {
        // Get current date
        const date = new Date();

        // Gregorian date (formatted)
        const gregorianDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Hijri date (formatted)
        const hijriDate = date.toLocaleDateString('en-TN-u-ca-islamic', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Time
        const time = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: interaction.options.getBoolean('24_hour_time') !== true // Check if 24-hour format is requested
        });

        // Create an embed with the current date and time
        const dateEmbed = new EmbedBuilder()
            .setColor(config.colors.primary) // Set the embed color from the config file
            .setTitle('Current Date and Time')
            .addFields(
                { name: 'Hijri Date', value: hijriDate, inline: false },
                { name: 'Gregorian Date', value: gregorianDate, inline: false },
                { name: 'Time', value: time, inline: false }
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

        // Reply to the interaction with the embed
        await interaction.reply({ embeds: [dateEmbed] });
    },
};