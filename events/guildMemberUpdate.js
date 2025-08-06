/*
    Name: guildMemberUpdate.js
    Description: Event that runs when a guild member is updated
    Author: Salafi Bot Team
    License: MIT
*/

import { Events } from 'discord.js';
import config from '../../config.json' with { type: 'json' }; // Import the config file for colors and other settings

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