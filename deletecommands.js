/*
    Name: deletecommands.js
    Description: Script to delete Discord application commands (global or guild)
    Author: Salafi Bot Team
    License: MIT
*/

import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config();
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.DISCORD_TOKEN;

// Parse command line arguments
const args = process.argv.slice(2);
const isGlobal = args.includes('--global');
const showLocal = args.includes('--list-local');
const commandIndex = args.indexOf('--command');
const commandIdIndex = args.indexOf('--id');
const commandName = commandIndex !== -1 && args[commandIndex + 1] ? args[commandIndex + 1] : null;
const commandId = commandIdIndex !== -1 && args[commandIdIndex + 1] ? args[commandIdIndex + 1] : null;

// Validate environment variables
if (!clientId || !token) {
    console.error('[ERROR] Missing required environment variables: CLIENT_ID and DISCORD_TOKEN must be set in .env file');
    process.exit(1);
}

if (!isGlobal && !guildId) {
    console.error('[ERROR] Missing GUILD_ID environment variable required for guild-specific deletion');
    process.exit(1);
}

// Validate command arguments
if (commandName && commandId) {
    console.error('[ERROR] Cannot use both --command and --id flags at the same time');
    process.exit(1);
}

const rest = new REST().setToken(token);

// Function to list local commands
async function listLocalCommands() {
    console.log('[INFO] Scanning for local commands...\n');
    
    const localPath = path.join(__dirname, 'commands', 'local');
    if (!fs.existsSync(localPath)) {
        console.log('[INFO] No local commands directory found.');
        return;
    }
    
    const subdirs = fs.readdirSync(localPath);
    let foundCommands = false;
    
    for (const subdir of subdirs) {
        const subDirPath = path.join(localPath, subdir);
        if (fs.statSync(subDirPath).isDirectory()) {
            const commandFiles = fs
                .readdirSync(subDirPath)
                .filter(file => file.endsWith('.js'));
            
            if (commandFiles.length > 0) {
                console.log(`📁 Module: ${subdir}`);
                foundCommands = true;
                
                for (const file of commandFiles) {
                    const filePath = path.join(subDirPath, file);
                    
                    try {
                        const fileURL = pathToFileURL(filePath).href;
                        const command = await import(fileURL);
                        
                        if ('data' in command.default && 'execute' in command.default) {
                            console.log(`  - ${command.default.data.name} (${file})`);
                        } else {
                            console.log(`  - ${file} (invalid - missing data or execute)`);
                        }
                    } catch (error) {
                        console.log(`  - ${file} (error loading: ${error.message})`);
                    }
                }
                console.log('');
            }
        }
    }
    
    if (!foundCommands) {
        console.log('[INFO] No local commands found.');
    }
    
    console.log('[INFO] Note: Use "node deploycommands.js" to deploy these local commands before they can be deleted.');
}

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

            console.log(`[INFO] Deleting command with ID: ${commandId}...`);
            await rest.delete(deleteRoute);
            console.log(`[INFO] Successfully deleted command with ID "${commandId}"`);

        } else {
            // Need to fetch commands for name-based deletion or delete all
            console.log('[INFO] Fetching existing commands...');
            const existingCommands = await rest.get(route);

            if (existingCommands.length === 0) {
                console.log('[INFO] No commands found to delete.');
                return;
            }

            if (commandName) {
                // Delete specific command by name
                const commandToDelete = existingCommands.find(cmd => cmd.name === commandName);

                if (!commandToDelete) {
                    console.error(`[ERROR] Command "${commandName}" not found.`);
                    
                    // Enhanced listing to show command types
                    console.log('[INFO] Available commands:');
                    for (const cmd of existingCommands) {
                        console.log(`  - ${cmd.name} (ID: ${cmd.id})`);
                    }
                    
                    // Try to provide helpful suggestion about local commands
                    console.log('[INFO] Note: If this is a local command, make sure it has been deployed first using deploycommands.js');
                    process.exit(1);
                }

                const deleteRoute = isGlobal
                    ? Routes.applicationCommand(clientId, commandToDelete.id)
                    : Routes.applicationGuildCommand(clientId, guildId, commandToDelete.id);

                await rest.delete(deleteRoute);
                console.log(`[INFO] Successfully deleted command "${commandName}" (ID: ${commandToDelete.id})`);
            } else {
                // Delete all commands
                console.log(`[INFO] Deleting ${existingCommands.length} commands...`);

                for (const command of existingCommands) {
                    const deleteRoute = isGlobal
                        ? Routes.applicationCommand(clientId, command.id)
                        : Routes.applicationGuildCommand(clientId, guildId, command.id);

                    await rest.delete(deleteRoute);
                    console.log(`[INFO] Deleted command: ${command.name} (ID: ${command.id})`);
                }

                console.log(`[INFO] Successfully deleted all ${existingCommands.length} commands.`);
            }
        }

        console.log(`[INFO] Deletion target: ${isGlobal ? 'Global' : `Guild (${guildId})`}`);

    } catch (error) {
        console.error('[ERROR] Error deleting commands:', error);

        if (error.code === 50001) {
            console.error('[ERROR] Missing Access - Check that your bot token is valid and the bot has necessary permissions.');
        } else if (error.code === 10062) {
            console.error('[ERROR] Unknown interaction - The command may have already been deleted.');
        } else if (error.code === 10063) {
            console.error('[ERROR] Unknown application command - The command ID does not exist.');
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
  --list-local          List all local commands available in the filesystem

Examples:
  node deletecommands.js                           # Delete all guild commands
  node deletecommands.js --global                  # Delete all global commands
  node deletecommands.js --command ping            # Delete only the 'ping' command from guild
  node deletecommands.js --id 1234567890123456789  # Delete command by ID from guild
  node deletecommands.js --global --command ping   # Delete only the 'ping' command globally
  node deletecommands.js --global --id 1234567890123456789  # Delete command by ID globally
  node deletecommands.js --list-local              # List all local commands in filesystem

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

// Handle list local commands flag
if (showLocal) {
    listLocalCommands().then(() => process.exit(0)).catch(err => {
        console.error('[ERROR] Error listing local commands:', err);
        process.exit(1);
    });
} else {
    // Run the delete commands function
    deleteCommands();
}