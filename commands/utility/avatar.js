/*
	Name: avatar.js
	Description: Command to get the avatar of a user
	Author: Salafi Bot Team
	License: MIT
*/

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js'); // Import necessary classes from discord.js
const colors = require('../../config.json').colors; // Import colors from the config file

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('Gets the avatar of a user')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('The user to get the avatar of')
            .setRequired(false)
        )
        .addIntegerOption(option =>
            option.setName('size')
            .setDescription('The size of the avatar (default is 512)')
            .setRequired(false)
            .addChoices(
                { name: '16', value: 16 },
                { name: '32', value: 32 },
                { name: '64', value: 64 },
                { name: '128', value: 128 },
                { name: '256', value: 256 },
                { name: '512', value: 512 },
                { name: '1024', value: 1024 },
                { name: '2048', value: 2048 },
                { name: '4096', value: 4096 }
            )
        ),
	async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user; // Get the user from the interaction options, or default to the command invoker
        const imageSize = interaction.options.getInteger('size') || 512; // Get the image size from the interaction options, or default to 512

        // Create an embed with the user's avatar
        const avatarEmbed = new EmbedBuilder()
            .setColor(colors.primary) // Set the embed color from the config file
            .setTitle(`Avatar of ${user.username}`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: imageSize }))
            .setTimestamp()
            .setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

        // Reply to the interaction with the embed
		await interaction.reply( { embeds: [avatarEmbed] });
	},
};