/*
    Name: quran.js
    Description: Command to get a verse from the Quran
    Author: Salafi Bot Team
    License: MIT
*/

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import axios from 'axios';
import dotenv from 'dotenv';

// Try to load local config, fallback to default config
let config;
try {
	config = await import('../../config.local.json', { with: { type: 'json' } });
	config = config.default;
} catch (e) {
	config = await import('../../config.json', { with: { type: 'json' } });
	config = config.default;
}

// Load environment variables from .env file
dotenv.config();
const clientId = process.env.QURAN_API_CLIENT_ID;
const secret = process.env.QURAN_API_SECRET;
let accessToken = null;

// Debug: Check if environment variables are loaded
console.log('[DEBUG] Client ID loaded:', clientId ? 'Yes' : 'No');
console.log('[DEBUG] Secret loaded:', secret ? 'Yes' : 'No');

async function getAccessToken() {
	if (!clientId || !secret) {
		throw new Error('Missing API credentials. Check your .env file.');
	}

	const tokenRequestConfig = {
		method: 'post',
		maxBodyLength: Infinity,
		url: 'https://oauth2.quran.foundation/oauth2/token',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Authorization': `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
		},
		data: 'grant_type=client_credentials&scope=content',
	};

	try {
		const response = await axios(tokenRequestConfig);
		return response.data.access_token;
	} catch (error) {
		console.error('Error getting access token:', error.response?.data || error.message);
		throw error;
	}
}

async function ensureAccessToken() {
	if (!accessToken) {
		accessToken = await getAccessToken();
	}
	return accessToken;
}

async function getArabicVerseText(chapter, verse) {
	await ensureAccessToken();

	const requestConfig = {
		method: 'get',
		maxBodyLength: Infinity,
		url: `https://apis.quran.foundation/content/api/v4/quran/verses/uthmani?verse_key=${chapter}:${verse}`,
		headers: {
			'Accept': 'application/json',
			'x-auth-token': accessToken,
			'x-client-id': clientId,
		},
	};

	try {
		const response = await axios(requestConfig);
		const verses = response.data?.verses;
		if (Array.isArray(verses) && verses.length > 0) {
			return verses[0].text_uthmani;
		}
		return null;
	} catch (error) {
		console.error('Arabic verse error:', error.response?.data || error.message);
		throw error;
	}
}

async function getEnglishVerseText(chapter, verse, translationId = 203) {
	await ensureAccessToken();

	const requestConfig = {
		method: 'get',
		maxBodyLength: Infinity,
		url: `https://apis.quran.foundation/content/api/v4/quran/translations/${translationId}?verse_key=${chapter}:${verse}`,
		headers: {
			'Accept': 'application/json',
			'x-auth-token': accessToken,
			'x-client-id': clientId,
		},
	};

	try {
		const response = await axios(requestConfig);
		const translations = response.data?.translations;
		if (Array.isArray(translations) && translations.length > 0) {
			return translations[0].text;
		}
		return null;
	} catch (error) {
		console.error('English verse error:', error.response?.data || error.message);
		throw error;
	}
}

export default {
	data: new SlashCommandBuilder()
		.setName('quran')
		.setDescription('Gets a verse from the Quran')
		.addIntegerOption(option =>
			option.setName('surah')
				.setDescription('The surah to get')
				.setRequired(true),
		)
		.addIntegerOption(option =>
			option.setName('ayah')
				.setDescription('The ayah to get')
				.setRequired(true),
		),
	async execute(interaction) {
		const surah = interaction.options.getInteger('surah');
		const ayah = interaction.options.getInteger('ayah');

		// Respond immediately to avoid timeout
		await interaction.deferReply();

		try {
			// Set a timeout for API calls
			const timeoutPromise = new Promise((_, reject) =>
				setTimeout(() => reject(new Error('API timeout')), 10000),
			);

			// Try to get verses - use fallback if API fails
			const [arabicText, englishText] = await Promise.race([
				Promise.all([
					getArabicVerseText(surah, ayah).catch(() => null),
					getEnglishVerseText(surah, ayah, 203).catch(() => null),
				]),
				timeoutPromise,
			]);

			if (!arabicText && !englishText) {
				await interaction.editReply({
					content: 'Sorry, I could not fetch that verse. The API may be temporarily unavailable.',
				});
				return;
			}

			const quranEmbed = new EmbedBuilder()
				.setColor(config.colors.primary)
				.setTitle(`Ayah ${surah}:${ayah}`)
				.addFields(
					{ name: 'Arabic', value: arabicText || 'Not available.' },
					{ name: 'English', value: englishText || 'Not available.' },
				)
				.setTimestamp()
				.setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

			await interaction.editReply({ embeds: [quranEmbed] });
		} catch (error) {
			console.error('Command execution error:', error);
			await interaction.editReply({
				content: 'Sorry, I could not fetch that verse due to an API error.',
			});
		}
	},
};