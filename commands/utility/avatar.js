const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('Gets the avatar of a user')
        .addUserOption(option =>
            option.setName('user')
            .setDescription('The user to get the avatar of')
            .setRequired(false)
        ),
	async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;

        const avatarEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`Avatar of ${user.username}`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setTimestamp()
            .setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

		await interaction.reply( { embeds: [avatarEmbed] });
	},
};