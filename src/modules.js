/*
    Name: modules.js
    Description: Module management for the bot
    Author: Salafi Bot Team
    License: MIT
*/

import config from '../config.json' with { type: 'json' };
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Commands } from './commands.js';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, '../config.json');

function saveConfig() {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf-8');
}

// Module class
export class Module {
    constructor(moduleName) {
        this.name = moduleName;
        this.enabled = true;
        config.modules[this.name] = true;
        saveConfig();
    }
}

export function createModule(moduleName) {
    if (getModuleByName(moduleName)) {
        throw new Error(`Module "${moduleName}" already exists.`);
    }
    return new Module(moduleName);
}

export function getModules() {
    return config.modules;
}

export function getModuleCount() {
    return Object.keys(config.modules).length;
}

export function getEnabledModuleCount() {
    return Object.values(config.modules).filter(Boolean).length;
}

export function getModuleByName(name) {
    return config.modules[name] !== undefined ? { name, enabled: !!config.modules[name] } : null;
}

export async function deployModule(moduleName, globally = false) {
    const module = getModuleByName(moduleName);
    if (!module) {
        throw new Error(`[ERROR] Module "${moduleName}" does not exist.`);
    }

    console.log(`[INFO] Deploying module: ${moduleName}`);
    const foldersPath = path.join(__dirname, '../commands');
    const commandFolders = fs.readdirSync(foldersPath);
    const commandFolder = commandFolders.find(folder => folder === moduleName);
    if (!commandFolder) {
        throw new Error(`[ERROR] Command folder for module "${moduleName}" not found.`);
    }
    const commandsPath = path.join(foldersPath, commandFolder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    let results = [];
    let errors = [];

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const fileURL = pathToFileURL(filePath).href;
        const command = await import(fileURL);

        if ('data' in command.default && 'execute' in command.default) {
            try {
                const result = await Commands.deployCommand(command.default.data.name, globally);
                results.push(result);
            } catch (err) {
                errors.push(`[${file}]: ${err.message}`);
            }
        } else {
            errors.push(`[${file}]: Missing "data" or "execute" property.`);
        }
    }

    if (errors.length > 0) {
        throw new Error(`[ERROR] Received one or more errors:\n${errors.join('\n')}`);
    }

    return `[INFO] Module "${moduleName}" deployed successfully.\n${results.join('\n')}`;
}

export async function reloadModule(moduleName, interaction) {
    const module = getModuleByName(moduleName);
    if (!module) {
        throw new Error(`[ERROR] Module "${moduleName}" does not exist.`);
    }

    console.log(`[INFO] Reloading module: ${moduleName}`);
    const foldersPath = path.join(__dirname, '../commands');
    const commandFolders = fs.readdirSync(foldersPath);
    const commandFolder = commandFolders.find(folder => folder === moduleName);
    if (!commandFolder) {
        throw new Error(`[ERROR] Command folder for module "${moduleName}" not found.`);
    }
    const commandsPath = path.join(foldersPath, commandFolder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    let results = [];
    let errors = [];

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const fileURL = pathToFileURL(filePath).href;
        const command = await import(fileURL);

        if ('data' in command.default && 'execute' in command.default) {
            try {
                const result = await Commands.reloadCommand(command.default.data.name, interaction);
                results.push(result);
            } catch (err) {
                errors.push(`[${file}]: ${err.message}`);
            }
        } else {
            errors.push(`[${file}]: Missing "data" or "execute" property.`);
        }
    }

    if (errors.length > 0) {
        throw new Error(`[ERROR] Received one or more errors:\n${errors.join('\n')}`);
    }

    return `[INFO] Module "${moduleName}" reloaded successfully.\n${results.join('\n')}`;
}

export function enableModule(moduleName) {
    const module = getModuleByName(moduleName);
    if (module) {
        module.enabled = true;
        config.modules[module.name] = true;
        saveConfig();
        return `[INFO] Module "${moduleName}" has been enabled.`;
    } else {
        throw new Error(`[ERROR] Module "${moduleName}" does not exist.`);
    }
}

export function disableModule(moduleName) {
    const module = getModuleByName(moduleName);
    if (module) {
        module.enabled = false;
        config.modules[module.name] = false;
        saveConfig();
        return `[INFO] Module "${moduleName}" has been disabled.`;
    } else {
        throw new Error(`[ERROR] Module "${moduleName}" does not exist.`);
    }
}

export const Modules = {
    Module,
    createModule,
    getModules,
    getModuleCount,
    getEnabledModuleCount,
    getModuleByName,
    deployModule,
    reloadModule,
    enableModule,
    disableModule
};