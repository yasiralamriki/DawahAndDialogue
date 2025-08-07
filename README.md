# Salafi Discord Bot

![Salafi Discord Bot Logo](https://github.com/user-attachments/assets/5c687445-0e78-4442-89f2-8e37e08f556f)

A simple and purposeful Discord bot built upon the methodology of the Salaf. Designed to serve communities grounded in the Qur’ān, Sunnah, and understanding of the righteous predecessors.

---

## 🧾 About

This bot aims to support Salafī Discord servers with beneficial utilities while maintaining clarity, simplicity, and adherence to authentic sources. It avoids entertainment-focused features and innovations, focusing instead on what benefits the Ummah.

---

## 🛠 Setup

### Option 1: Local Hosting

1. Create an .env file in the directory

```env
DISCORD_TOKEN=YOUR_TOKEN # Token of your bot
CLIENT_ID=YOUR_CLIENT_ID # Client ID of your bot
GUILD_ID=DEV_SERVER_ID # Guild ID to deploy commands to for testing
QURAN_API_CLIENT_ID=YOUR_CLIENT_ID # Get API Key at https://api-docs.quran.foundation/request-access (production server)
QURAN_API_SECRET=YOUR_CLIENT_SECRET # Get API Key at https://api-docs.quran.foundation/request-access (production server)
GEMINI_API_KEY=YOUR_GEMINI_API_KEY # Get API Key at https://console.cloud.google.com/
```

2. run `node .` or `node index.js`

### Configuration Files

The bot uses two configuration files to manage its behavior:

- **`config.json`** - The main configuration file with default settings
- **`config.local.json`** - Local overrides for development/testing (optional)

When both files are present, `config.local.json` will override settings from `config.json`. This allows you to maintain different configurations for development without modifying the main config file.

#### Configuration Structure

```json
{
    "colors": {
        "primary": "#ffffff"  // Primary color for embeds
    },
    "modules": {
        "admin": true,        // Enable/disable admin module
        "bot": true,          // Enable/disable bot utilities
        "islamic": true,      // Enable/disable Islamic commands
        "utility": true       // Enable/disable utility commands
    },
    "commands": {
        // Individual command settings
        "commandName": {
            "enabled": true,  // Whether the command is enabled
            "module": "moduleName"  // Which module it belongs to
        }
    },
    "admins": [
        "USER_ID_HERE"       // Discord user IDs with admin privileges
    ],
    "bannedEmojis": [
        // Array of emoji that will be automatically deleted
    ]
}
```

#### Using config.local.json

Create a `config.local.json` file in the root directory to override specific settings for local development:

```json
{
    "colors": {
        "primary": "#FF0000"  // Use red color for development
    },
    "admins": [
        "YOUR_DISCORD_ID"     // Add your Discord ID for testing
    ]
}
```

### Option 2: Use already hosted version of this bot

This bot is being hosted on Google Cloud, and it will automatically pull the repo every 5 minutes to update, you can add it [here](https://discord.com/oauth2/authorize?client_id=1386650006118858853)

---

## 🤲 Intention

> *"Indeed, actions are judged by intentions..."*  
> — [Ṣaḥīḥ al-Bukhārī, 1]

This project is a means of cooperation upon Birr and Taqwā, and not upon falsehood or innovation.

---

## 📖 License

This project is open-source under the MIT License.  
**Bārak Allāhu fīkum.**
