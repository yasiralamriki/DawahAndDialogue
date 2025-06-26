/*
    Name: quran.js
    Description: Command to get a verse from the Quran
    Author: Salafi Bot Team
    License: MIT
*/

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js'); // Import necessary classes from discord.js
const colors = require('../../config.json').colors; // Import colors from the config file
const axios = require('axios');

const quranApiClientId = process.env.QURAN_API_CLIENT_ID;
const quranApiSecret = process.env.QURAN_API_SECRET;

// Function to get OAuth2 access token
async function getAccessToken() {
    try {
        const response = await axios({
            method: 'POST',
            url: 'https://oauth2.quran.foundation/oauth2/token',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${quranApiClientId}:${quranApiSecret}`).toString('base64')}`
            },
            data: 'grant_type=client_credentials&scope=content'
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error.response?.data || error.message);
        throw error;
    }
}

async function getQuranVerse(chapter, verse) {
    try {
        const accessToken = await getAccessToken();
        
        const config = {
            method: 'get',
            url: `https://apis-prelive.quran.foundation/content/api/v4/verses/by_key/${chapter}:${verse}`,
            headers: { 
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        };
        
        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error('Error fetching verse:', error.response?.data || error.message);
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
        // Defer the reply immediately to prevent timeout
        await interaction.deferReply();
        
        const surah = interaction.options.getInteger('surah'); // Get the surah from the interaction options
        const ayah = interaction.options.getInteger('ayah'); // Get the ayah from the interaction options

        try {
            const verseData = await getQuranVerse(surah, ayah);
            console.log('Verse data received:', verseData);
            
            const verseText = verseData?.verse?.text_uthmani || verseData?.data?.text_uthmani || 'Verse not found.';

            // Create an embed with the ayah
            const quranEmbed = new EmbedBuilder()
                .setColor(colors.primary) // Set the embed color from the config file
                .setTitle(`Quran ${surah}:${ayah}`)
                .setDescription(verseText)
                .setTimestamp()
                .setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

            // Edit the deferred reply with the embed
            await interaction.editReply({ embeds: [quranEmbed] });
        } catch (error) {
            console.error('Command execution error:', error);
            await interaction.editReply({ 
                content: 'Sorry, I could not fetch that verse. Please check that the surah and ayah numbers are valid.',
                ephemeral: true 
            });
        }
    },
};