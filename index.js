import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import dotenv from 'dotenv'; // Import dotenv to load environment variables
import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js'; // Import necessary classes from discord.js
import { Modules } from './src/modules.js'; // Import modules library
import { Commands } from './src/commands.js';

// Load environment variables from .env file
dotenv.config();
const token = process.env.DISCORD_TOKEN;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent, // Required for message content
        GatewayIntentBits.GuildMessageReactions, // Required for reactions
	],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction], // Important for uncached messages

});
// Create a collection to store commands
client.commands = new Collection();

// Load commands
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    if (folder !== 'local') {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        // Create a module for the folder
        if (!Modules.getModuleByName(folder)) {
            Modules.createModule(folder);
            console.log(`[INFO] Created module: ${folder}`);
        } else {
            console.log(`[INFO] Module ${folder} already exists, skipping creation.`);
        }

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const fileURL = pathToFileURL(filePath).href; // Convert to file URL
            const command = await import(fileURL); // Use file URL for import

            if ('data' in command.default && 'execute' in command.default) {
                // Always set the module property on the command object
                command.default.module = folder;

                // Update commands in config
                const existing = Commands.getCommandByName(command.default.data.name);
                if (!existing) {
                    Commands.createCommand(command.default.data.name, folder);
                    console.log(`[INFO] Created command: ${command.default.data.name} in module: ${folder}`);
                } else {
                    // If the module is different, update it in config
                    if (existing.module !== folder) {
                        const entry = Commands.getCommands()[command.default.data.name];
                        if (typeof entry === 'object') {
                            entry.module = folder;
                        }
                        console.log(`[INFO] Updated module for command: ${command.default.data.name} to ${folder}`);
                    } else {
                        console.log(`[INFO] Command ${command.default.data.name} already exists in module: ${folder}, skipping creation.`);
                    }
                }

                // Check if the module is enabled in the config
                const moduleObj = Modules.getModuleByName(folder);
                const commandObj = Commands.getCommandByName(command.default.data.name);

                if (moduleObj && moduleObj.enabled === true && commandObj && commandObj.enabled === true) {
                    client.commands.set(command.default.data.name, command.default);
                    console.log(`[INFO] Loaded command: ${command.default.data.name} from module: ${folder}`);
                } else {
                    console.log(`[INFO] ${moduleObj ? `Module ${folder} is not enabled` : `Module ${folder} does not exist`} ? : Command ${command.default.data.name} is not enabled, skipping.`);
                }
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    } else {
        const localCommandsPath = path.join(foldersPath, folder);
        const localSubfolders = fs.readdirSync(localCommandsPath);
        
        for (const subfolder of localSubfolders) {
            const subfolderPath = path.join(localCommandsPath, subfolder);
            const stats = fs.statSync(subfolderPath);
            
            if (stats.isDirectory()) {
                const localCommandFiles = fs.readdirSync(subfolderPath).filter(file => file.endsWith('.js'));

                for (const file of localCommandFiles) {
                    const filePath = path.join(subfolderPath, file);
                    const fileURL = pathToFileURL(filePath).href; // Convert to file URL
                    const command = await import(fileURL); // Use file URL for import

                    if ('data' in command.default && 'execute' in command.default) {
                        // Set the module property to the subfolder name (e.g., "utility")
                        command.default.module = subfolder;

                        // Update commands in config
                        const existing = Commands.getCommandByName(command.default.data.name);
                        if (!existing) {
                            Commands.createCommand(command.default.data.name, subfolder);
                            console.log(`[INFO] Created local command: ${command.default.data.name} in module: ${subfolder}`);
                        } else {
                            // If the module is different, update it in config
                            if (existing.module !== subfolder) {
                                const entry = Commands.getCommands()[command.default.data.name];
                                if (typeof entry === 'object') {
                                    entry.module = subfolder;
                                }
                                console.log(`[INFO] Updated module for local command: ${command.default.data.name} to ${subfolder}`);
                            } else {
                                console.log(`[INFO] Local command ${command.default.data.name} already exists in module: ${subfolder}, skipping creation.`);
                            }
                        }

                        // Check if the module is enabled in the config
                        const moduleObj = Modules.getModuleByName(subfolder);
                        const commandObj = Commands.getCommandByName(command.default.data.name);

                        if (moduleObj && moduleObj.enabled === true && commandObj && commandObj.enabled === true) {
                            client.commands.set(command.default.data.name, command.default);
                            console.log(`[INFO] Loaded local command: ${command.default.data.name} from module: ${subfolder}`);
                        } else {
                            console.log(`[INFO] ${moduleObj ? `Module ${subfolder} is not enabled` : `Module ${subfolder} does not exist`} : Local command ${command.default.data.name} is not enabled, skipping.`);
                        }
                    } else {
                        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                    }
                }
            }
        }
    }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const fileURL = pathToFileURL(filePath).href; // Convert to file URL
    const event = await import(fileURL); // Use file URL for import

    if (event.default.once) {
        client.once(event.default.name, (...args) => event.default.execute(...args));
    } else {
        client.on(event.default.name, (...args) => event.default.execute(...args));
    }
    console.log(`[INFO] Loaded event: ${event.default.name}`);
}

// Load local events
const localEventFiles = fs.readdirSync(path.join(eventsPath, 'local')).filter(file => file.endsWith('.js'));

for (const file of localEventFiles) {
    const filePath = path.join(eventsPath, 'local', file);
    const fileURL = pathToFileURL(filePath).href; // Convert to file URL
    const event = await import(fileURL); // Use file URL for import

    if (event.default.once) {
        client.once(event.default.name, (...args) => event.default.execute(...args));
    } else {
        client.on(event.default.name, (...args) => event.default.execute(...args));
    }
    console.log(`[INFO] Loaded local event: ${event.default.name}`);
}

// Log in to Discord with your client's token
client.login(token);