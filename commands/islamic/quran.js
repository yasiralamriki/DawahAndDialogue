/*
    Name: quran.js
    Description: Command to get a verse from the Quran
    Author: Salafi Bot Team
    License: MIT
*/

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js'); // Import necessary classes from discord.js
const colors = require('../../config.json').colors; // Import colors from the config file
const axios = require('axios');

const accessToken = process.env.QURAN_API_SECRET;
const clientId = process.env.QURAN_API_CLIENT_ID;
async function getQuranVerse(chapter, verse) {
    const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://apis-prelive.quran.foundation/content/api/v4/verses/by_key/${chapter}:${verse}`,
        headers: { 
            'Accept': 'application/json', 
            'x-auth-token': accessToken,
            'x-client-id': clientId
        }
    };
    try {
        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
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

        try {
            const verseData = await getQuranVerse(surah, ayah);
            console.log(verseData)
            const verseText = verseData?.data?.text_uthmani || 'Verse not found.';

            // Create an embed with the ayah
            const quranEmbed = new EmbedBuilder()
                .setColor(colors.primary) // Set the embed color from the config file
                .setTitle(`Ayah ${surah}:${ayah}`)
                .setDescription(verseText)
                .setTimestamp()
                .setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

            // Reply to the interaction with the embed
            await interaction.reply({ embeds: [quranEmbed] });
        } catch (error) {
            await interaction.reply({ content: 'Sorry, I could not fetch that verse.', ephemeral: true });
        }
    },
};