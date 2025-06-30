/*
	Name: index.js
	Description: Main entry point for the Discord bot
	Author: Salafi Bot Team
	License: MIT
*/

const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');
const { Client, Collection, GatewayIntentBits } = require('discord.js'); // Import necessary classes from discord.js

// Load config
const config = require('./config.json'); // Load configuration file

// Load environment variables from .env file
dotenv.config();
const token = process.env.DISCORD_TOKEN;

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent, // Required for message content
	],
});
// Create a collection to store commands
client.commands = new Collection();

// Load commands
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);

		if ('data' in command && 'execute' in command) {
			if (config.commands[command.data.name] === true && config.modules[folder] === true) {
				client.commands.set(command.data.name, command);
				console.log(`[INFO] Loaded command: ${command.data.name}`);
			} else {
				console.log(`[INFO] Skipped command: ${command.data.name} (not enabled in config or module not loaded)`);
			}
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Load events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);

	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
	console.log(`[INFO] Loaded event: ${event.name}`);
}

// Log in to Discord with your client's token
client.login(token);