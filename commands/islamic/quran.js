/*
	Name: quran.js
	Description: Command to get a verse from the Quran
	Author: Salafi Bot Team
	License: MIT
*/

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js'); // Import necessary classes from discord.js
const colors = require('../../config.json').colors; // Import colors from the config file

module.exports = {
	data: new SlashCommandBuilder()
		.setName('quran')
		.setDescription('Gets a verse from the Quran')
        .addIntegerOption(option =>
            option.setName('surah')
            .setDescription('The surah to get')
            .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('ayah')
            .setDescription('The ayah to get')
            .setRequired(true)
        ),
	    async execute(interaction) {
        const surah = interaction.options.getInteger('surah'); // Get the surah from the interaction options
        const ayah = interaction.options.getInteger('ayah'); // Get the ayah from the interaction options

        // Create an embed with the ayah
        const quranEmbed = new EmbedBuilder()
            .setColor(colors.primary) // Set the embed color from the config file
            .setTitle(`Ayah ${surah}:${ayah}`)
            .setDescription(`This is the content of Ayah ${surah}:${ayah}`)
            .setTimestamp()
            .setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

        // Reply to the interaction with the embed
		await interaction.reply( { embeds: [quranEmbed] });
	},
};