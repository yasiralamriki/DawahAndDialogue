/*
    Name: commands.js
    Description: Command management for the bot
    Author: Salafi Bot Team
    License: MIT
*/

import config from '../config.json' with { type: 'json' };
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

    enable() {
        this.enabled = true;
        if (typeof config.commands[this.name] === 'object') {
            config.commands[this.name].enabled = true;
        } else {
            config.commands[this.name] = { enabled: true, module: this.module };
        }
        saveConfig();
    }

    disable() {
        this.enabled = false;
        if (typeof config.commands[this.name] === 'object') {
            config.commands[this.name].enabled = false;
        } else {
            config.commands[this.name] = { enabled: false, module: this.module };
        }
        saveConfig();
    }
}

export function createCommand(commandName, moduleName) {
    if (getCommandByName(commandName)) {
        throw new Error(`Command "${commandName}" already exists.`);
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

export const Commands = {
    Command,
    createCommand,
    getCommands,
    getCommandByName,
};