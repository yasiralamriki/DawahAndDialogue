const { REST, Routes } = require('discord.js');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.DISCORD_TOKEN;

// Parse command line arguments
const args = process.argv.slice(2);
const isGlobal = args.includes('--global');
const commandIndex = args.indexOf('--command');
const commandIdIndex = args.indexOf('--id');
const commandName = commandIndex !== -1 && args[commandIndex + 1] ? args[commandIndex + 1] : null;
const commandId = commandIdIndex !== -1 && args[commandIdIndex + 1] ? args[commandIdIndex + 1] : null;

// Validate environment variables
if (!clientId || !token) {
	console.error('❌ Missing required environment variables: CLIENT_ID and DISCORD_TOKEN must be set in .env file');
	process.exit(1);
}

if (!isGlobal && !guildId) {
	console.error('❌ Missing GUILD_ID environment variable required for guild-specific deletion');
	process.exit(1);
}

// Validate command arguments
if (commandName && commandId) {
	console.error('❌ Cannot use both --command and --id flags at the same time');
	process.exit(1);
}

const rest = new REST().setToken(token);

async function deleteCommands() {
	try {
		// Determine the route based on global or guild deletion
		const route = isGlobal
			? Routes.applicationCommands(clientId)
			: Routes.applicationGuildCommands(clientId, guildId);

		if (commandId) {
			// Delete specific command by ID (no need to fetch all commands)
			const deleteRoute = isGlobal
				? Routes.applicationCommand(clientId, commandId)
				: Routes.applicationGuildCommand(clientId, guildId, commandId);

			console.log(`🗑️  Deleting command with ID: ${commandId}...`);
			await rest.delete(deleteRoute);
			console.log(`✅ Successfully deleted command with ID "${commandId}"`);

		} else {
			// Need to fetch commands for name-based deletion or delete all
			console.log('🔄 Fetching existing commands...');
			const existingCommands = await rest.get(route);

			if (existingCommands.length === 0) {
				console.log('ℹ️  No commands found to delete.');
				return;
			}

			if (commandName) {
				// Delete specific command by name
				const commandToDelete = existingCommands.find(cmd => cmd.name === commandName);

				if (!commandToDelete) {
					console.error(`❌ Command "${commandName}" not found.`);
					console.log('Available commands:', existingCommands.map(cmd => `${cmd.name} (ID: ${cmd.id})`).join(', '));
					process.exit(1);
				}

				const deleteRoute = isGlobal
					? Routes.applicationCommand(clientId, commandToDelete.id)
					: Routes.applicationGuildCommand(clientId, guildId, commandToDelete.id);

				await rest.delete(deleteRoute);
				console.log(`✅ Successfully deleted command "${commandName}" (ID: ${commandToDelete.id})`);
			} else {
				// Delete all commands
				console.log(`🗑️  Deleting ${existingCommands.length} commands...`);

				for (const command of existingCommands) {
					const deleteRoute = isGlobal
						? Routes.applicationCommand(clientId, command.id)
						: Routes.applicationGuildCommand(clientId, guildId, command.id);

					await rest.delete(deleteRoute);
					console.log(`✅ Deleted command: ${command.name} (ID: ${command.id})`);
				}

				console.log(`✅ Successfully deleted all ${existingCommands.length} commands.`);
			}
		}

		console.log(`📍 Deletion target: ${isGlobal ? 'Global' : `Guild (${guildId})`}`);

	} catch (error) {
		console.error('❌ Error deleting commands:', error);

		if (error.code === 50001) {
			console.error('   Missing Access - Check that your bot token is valid and the bot has necessary permissions.');
		} else if (error.code === 10062) {
			console.error('   Unknown interaction - The command may have already been deleted.');
		} else if (error.code === 10063) {
			console.error('   Unknown application command - The command ID does not exist.');
		}

		process.exit(1);
	}
}

// Show usage information
function showUsage() {
	console.log(`
Usage: node deletecommands.js [options]

Options:
  --global              Delete commands globally
  --command <name>      Delete only a specific command by name
  --id <commandId>      Delete only a specific command by ID

Examples:
  node deletecommands.js                           # Delete all guild commands
  node deletecommands.js --global                  # Delete all global commands
  node deletecommands.js --command ping            # Delete only the 'ping' command from guild
  node deletecommands.js --id 1234567890123456789  # Delete command by ID from guild
  node deletecommands.js --global --command ping   # Delete only the 'ping' command globally
  node deletecommands.js --global --id 1234567890123456789  # Delete command by ID globally

Environment Variables Required:
  CLIENT_ID      - Your Discord application/bot client ID
  DISCORD_TOKEN  - Your Discord bot token
  GUILD_ID       - Your Discord server ID (only required for guild deletions)
`);
}

// Handle help flag
if (args.includes('--help') || args.includes('-h')) {
	showUsage();
	process.exit(0);
}

// Run the deletion
deleteCommands();