/*
    Name: commands.js
    Description: Command management for the bot
    Author: Salafi Bot Team
    License: MIT
*/

import config from '../config.json' with { type: 'json' };
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

// Import environment variables
import dotenv from 'dotenv';
dotenv.config();
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, '../config.json');

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
    if (getCommandByName(commandName)) {
        throw new Error(`[ERROR] Command "${commandName}" already exists.`);
    }
    return new Command(commandName, moduleName);
}

export function getCommands() {
    return config.commands;
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
    const foldersPath = path.join(__dirname, '../commands');
    const commandFolders = fs.readdirSync(foldersPath);

    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
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
                commands.push(commandModule.default.data.toJSON());
            } else {
                throw new Error(`[ERROR] The command at ${filePath} is missing a required "data" or "execute" property.`);
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

export function reloadCommand(commandName) {
    const command = getCommandByName(commandName);
    if (command) {
        // Reload the command
        console.log(`[INFO] Reloading command: ${commandName}`);
    } else {
        throw new Error(`[ERROR] Command "${commandName}" does not exist.`);
    }
}

export function enableCommand(commandName) {
    const command = getCommandByName(commandName);
    if (typeof config.commands[command.name] === 'object') {
        config.commands[command.name].enabled = true;
        return `[INFO] Command "${commandName}" has been enabled.`;
    } else {
        config.commands[command.name] = { enabled: true, module: command.module };
    }
    saveConfig();
}

export function disableCommand(commandName) {
    const command = getCommandByName(commandName);
    if (typeof config.commands[command.name] === 'object') {
        config.commands[command.name].enabled = false;
        return `[INFO] Command "${commandName}" has been disabled.`;
    } else {
        config.commands[command.name] = { enabled: false, module: command.module };
    }
    saveConfig();
}

export const Commands = {
    Command,
    createCommand,
    getCommands,
    getCommandByName,
    deployCommand,
    reloadCommand,
    enableCommand,
    disableCommand
};