/*
    Name: debug.js
    Description: Debug command for the bot to display server resources
    Author: Salafi Bot Team
    License: MIT
*/

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'; // Import necessary classes from discord.js
import config from '../../config.json' with { type: 'json' }; // Import the config file
import { Octokit } from "@octokit/rest";

export default {
    data: new SlashCommandBuilder()
        .setName('changelog')
        .setDescription('Gets the bot\'s latest updates'),
    async execute(interaction) {
        // Create the Octokit instance to interact with GitHub API
        const octokit = new Octokit();

        // Get commit data from the Salafi Bot repository
        const { data: commits } = await octokit.rest.repos.listCommits({
            owner: 'Salafi-Coders',
            repo: 'salafibot',
            per_page: 5, // Limit to the latest 5 commits
        });

        // Create an embed with the bot's debug information
        const changelogEmbed = new EmbedBuilder()
            .setColor(config.colors.primary) // Set the embed color from the config file
            .setTitle('Bot Changelog (5 Latest Commits)')
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

        // Add the latest commits to the embed
        for (const commit of commits) {
            changelogEmbed.addFields([
                { 
                    name: `Commit ${commit.sha.slice(0, 7)}`, 
                    value: `${commit.commit.message}`, 
                    inline: false 
                },
            ]);
        }

        // Reply to the interaction with the embed
        await interaction.reply({ embeds: [changelogEmbed] });
    },
};