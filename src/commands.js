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
import { Module } from './modules.js'; // Import the Module class

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
        config.commands[this.name] = true; // Store as boolean
        saveConfig();
    }

    enable() {
        this.enabled = true;
        config.commands[this.name] = true;
        saveConfig();
    }

    disable() {
        this.enabled = false;
        config.commands[this.name] = false;
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
    return config.commands[name] !== undefined ? { name, enabled: !!config.commands[name], module: config.commands[name].module } : null;
}

export const Commands = {
    Command,
    createCommand,
    getCommands,
    getCommandByName,
};