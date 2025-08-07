/*
    Name: messageCreate.js
    Description: Event that handles message creation
    Author: Salafi Bot Team
    License: MIT
*/

import { EmbedBuilder } from 'discord.js';

// Try to load local config, fallback to default config
let config;
try {
	config = await import('../config.local.json', { with: { type: 'json' } });
	config = config.default;
} catch (e) {
	config = await import('../config.json', { with: { type: 'json' } });
	config = config.default;
}

function containsBannedEmoji(content) {
    return config.bannedEmojis.some(emoji => content.includes(emoji));
}

export default {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return;
        // Check for banned emojis in message
        if (containsBannedEmoji(message.content, config.bannedEmojis)) {
            await message.delete();
            try {
            await message.author.send({
                content: `Your message in ${message.guild ? message.guild.name : "this server"} contained a banned emoji and was removed.`,
            });
            } catch (err) {
            // User has DMs disabled or blocked the bot
                console.error(`Could not send DM to ${message.author.tag}:`, err);
            }
            return;
        }

        const phrases = [
            { phrase: ['aswrwb', 'as', 'salam', 'salam alaikum'], response_ar: 'السلام عليكم ورحمة الله وبركاته', response_en: 'May the peace, blessings and mercy of Allah be upon you.' },
            { phrase: 'aswr', response_ar: 'السلام عليكم ورحمة الله', response_en: 'May the peace and mercy of Allah be upon you.' },
            { phrase: ['wswrwb', 'ws'], response_ar: 'وعليكم السلام ورحمة الله وبركاته', response_en: 'And may the peace, blessings and mercy of Allah be upon you.' },
            { phrase: 'wswr', response_ar: 'وعليكم السلام ورحمة الله', response_en: 'And may the peace and mercy of Allah be upon you.' },
            { phrase: ['jzk', 'jazakallah'], response_ar: 'جزاك الله خيراً', response_en: 'May Allah reward you immensely.' },
        ];

        const content = message.content.trim().toLowerCase();

        for (const phrase of phrases) {
            if (Array.isArray(phrase.phrase)) {
                // Check if content matches any of the phrases in the array
                if (phrase.phrase.some(p => content === p)) {
                    const phraseEmbed = new EmbedBuilder()
                        .setColor(config.colors.primary)
                        .setDescription(phrase.response_en)
                        .setTimestamp();

                    await message.reply({ content: `${message.author} says ${phrase.response_ar}`, embeds: [phraseEmbed] });
                }
            } else if (content === phrase.phrase) {
                const phraseEmbed = new EmbedBuilder()
                    .setColor(config.colors.primary)
                    .setDescription(phrase.response_en)
                    .setTimestamp();

                await message.reply({ content: `${message.author} says ${phrase.response_ar}`, embeds: [phraseEmbed] });
            }
        }
    },
};

