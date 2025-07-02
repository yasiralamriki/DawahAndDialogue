/*
    Name: modules.js
    Description: Module management for the bot
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

// Module class
export class Module {
    constructor(moduleName) {
        this.name = moduleName;
        this.enabled = true;
        config.modules[this.name] = true;
        saveConfig();
    }

    enable() {
        this.enabled = true;
        config.modules[this.name] = true;
        saveConfig();
    }

    disable() {
        this.enabled = false;
        config.modules[this.name] = false;
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

export function getModuleByName(name) {
    return config.modules[name] !== undefined ? { name, enabled: !!config.modules[name] } : null;
}

export const Modules = {
    Module,
    createModule,
    getModules,
    getModuleByName,
};