const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return;

        const greetingTriggerPhase = 'As'; 
        const greetingResponseEmbed = new EmbedBuilder()
            .setColor(0x0F4D0F) 
            .setDescription(`May peace, blessings and mercy of Allah be upon you.`)
            .setTimestamp()

        if (message.content.toLowerCase().includes(greetingTriggerPhase.toLowerCase())) {
            try {
                await message.reply({ content: `${message.author} says, السلام عليكم ورحمة الله وبركاته`, embeds: [greetingResponseEmbed] });
            } catch (error) {
                console.error('Error replying to message:', error);
            }
        }
        const replyTriggerPhase = 'Ws'; 
        const replyResponseEmbed = new EmbedBuilder()
            .setColor(0x0F4D0F) 
            .setDescription(`Peace be upon you as well and Allah's mercy and blessings.`)
            .setTimestamp()

        if (message.content.toLowerCase().includes(replyTriggerPhase.toLowerCase())) {
            try {
                await message.reply({ content: `${message.author} says, وعليكم السلام ورحمة الله وبركاته`, embeds: [replyResponseEmbed] });
            } catch (error) {
                console.error('Error replying to message:', error);
            }
        }
    },
};

