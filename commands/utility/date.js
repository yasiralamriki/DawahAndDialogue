/*
    Name: date.js
    Description: Command to get the current date and time
    Author: Salafi Bot Team
    License: MIT
*/

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'; // Import necessary classes from discord.js
import config from '../../config.json' with { type: 'json' }; // Import config file (Node.js 20+ or with loader)
import dayjs from 'dayjs'; // Import dayjs for date formatting
import utc from 'dayjs/plugin/utc.js'; // Import UTC plugin for dayjs to handle UTC time
import timezone from 'dayjs/plugin/timezone.js'; // Import timezone plugin for dayjs
import calendarSystems from '@calidy/dayjs-calendarsystems'; // Import calendar systems plugin for dayjs
import islamicCalendarSystem from '@calidy/dayjs-calendarsystems/calendarSystems/HijriCalendarSystem.js'; // Import Islamic calendar system for dayjs

// Extend dayjs with necessary plugins
dayjs.extend(utc); // Extend dayjs with the UTC plugin
dayjs.extend(timezone); // Extend dayjs with the timezone plugin
dayjs.extend(calendarSystems); // Extend dayjs with the calendar systems plugin

// Set the default timezone
dayjs.tz.setDefault('America/New_York'); // Set the default timezone to New York (Eastern Time)

// Register hijri calendar system
dayjs.registerCalendarSystem('hijri', new islamicCalendarSystem());

export default {
    data: new SlashCommandBuilder()
        .setName('date')
        .setDescription('Gets the current date and time'),
    async execute(interaction) {
        // Gregorian date and time
        const gregorianDate = dayjs().tz().format('YYYY/MM/DD');
        const gregorianTime = dayjs().tz().format('HH:mm:ss');

        // Hijri date - convert current date to Hijri and format as string
        const hijriDate = dayjs().tz().toCalendarSystem('hijri').format('YYYY/MM/DD');

        // Create an embed with the current date and time
        const dateEmbed = new EmbedBuilder()
            .setColor(config.colors.primary) // Set the embed color from the config file
            .setTitle('Current Date and Time')
            .addFields(
                { name: 'Hijri Date', value: "Placeholder", inline: false },
                { name: 'Gregorian Date', value: gregorianDate, inline: false },
                { name: 'Time', value: gregorianTime, inline: false },
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

        // Reply to the interaction with the embed
        await interaction.reply({ embeds: [dateEmbed] });
    },
};