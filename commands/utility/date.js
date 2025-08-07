/*
    Name: date.js
    Description: Command to get the current date and time
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
        .setName('date')
        .setDescription('Gets the current date and time')
        .addBooleanOption(option =>
            option.setName('24_hour_time')
                .setDescription('Whether to show the time in 24-hour format')
                .setRequired(false) // Optional option
        ),
    async execute(interaction) {
        // Command options
        const timezone = 'UTC'; // Default to UTC if no timezone is provided
        const showGregorian = interaction.options.getBoolean('gregorian') || true; // Default to true if not provided
        const is24HourTime = interaction.options.getBoolean('24_hour_time') || false; // Default to false if not provided

        // Create locales and formats for date and time
        // Using Intl.Locale and Intl.DateTimeFormat for better date handling
        const gregorianLocale = new Intl.Locale('en', {
            region: 'US',
            calendar: 'gregory',
            timeZone: timezone,
        });

        const hijriLocale = new Intl.Locale('en', {
            calendar: 'islamic',
            timeZone: timezone,
        });

        const dateFormat = new Intl.DateTimeFormat(gregorianLocale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour12: is24HourTime
        });

        const timeFormat = new Intl.DateTimeFormat(gregorianLocale, {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: is24HourTime
        });

        // Get current date
        const date = new Date();

        // Get date & time
        const gregorianDate = date.toLocaleDateString(gregorianLocale, dateFormat);
        const hijriDate = date.toLocaleDateString(hijriLocale, dateFormat);
        const time = date.toLocaleTimeString(gregorianLocale, timeFormat);

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