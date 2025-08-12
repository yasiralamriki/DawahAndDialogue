/*
    Name: commands.js
    Description: Command management for the bot
    Author: Salafi Bot Team
    License: MIT
*/

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

// Try to load local config, fallback to default config
let config;
try {
	config = await import('../config.local.json', { with: { type: 'json' } });
	config = config.default;
} catch (e) {
	config = await import('../config.json', { with: { type: 'json' } });
	config = config.default;
}

// Import environment variables
import dotenv from 'dotenv';
dotenv.config();
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine config file path
let configPath;
try {
	configPath = path.join(__dirname, '../config.local.json');
	// Check if local config exists
	if (!fs.existsSync(configPath)) {
		throw new Error('Local config not found');
	}
} catch (e) {
	configPath = path.join(__dirname, '../config.json');
}

function saveConfig() {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf-8');
}

// Command class
export class Command {
    constructor(commandName, moduleName) {
        this.name = commandName;
        this.module = moduleName;
        this.enabled = true;
        config.commands[this.name] = { enabled: true, module: moduleName }; // Always store as object
        saveConfig();
    }
}

export function createCommand(commandName, moduleName) {
    const existingCommand = getCommandByName(commandName);
    if (existingCommand) {
        console.log(`[INFO] Command "${commandName}" already exists in module "${existingCommand.module}", overriding with module "${moduleName}"`);
        // Update the existing command's module
        config.commands[commandName] = { enabled: true, module: moduleName };
        saveConfig();
        return { name: commandName, module: moduleName, enabled: true };
    }
    return new Command(commandName, moduleName);
}

export function getCommands() {
    return config.commands;
}

export function getCommandCount() {
    return Object.keys(config.commands).length;
}

export function getEnabledCommandsCount() {
    return Object.values(config.commands).filter(cmd => cmd.enabled === true).length;
}

export function getCommandByName(name) {
    const entry = config.commands[name];
    if (entry === undefined) return null;
    if (typeof entry === 'object') {
        return { name, enabled: !!entry.enabled, module: entry.module || null };
    }
    return { name, enabled: !!entry, module: null };
}

export async function deployCommand(commandName, globally = false) {
    const command = getCommandByName(commandName);
    if (!command) {
        throw new Error(`[ERROR] Command "${commandName}" does not exist.`);
    }

    console.log(`[INFO] Deploying command: ${commandName}`);
    const commands = [];
    const commandNames = new Set(); // Track command names to handle duplicates
    const foldersPath = path.join(__dirname, '../commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        
        // Handle local commands differently
        if (folder === 'local') {
            // For local commands, iterate through subdirectories
            const subdirs = fs.readdirSync(commandsPath);
            for (const subdir of subdirs) {
                const subDirPath = path.join(commandsPath, subdir);
                if (fs.statSync(subDirPath).isDirectory()) {
                    const commandFiles = fs
                        .readdirSync(subDirPath)
                        .filter((file) => file.endsWith('.js'));
                    
                    for (const file of commandFiles) {
                        const filePath = path.join(subDirPath, file);
                        const fileURL = pathToFileURL(filePath).href;
                        const commandModule = await import(fileURL);

                        if ('data' in commandModule.default && 'execute' in commandModule.default) {
                            if (commandName && commandModule.default.data.name !== commandName) {
                                continue;
                            }
                            
                            const cmdName = commandModule.default.data.name;
                            if (commandNames.has(cmdName)) {
                                console.log(`[WARN] Duplicate command "${cmdName}" found, overriding previous version`);
                                // Remove the previous version from commands array
                                const index = commands.findIndex(cmd => cmd.name === cmdName);
                                if (index !== -1) {
                                    commands.splice(index, 1);
                                }
                            } else {
                                commandNames.add(cmdName);
                            }
                            
                            commands.push(commandModule.default.data.toJSON());
                        } else {
                            throw new Error(`[ERROR] The command at ${filePath} is missing a required "data" or "execute" property.`);
                        }
                    }
                }
            }
        } else {
            // Handle regular commands
            const commandFiles = fs
                .readdirSync(commandsPath)
                .filter((file) => file.endsWith('.js'));
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const fileURL = pathToFileURL(filePath).href;
                const commandModule = await import(fileURL);

                if ('data' in commandModule.default && 'execute' in commandModule.default) {
                    if (commandName && commandModule.default.data.name !== commandName) {
                        continue;
                    }
                    
                    const cmdName = commandModule.default.data.name;
                    if (commandNames.has(cmdName)) {
                        console.log(`[WARN] Duplicate command "${cmdName}" found, overriding previous version`);
                        // Remove the previous version from commands array
                        const index = commands.findIndex(cmd => cmd.name === cmdName);
                        if (index !== -1) {
                            commands.splice(index, 1);
                        }
                    } else {
                        commandNames.add(cmdName);
                    }
                    
                    commands.push(commandModule.default.data.toJSON());
                } else {
                    throw new Error(`[ERROR] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            }
        }
    }

    if (commandName && commands.length === 0) {
        throw new Error(`[ERROR] Command "${commandName}" not found.`);
    }

    const rest = new REST().setToken(token);

    try {
        let route;
        if (globally === true) {
            route = Routes.applicationCommands(clientId);
        } else {
            route = Routes.applicationGuildCommands(clientId, guildId);
        }

        if (commandName) {
            const existingCommands = await rest.get(route);
            const updatedCommands = existingCommands.filter(
                (cmd) => cmd.name !== commandName,
            );
            updatedCommands.push(...commands);

            await rest.put(route, { body: updatedCommands });
            return `[INFO] Successfully deployed command "${commandName}".`;
        } else {
            const data = await rest.put(route, { body: commands });
            return `[INFO] Successfully reloaded ${data.length} application (/) commands.`;
        }
    } catch (error) {
        console.error(error);
        throw new Error(`[ERROR] There was an error while deploying commands: ${error.message}`);
    }
}

export async function reloadCommand(commandName, interaction) {
    const command = getCommandByName(commandName);
    if (command) {
        // Reload the command
        console.log(`[INFO] Reloading command: ${commandName}`);
        const reloadedCommands = [];
		const failedCommands = [];

		// Grab all the command folders from the commands directory you created earlier
		const foldersPath = path.join(__dirname, '../commands');
		const commandFolders = fs.readdirSync(foldersPath);

		// Loop through each folder in the commands directory
		for (const folder of commandFolders) {
			// Handle local commands differently
			if (folder === 'local') {
				// For local commands, iterate through subdirectories
				const localPath = path.join(foldersPath, folder);
				
				// Check if local commands directory exists
				if (!fs.existsSync(localPath)) {
					console.log('[INFO] No local commands directory found, skipping local commands.');
					continue;
				}
				
				const subdirs = fs.readdirSync(localPath);
				
				for (const subdir of subdirs) {
					const subDirPath = path.join(localPath, subdir);
					if (fs.statSync(subDirPath).isDirectory()) {
						const commandFiles = fs.readdirSync(subDirPath).filter(file => file.endsWith('.js'));

						// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
						for (const file of commandFiles) {
							// Import the command file
							// Ensure the file is a valid command file by checking for 'data' and 'execute' properties
							if (!file.endsWith('.js')) continue; // Skip non-JS files
							const filePath = path.join(subDirPath, file);

							try {
								// Convert file path to file URL for ES6 import
								const fileURL = pathToFileURL(filePath).href;

								// Add cache busting parameter to force reload
								const cacheBustURL = `${fileURL}?update=${Date.now()}`;

								// Re-import the command file
								const command = await import(cacheBustURL);

								if ('data' in command.default && 'execute' in command.default) {
									// Add module name to command (use subdir name for local commands)
									if (command.default.data.name === commandName) {
										command.default.module = subdir;
										reloadedCommands.push(command.default.data.name);
										interaction.client.commands.set(command.default.data.name, command.default);
										break;
									}
								} else {
									failedCommands.push(`${file} - Missing "data" or "execute" property`);
								}
							} catch (error) {
								console.error(error);
								failedCommands.push(`${file} - ${error.message}`);
							}
						}
					}
				}
			} else {
				// Handle regular commands
				// Grab all the command files from the commands directory you created earlier
				const commandsPath = path.join(foldersPath, folder);
				const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

				// Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
				for (const file of commandFiles) {
					// Import the command file
					// Ensure the file is a valid command file by checking for 'data' and 'execute' properties
					if (!file.endsWith('.js')) continue; // Skip non-JS files
					const filePath = path.join(commandsPath, file);

					try {
						// Convert file path to file URL for ES6 import
						const fileURL = pathToFileURL(filePath).href;

						// Add cache busting parameter to force reload
						const cacheBustURL = `${fileURL}?update=${Date.now()}`;

						// Re-import the command file
						const command = await import(cacheBustURL);

						if ('data' in command.default && 'execute' in command.default) {
							// Add module name to command
							if (command.default.data.name === commandName) {
								command.default.module = folder;
								reloadedCommands.push(command.default.data.name);
								interaction.client.commands.set(command.default.data.name, command.default);
								break;
							}
						} else {
							failedCommands.push(`${file} - Missing "data" or "execute" property`);
						}
					} catch (error) {
						console.error(error);
						failedCommands.push(`${file} - ${error.message}`);
					}
				}
			}
		}

		// Send a single reply with the results
		let replyMessage = '';
		if (reloadedCommands.length > 0) {
			replyMessage += `Reloaded ${reloadedCommands.length} commands: ${reloadedCommands.join(', ')}`;
		}
		if (failedCommands.length > 0) {
			replyMessage += `Failed to reload ${failedCommands.length} commands:\n${failedCommands.join('\n')}`;
		}
		if (!replyMessage) {
			replyMessage = 'No commands found to reload.';
		}

		return replyMessage;
    } else {
        throw new Error(`[ERROR] Command "${commandName}" does not exist.`);
    }
}

export function enableCommand(commandName) {
    const command = getCommandByName(commandName);
    if (!command) {
        throw new Error(`[ERROR] Command "${commandName}" does not exist.`);
    }
    
    if (typeof config.commands[command.name] === 'object') {
        config.commands[command.name].enabled = true;
    } else {
        config.commands[command.name] = { enabled: true, module: command.module };
    }
    saveConfig();
    return `[INFO] Command "${commandName}" has been enabled.`;
}

export function disableCommand(commandName) {
    const command = getCommandByName(commandName);
    if (!command) {
        throw new Error(`[ERROR] Command "${commandName}" does not exist.`);
    }
    
    if (typeof config.commands[command.name] === 'object') {
        config.commands[command.name].enabled = false;
    } else {
        config.commands[command.name] = { enabled: false, module: command.module };
    }
    saveConfig();
    return `[INFO] Command "${commandName}" has been disabled.`;
}

export const Commands = {
    Command,
    createCommand,
    getCommands,
    getCommandCount,
    getEnabledCommandsCount,
    getCommandByName,
    deployCommand,
    reloadCommand,
    enableCommand,
    disableCommand
};