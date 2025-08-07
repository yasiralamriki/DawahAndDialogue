/*
    Name: messageCreate.js
    Description: Event that handles message creation
    Author: Salafi Bot Team
    License: MIT
*/


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
    name: 'messageReactionAdd',
    async execute(reaction, user) {
        if (user.bot) return;
        const emoji = reaction.emoji.name;
        if (config.bannedEmojis.includes(emoji)) {
            try {
                await reaction.users.remove(user.id);
                await user.send({
                    content: `That emoji is banned and your reaction was removed. Please avoid using it in the future.`,
                });
            } catch (err) {
                // Handle error silently`
            }
        }
    },
};
