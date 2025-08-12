/*
    Name: debug.js
    Description: Debug command for the bot to display server resources
    Author: Salafi Bot Team
    License: MIT
*/

import { ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, SlashCommandBuilder, EmbedBuilder } from 'discord.js'; // Import necessary classes from discord.js
import { Octokit } from "@octokit/rest";

// Try to load local config, fallback to default config
let config;
try {
	config = await import('../../config.local.json', { with: { type: 'json' } });
	config = config.default;
} catch (e) {
	config = await import('../../config.json', { with: { type: 'json' } });
	config = config.default;
}

export default {
    data: new SlashCommandBuilder()
        .setName('changelog')
        .setDescription('Gets the bot\'s latest updates'),
    async execute(interaction) {
        // Create the Octokit instance to interact with GitHub API
        const octokit = new Octokit();

        // Get commit data from the Salafi Bot repository
        let pageCount = 1; // Set the page count to 1 for the latest commits
        const { data: commits } = await octokit.rest.repos.listCommits({
            owner: 'yasiralamriki',
            repo: 'DawahAndDialogue',
            per_page: 5, // Limit to the latest 5 commits
            page: pageCount, // Use the current page count
        });

        // Create an embed with the bot's debug information
        const changelogEmbed = new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`Bot Changelog (Page ${pageCount})`)
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

        // Add the 5 latest commits to the embed
        for (const commit of commits) {
            changelogEmbed.addFields([
                { 
                    name: `Commit ${commit.sha.slice(0, 7)}`, 
                    value: `${commit.commit.message}`, 
                    inline: false 
                },
            ]);
        }

        // Add buttons
        const nextPageButton = new ButtonBuilder()
			.setCustomId('next_page')
			.setLabel('Next Page')
			.setStyle(ButtonStyle.Primary);

        const previousPageButton = new ButtonBuilder()
			.setCustomId('previous_page')
			.setLabel('Previous Page')
			.setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder()
			.addComponents(nextPageButton);

        changelogEmbed.setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

        // Wait for button input
        const response = await interaction.reply({
            embeds: [changelogEmbed],
            components: [row],
            withResponse: true,
        });

        const collector = response.resource.message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 3_600_000 });

        collector.on('collect', async interaction => {
            if (interaction.customId === 'previous_page') {
                pageCount -= 1;
                
                // Update button components based on page count
                if (pageCount <= 1) {
                    row.setComponents(nextPageButton);
                } else {
                    row.setComponents(previousPageButton, nextPageButton);
                }

                // Update the embed with the next page of commits
                const { data: nextCommits } = await octokit.rest.repos.listCommits({
                    owner: 'Salafi-Coders',
                    repo: 'salafibot',
                    per_page: 5,
                    page: pageCount,
                });

                // Create a new embed instead of trying to clear fields
                const newChangelogEmbed = new EmbedBuilder()
                    .setColor(config.colors.primary)
                    .setTitle(`Bot Changelog (Page ${pageCount})`)
                    .setThumbnail(interaction.client.user.displayAvatarURL())
                    .setTimestamp()
                    .setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

                // Add the new commits to the embed
                for (const commit of nextCommits) {
                    newChangelogEmbed.addFields([
                        {
                            name: `Commit ${commit.sha.slice(0, 7)}`,
                            value: `${commit.commit.message}`,
                            inline: false
                        },
                    ]);
                }
                
                await interaction.update({
                    embeds: [newChangelogEmbed],
                    components: [row],
                });
            } else if (interaction.customId === 'next_page') {
                // Check if there are more commits on the next page before incrementing
                const { data: checkCommits } = await octokit.rest.repos.listCommits({
                    owner: 'Salafi-Coders',
                    repo: 'salafibot',
                    per_page: 5,
                    page: pageCount + 1,
                });

                // If no commits on next page, do not increment page count
                if (checkCommits.length === 0) {
                    await interaction.reply({ content: 'No more commits available.', ephemeral: true });
                    return;
                };

                pageCount += 1;
                
                // Update button components - always show both buttons when page > 1
                row.setComponents(previousPageButton, nextPageButton);

                // Update the embed with the next page of commits
                const { data: nextCommits } = await octokit.rest.repos.listCommits({
                    owner: 'Salafi-Coders',
                    repo: 'salafibot',
                    per_page: 5,
                    page: pageCount,
                });

                // Create a new embed instead of trying to clear fields
                const newChangelogEmbed = new EmbedBuilder()
                    .setColor(config.colors.primary)
                    .setTitle(`Bot Changelog (Page ${pageCount})`)
                    .setThumbnail(interaction.client.user.displayAvatarURL())
                    .setTimestamp()
                    .setFooter({ text: 'Salafi Bot', iconURL: interaction.client.user.displayAvatarURL() });

                // Add the new commits to the embed
                for (const commit of nextCommits) {
                    newChangelogEmbed.addFields([
                        {
                            name: `Commit ${commit.sha.slice(0, 7)}`,
                            value: `${commit.commit.message}`,
                            inline: false
                        },
                    ]);
                }

                await interaction.update({ 
                    embeds: [newChangelogEmbed], 
                    components: [row] 
                });
            }
        });
    },
};
