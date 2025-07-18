/*
    Name: translate.js
    Description: Translates text with precision using Gemini AI
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
		.setName('translate')
		.setDescription('Translates text with precision.')
		.addStringOption(option =>
			option.setName('text')
				.setDescription('The text to translate')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('language')
				.setDescription('The language to translate the text to')
				.setRequired(true),
		)
		.addStringOption(option =>
			option.setName('model')
				.setDescription('The model to use for translation')
				.setRequired(false)
				.addChoices(
					{ name: 'Gemma 3n E2B', value: 'gemma-3n-e2b-it' },
					{ name: 'Gemma 3n E4b', value: 'gemma-3n-e4b-it' },
					{ name: 'Gemma 3 1B', value: 'gemma-3-1b-it' },
					{ name: 'Gemma 3 4B', value: 'gemma-3-4b-it' },
					{ name: 'Gemma 3 12B', value: 'gemma-3-12b-it' },
					{ name: 'Gemma 3 27B', value: 'gemma-3-27b-it' },
				)
		),
	async execute(interaction) {
		const text = interaction.options.getString('text');
		const language = interaction.options.getString('language');
		const modelName = interaction.options.getString('model') || 'gemma-3-e2b-it';

		const translationEmbed = new EmbedBuilder()
			.setAuthor({
				name: interaction.client.user.displayName,
				iconURL: interaction.client.user.avatarURL(),
			})
			.setColor(config.colors.primary)
			.setTimestamp()
			.setFooter({
				text: `Model: ${modelName}`,
			})
			.setTitle('Translation Request')
			.setDescription('Processing...');

		await interaction.reply({ embeds: [translationEmbed] });

		try {
			const model = genAI.getGenerativeModel({ model: modelName });
			const result = await model.generateContent(`Translate the following text into ${language}: ${text}.`);
			const response = await result.response;
			const translatedText = response.text();

			translationEmbed.setDescription(translatedText);
			await interaction.editReply({ embeds: [translationEmbed] });
		} catch (error) {
			console.error('Translation error:', error);
			translationEmbed.setDescription('Sorry, there was an error processing your translation request.');
			await interaction.editReply({ embeds: [translationEmbed] });
		}
	},
};