const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {

    name: 'stop',

    description: 'Disconnects the bot from the voice channel',

    async execute(message) {

        try {

            // Get the current voice connection for this guild

            const connection = getVoiceConnection(message.guild.id);

            if (!connection) {

                return message.reply("⚠️ I'm not connected to any voice channel!");

            }

            connection.destroy();

            message.reply("");

            console.log(`Disconnected from VC in ${message.guild.name}`);

        } catch (error) {

            console.error("❌ Error stopping bot:", error);

            message.reply("❌ Failed to disconnect from the voice channel.");

        }

    }

};