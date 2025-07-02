/*
    Name: transliterate.js
    Description: Transliterates Arabic into English text with phonetics using Gemini AI
    Author: Salafi Bot Team
    License: MIT
*/

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../../config.json' with { type: 'json' };
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();
const geminiAPIKey = process.env.GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(geminiAPIKey);

export default {
	data: new SlashCommandBuilder()
		.setName('transliterate')
		.setDescription('Transliterates Arabic into English text with phonetics.')
		.addStringOption(option =>
			option.setName('text')
				.setDescription('The text to transliterate')
				.setRequired(true),
		),
	async execute(interaction) {
		const text = interaction.options.getString('text');

		const transliterationEmbed = new EmbedBuilder()
			.setAuthor({
				name: interaction.client.user.displayName,
				iconURL: interaction.client.user.avatarURL(),
			})
			.setColor(config.colors.primary)
			.setTimestamp()
			.setFooter({
				text: 'Gemini 2.0 Flash',
			})
			.setTitle('Transliteration Request')
			.setDescription('Processing...');

		await interaction.reply({ embeds: [transliterationEmbed] });

		try {
			const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
			const result = await model.generateContent(`Transliterate the following Arabic text: ${text}`);
			const response = await result.response;
			const transliteratedText = response.text();

			transliterationEmbed.setDescription(transliteratedText);
			await interaction.editReply({ embeds: [transliterationEmbed] });
		} catch (error) {
			console.error('Transliteration error:', error);
			transliterationEmbed.setDescription('Sorry, there was an error processing your transliteration request.');
			await interaction.editReply({ embeds: [transliterationEmbed] });
		}
	},
};