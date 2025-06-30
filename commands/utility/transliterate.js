// Require environment variables from .env file
require('dotenv').config();
const geminiAPIKey = process.env.GEMINI_API_KEY;

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { GoogleGenAI } = require('@google/genai');

const config = require('../../config.json');

const ai = new GoogleGenAI({ apiKey: geminiAPIKey });

module.exports = {
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
			.setDescription('Placeholder');

		async function main() {
			const response = await ai.models.generateContent({
				model: 'gemini-2.0-flash',
				contents: `Transliterate the following Arabic text: ${text}`,
			});
			transliterationEmbed.setDescription(response.text);
			await interaction.reply({ embeds: [transliterationEmbed] });
		}

		main();
	},
};