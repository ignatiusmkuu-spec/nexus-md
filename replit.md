# PEREZ-MD WhatsApp Bot

## Overview
A WhatsApp Multi-Device bot built with Node.js using the Baileys library. The bot connects to WhatsApp and provides automated responses and management features.

## Architecture
- **Runtime**: Node.js 20 (CommonJS)
- **Entry Point**: `index.js`
- **Bot Library**: `@whiskeysockets/baileys` (custom fork)
- **Web Server**: Express.js serving a status page on port 5000
- **Database**: PostgreSQL (Replit built-in) for bot settings storage

## Key Files
- `index.js` - Main entry point; Express server + WhatsApp bot initialization
- `Perez.js` - Command handler
- `database/config.js` - PostgreSQL pool, schema initialization, settings CRUD
- `database/fetchSettings.js` - Helper to fetch all settings
- `lib/` - Utility functions (dreadfunc, dreadexif, etc.)
- `libsignal/` - WhatsApp signal protocol handlers
- `store/` - In-memory message store
- `session/` - WhatsApp session credentials (`session/creds.json`)
- `perez/` - Static HTML web page served by Express

## Configuration
- Port: 5000 (default, configurable via `PORT` env var)
- Session: Set via `SESSION` environment variable (base64 encoded creds.json)
- Bot name: Set via `BOTNAME` env var (default: PEREZ-MD)
- Database: `DATABASE_URL` env var (Replit PostgreSQL)

## Database Schema
Table: `bot_settings` (key/value pairs)
- Settings: antilink, antilinkall, autobio, antidelete, antitag, antibot, anticall, badword, gptdm, welcome, autoread, mode, prefix, autolike, autoview, wapresence

## Deployment
- Target: VM (always-running, required for WhatsApp bot persistent connection)
- Run command: `node index.js`
