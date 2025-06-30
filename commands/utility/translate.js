// Require environment variables from .env file
require('dotenv').config();
const geminiAPIKey = process.env.GEMINI_API_KEY;

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GoogleGenAI } = require('@google/genai');

const config = require('../../config.json');

const ai = new GoogleGenAI({ apiKey: geminiAPIKey });

module.exports = {
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
		),
	async execute(interaction) {
		const text = interaction.options.getString('text');
		const language = interaction.options.getString('language');

		const translationEmbed = new EmbedBuilder()
			.setAuthor({
				name: interaction.client.user.displayName,
				iconURL: interaction.client.user.avatarURL(),
			})
			.setColor(config.colors.primary)
			.setTimestamp()
			.setFooter({
				text: 'Gemini 2.0 Flash',
			})
			.setTitle('Translation Request')
			.setDescription('Placeholder');

		async function main() {
			const response = await ai.models.generateContent({
				model: 'gemini-2.0-flash',
				contents: `Translate the following text into ${language}: ${text}.`,
			});
			translationEmbed.setDescription(response.text);
			await interaction.reply({ embeds: [translationEmbed] });
		}

		main();
	},
};