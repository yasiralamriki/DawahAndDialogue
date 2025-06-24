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

// Load environment variables from .env file
dotenv.config();
const token = process.env.DISCORD_TOKEN;

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Log in to Discord with your client's token
client.login(token);