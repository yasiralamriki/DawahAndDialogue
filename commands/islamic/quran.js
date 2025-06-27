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
        url: `https://apis.quran.foundation/content/api/v4/verses/by_key/${chapter}:${verse}`,
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
        const surah = interaction.options.getInteger('surah');
        const ayah = interaction.options.getInteger('ayah');

        try {
            // Fetch both Arabic and English text
            const [arabicText, englishText] = await Promise.all([
                getArabicVerseText(surah, ayah),
                getEnglishVerseText(surah, ayah, 203)
            ]);

            if (!arabicText && !englishText) {
                await interaction.reply({ content: 'Sorry, I could not fetch that verse.', ephemeral: true });
                return;
            }

            // Build embed with both Arabic and English
            const quranEmbed = new EmbedBuilder()
                .setColor(colors.primary)
                .setTitle(`Ayah ${surah}:${ayah}`)
                .addFields(
                    { name: 'Arabic', value: arabicText || 'Not found.' },
                    { name: 'English', value: englishText || 'Not found.' }
                )
                .setTimestamp()
                .setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

            await interaction.reply({ embeds: [quranEmbed] });
        } catch (error) {
            await interaction.reply({ content: 'Sorry, I could not fetch that verse.', ephemeral: true });
        }
    },
};


async function getArabicVerseText(chapter, verse) {
    const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://apis.quran.foundation/content/api/v4/quran/verses/uthmani?verse_key=${chapter}:${verse}`,
        headers: { 
            'Accept': 'application/json', 
            'x-auth-token': accessToken,
            'x-client-id': clientId
        }
    };
    try {
        const response = await axios(config);
        const verses = response.data?.verses;
        if (Array.isArray(verses) && verses.length > 0) {
            return verses[0].text_uthmani;
        }
        return null;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

async function getEnglishVerseText(chapter, verse, translationId = 203) {
    const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://apis.quran.foundation/content/api/v4/quran/translations/${translationId}?verse_key=${chapter}:${verse}`,
        headers: { 
            'Accept': 'application/json', 
            'x-auth-token': accessToken,
            'x-client-id': clientId
        }
    };
    try {
        const response = await axios(config);
        const translations = response.data?.translations;
        console.log(translations);
        if (Array.isArray(translations) && translations.length > 0) {
            return translations[0].text;
        }
        return null;
    } catch (error) {
        console.error(error);
        throw error;
    }
}