const fs = require("fs");
const path = require("path");
const { Client } = require("discord.js-selfbot-v13");
const config = require("./config.json");

const client = new Client();
const commands = new Map();

const commandFiles = fs.readdirSync(path.join(__dirname, "cmd")).filter(f => f.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./cmd/${file}`);
    if (command && command.name && typeof command.execute === "function") commands.set(command.name, command);
}
client.commands = commands;

client.on("ready", () => {
    console.log("Logged In As " + client.user.username);
    if (!client.commands.size) console.warn("No Commands Loaded");
});

client.on("messageCreate", async(message) => {
    try {
        if (!message.guild) return;
        if (!config.ownerIds || !Array.isArray(config.ownerIds)) return;
        if (config.ownerIds.indexOf(message.author.id) === -1) return;
        if (!message.content || message.content.indexOf(config.prefix) !== 0) return;

        const parts = message.content.slice(config.prefix.length).trim().split(/ +/);
        const cmd = (parts.shift() || "").toLowerCase();
        if (!cmd) return;

        const run = client.commands.get(cmd);
        if (!run) return;

        await run.execute(message, parts, client, config);
    } catch (err) {
        console.error(err);
        try { if (message.channel) await message.channel.send("Command Failed"); } catch {}
    }
});

process.on("unhandledRejection", e => console.error(e));
process.on("uncaughtException", e => console.error(e));
client.on("error", e => console.error(e));

if (!config.token || typeof config.token !== "string" || !config.token.trim()) {
    console.error("Missing Token In config.json");
    process.exit(1);
}

client.login(config.token);