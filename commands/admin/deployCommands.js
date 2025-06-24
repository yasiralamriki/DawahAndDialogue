const { SlashCommandBuilder, REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.DISCORD_TOKEN;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('deploycommands')
		.setDescription('Deploys the bot commands to the server.')
        .setDefaultMemberPermissions(0)
        .addBooleanOption(option =>
			option.setName('global')
				.setDescription('Deploy commands globally or to the test server.')
				.setRequired(true)
		),
	async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
		const commands = [];
        // Grab all the command folders from the commands directory you created earlier
        const foldersPath = path.join(__dirname, '..', '..', 'commands');
        const commandFolders = fs.readdirSync(foldersPath);
        
        for (const folder of commandFolders) {
            // Grab all the command files from the commands directory you created earlier
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                } else {
                    await interaction.editReply(`The command at ${filePath} is missing a required "data" or "execute" property.`);
                    return;
                }
            }
        }
        
        // Construct and prepare an instance of the REST module
        const rest = new REST().setToken(token);
        
        // and deploy your commands!
        (async () => {
            try {
                const global = interaction.options.getBoolean('global');

                let route;

                await interaction.editReply(`Started refreshing ${commands.length} application (/) commands. This may take a few seconds...`);

                if (global === true) {
                    // If the user selected 'true', deploy commands globally
                    route = Routes.applicationCommands(clientId);
                } else {
                    // If the user selected 'false', deploy commands to the test server
                    route = Routes.applicationGuildCommands(clientId, guildId);
                }
                
                // The put method is used to fully refresh all commands in the guild with the current set
                const data = await rest.put(
                    route,
                    { body: commands },
                );
                
                await interaction.editReply(`Successfully reloaded ${data.length} application (/) commands.`);
            } catch (error) {
                // And of course, make sure you catch and log any errors!
                console.error(error);
                await interaction.editReply(`There was an error while deploying commands: ${error.message}`);
            }
        })();
	},
};