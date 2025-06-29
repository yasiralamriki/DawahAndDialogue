const { EmbedBuilder } = require('discord.js');
const colors = require('../config.json').colors;

module.exports = {
	name: 'messageCreate',
	async execute(message) {
		if (message.author.bot) return;

		const phrases = [
			{ phrase: 'as', response_ar: 'السلام عليكم ورحمة الله وبركاته', response_en: 'May the peace, blessings and mercy of Allah be upon you.' },
			{ phrase: 'ws', response_ar: 'وعليكم السلام ورحمة الله وبركاته', response_en: 'And may the peace, blessings and mercy of Allah be upon you.' },
		];

		const content = message.content.trim().toLowerCase();

		for (phrase of phrases) {
			if (content === phrase.phrase) {
				const phraseEmbed = new EmbedBuilder()
					.setColor(colors.primary)
					.setDescription(phrase.response_en)
					.setTimestamp();

				await message.reply({ content: `${message.author} says ${phrase.response_ar}`, embeds: [phraseEmbed] });
			}
		}
	},
};

