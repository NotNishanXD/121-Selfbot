// mute.js

const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {

    name: 'mute',

    description: 'Mutes the bot (sets volume to 0)',

    async execute(message) {

        const connection = getVoiceConnection(message.guild.id);

        if (!connection) return message.reply("❌ | I'm not connected to a voice channel.");

        const player = connection.state.subscription?.player;

        if (!player) return message.reply("⚠️ | No active player found.");

        const resource = player.state.resource;

        if (!resource?.volume) return message.reply("⚠️ | Volume control not available.");

        resource.volume.setVolume(0);

        return message.reply("");

    },

};