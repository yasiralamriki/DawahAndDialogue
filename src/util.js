/*
    Name: util.js
    Description: Utility functions for the bot
    Author: Salafi Bot Team
    License: MIT
*/

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getJavascriptFileCount() {
    // Get the count of JavaScript files recursively
    let jsFileCount = 0;
    const rootDir = path.join(__dirname, '..');
    
    function countJSFilesRecursively(dir) {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const itemPath = path.join(dir, item);
            const stats = fs.statSync(itemPath);
            
            if (stats.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                // Recursively count files in subdirectories
                countJSFilesRecursively(itemPath);
            } else if (item.endsWith('.js') && 
                      item !== 'deletecommands.js' && 
                      item !== 'deploycommands.js' &&
                      item !== 'eslint.config.js') {
                jsFileCount++;
            }
        }
    }
    
    countJSFilesRecursively(rootDir);
    return jsFileCount;
}

export function getLinesOfCodeCount() {
    // Get the count of lines of code in JavaScript files
    let linesOfCodeCount = 0;
    const rootDir = path.join(__dirname, '..');
    
    function countJSFilesRecursively(dir) {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const itemPath = path.join(dir, item);
            const stats = fs.statSync(itemPath);
            
            if (stats.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                // Recursively count files in subdirectories
                countJSFilesRecursively(itemPath);
            } else if (item.endsWith('.js') && 
                      item !== 'deletecommands.js' && 
                      item !== 'deploycommands.js' &&
                      item !== 'eslint.config.js') {
                linesOfCodeCount += fs.readFileSync(itemPath, 'utf-8').split('\n').length;
            }
        }
    }
    
    countJSFilesRecursively(rootDir);
    return linesOfCodeCount;
}

export const Util = {
    getJavascriptFileCount,
    getLinesOfCodeCount
};