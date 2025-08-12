import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import config from '../../../config.local.json' with { type: 'json' };

const colors = config.colors[0];
const roles = config.roles[0];

export default {
	data: new SlashCommandBuilder()
		.setName('verify')
		.setDescription('Verify an user.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('male')
				.setDescription('Verify a male.')
				.addBooleanOption(option => option.setName('muslim').setDescription('If the user is a Muslim or not.').setRequired(true))
				.addUserOption(option => option.setName('user').setDescription('The user').setRequired(true)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('female')
				.setDescription('Verify a female.')
				.addBooleanOption(option => option.setName('muslim').setDescription('If the user is a Muslim or not.').setRequired(true))
				.addUserOption(option => option.setName('user').setDescription('The user').setRequired(true)),
		),
	async execute(interaction) {
		const user = interaction.user;

		if (!config.moderatorRoles.some(roleId => interaction.guild.members.cache.get(user.id).roles.cache.has(roleId))) {
			await interaction.reply({ content: 'You are not authorized to use this command.', ephemeral: true });
			return;
		}

		// Variables
		const isMuslim = interaction.options.getBoolean('muslim');
		const targetUser = interaction.options.getUser('user');
		const member = interaction.guild.members.cache.get(targetUser.id);
		const rolesChannel = '1095502995623526420';
		const rolesChannelBrothers = '962620942243221504';
		const rolesChannelSisters = '961895724377841674';
		const verificationChannel = interaction.client.channels.cache.get('923051476023132200');
		const brothersChannel = interaction.client.channels.cache.get('724944570017775694');
		const sistersChannel = interaction.client.channels.cache.get('724945821916987432');
		const dawahMaleChannel = interaction.client.channels.cache.get('1204433974370508861');
		const dawahFemaleChannel = interaction.client.channels.cache.get('1255993732172480553');

		// Remove the unverified role
		if (member.roles.cache.has(roles.unverified)) {
			// Make sure they have it before removing it to fix possible issues
			await member.roles.remove(roles.unverified);
		}

		// Verification
		if (interaction.options.getSubcommand() === 'male') {
			// Male verification
			if (isMuslim === true) {
				// Muslim Male verification

				// Give them Member role
				await member.roles.add(roles.member);

				// Remove Dawah (M) role if they have it
				if (member.roles.cache.has(roles.dawahMale)) {
			        // Make sure they have it before removing it to fix possible issues
			        await member.roles.remove(roles.dawahMale);
		        }

				// Give them Muslim role
				await member.roles.add(roles.muslim);

				// Give them Brother role
				await member.roles.add(roles.brother);

				// Send message in verification channel
				const muslimMaleVerificationStaffEmbed = new EmbedBuilder()
			        .setAuthor({
				        name: interaction.client.user.displayName,
				        iconURL: interaction.client.user.avatarURL(),
			        })
			        .setColor('ffd800')
			        .setTimestamp()
			        .setTitle('Verification - Muslim Brother')
			        .setDescription(`<@${targetUser.id}> has been verified as a Muslim Brother`)
					.setImage(targetUser.avatarURL());

				await verificationChannel.send({ embeds: [muslimMaleVerificationStaffEmbed] });

				// Send message in Brothers section
				const muslimMaleVerificationBrothersEmbed = new EmbedBuilder()
			        .setAuthor({
				        name: interaction.client.user.displayName,
				        iconURL: interaction.client.user.avatarURL(),
			        })
			        .setColor('ffd800')
			        .setTimestamp()
			        .setTitle('Welcome to the brothers section')
			        .setDescription(`Welcome <@${targetUser.id}> to Brothers Hub! Feel free to grab some roles from <#${rolesChannel}> and <#${rolesChannelBrothers}>.`);

				await brothersChannel.send({ embeds: [muslimMaleVerificationBrothersEmbed] });
			} else {
				// Kafir Male verification

				// Give Dawah (M) role
			    await member.roles.add(roles.dawahMale);

				// Send message in verification channel
				const kafirMaleVerificationStaffEmbed = new EmbedBuilder()
			        .setAuthor({
				        name: interaction.client.user.displayName,
				        iconURL: interaction.client.user.avatarURL(),
			        })
			        .setColor('ffd800')
			        .setTimestamp()
			        .setTitle('Verification - Male Kafir')
			        .setDescription(`<@${targetUser.id}> has been verified as a Kafir Male`)
					.setImage(targetUser.avatarURL());

				await verificationChannel.send({ embeds: [kafirMaleVerificationStaffEmbed] });

				// Send message in Dawah section
				const kafirMaleVerificationDawahEmbed = new EmbedBuilder()
			        .setAuthor({
				        name: interaction.client.user.displayName,
				        iconURL: interaction.client.user.avatarURL(),
			        })
			        .setColor('ffd800')
			        .setTimestamp()
			        .setTitle('Welcome to the server!')
			        .setDescription(`Welcome <@${targetUser.id}> to Dawah & Dialogue! We wish you a happy and beneficial a stay! Please select your roles from <#${rolesChannel}>.`);

				await dawahMaleChannel.send({ embeds: [kafirMaleVerificationDawahEmbed] });
			}
		} else if (interaction.options.getSubcommand() === 'female') {
			// Female verification
			if (isMuslim === true) {
				// Muslim Female verification

				// Give them Member role
				await member.roles.add(roles.member);

				// Remove Dawah (F) role if they have it
				if (member.roles.cache.has(roles.dawahFemale)) {
			        // Make sure they have it before removing it to fix possible issues
			        await member.roles.remove(roles.dawahFemale);
		        }

				// Give them Muslim role
				await member.roles.add(roles.muslim);

				// Give them Sister role
				await member.roles.add(roles.sister);

				// Send message in verification channel
				const muslimFemaleVerificationStaffEmbed = new EmbedBuilder()
			        .setAuthor({
				        name: interaction.client.user.displayName,
				        iconURL: interaction.client.user.avatarURL(),
			        })
			        .setColor(colors.primary)
			        .setTimestamp()
			        .setTitle('Verification - Muslim Sister')
			        .setDescription(`<@${targetUser.id}> has been verified as a Muslim Sister`)
					.setImage(targetUser.avatarURL());

				await verificationChannel.send({ embeds: [muslimFemaleVerificationStaffEmbed] });

				// Send message in Sisters section
				const muslimFemaleVerificationSistersEmbed = new EmbedBuilder()
			        .setAuthor({
				        name: interaction.client.user.displayName,
				        iconURL: interaction.client.user.avatarURL(),
			        })
			        .setColor(colors.primary)
			        .setTimestamp()
			        .setTitle('Welcome to the sisters section')
			        .setDescription(`Welcome <@${targetUser.id}> to Sisters Hub! Feel free to grab some roles from <#${rolesChannel}> and <#${rolesChannelSisters}>.`);

				await sistersChannel.send({ embeds: [muslimFemaleVerificationSistersEmbed] });
			} else {
				// Kafir Female verification

				// Give Dawah (F) role
				await member.roles.add(roles.dawahFemale);

				// Send message in verification channel
				const kafirFemaleVerificationStaffEmbed = new EmbedBuilder()
			        .setAuthor({
				        name: interaction.client.user.displayName,
				        iconURL: interaction.client.user.avatarURL(),
			        })
			        .setColor(colors.primary)
			        .setTimestamp()
			        .setTitle('Verification - Female Kafir')
			        .setDescription(`<@${targetUser.id}> has been verified as a Kafir Female`)
					.setImage(targetUser.avatarURL());

				await verificationChannel.send({ embeds: [kafirFemaleVerificationStaffEmbed] });

				// Send message in Dawah section
				const kafirFemaleVerificationDawahEmbed = new EmbedBuilder()
			        .setAuthor({
				        name: interaction.client.user.displayName,
				        iconURL: interaction.client.user.avatarURL(),
			        })
			        .setColor(colors.primary)
			        .setTimestamp()
			        .setTitle('Welcome to the server!')
			        .setDescription(`Welcome <@${targetUser.id}> to Dawah & Dialogue! We wish you a happy and beneficial a stay! Please select your roles from <#${rolesChannel}>.`);

				await dawahFemaleChannel.send({ embeds: [kafirFemaleVerificationDawahEmbed] });
			}
		}
	},
};
