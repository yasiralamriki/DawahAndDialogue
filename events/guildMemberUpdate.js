/*
    Name: guildMemberUpdate.js
    Description: Event that runs when a guild member is updated
    Author: Salafi Bot Team
    License: MIT
*/

import { Events, EmbedBuilder } from 'discord.js';

// Try to load local config, fallback to default config
let config;
try {
	config = await import('../config.local.json', { with: { type: 'json' } });
	config = config.default;
} catch (e) {
	config = await import('../config.json', { with: { type: 'json' } });
	config = config.default;
}

export default {
    name: Events.GuildMemberUpdate,
    once: true,
    async execute(oldMember, newMember) {
        if (oldMember.premiumSince !== newMember.premiumSince) {
            const boostEmbed = new EmbedBuilder()
                .setColor(config.colors.primary)
                .setTitle('Server Boost!')
                .setDescription(`Thanks ${newMember.user.tag} for boosting the server!`)
                .setTimestamp();

            newMember.guild.systemChannel.send({
                embeds: [boostEmbed],
            });
        }
    },
};