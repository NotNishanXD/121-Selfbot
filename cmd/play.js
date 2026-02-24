const fs = require("fs");
const path = require("path");
const ffmpeg = require("ffmpeg-static");
const prism = require("prism-media");
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState,
    StreamType
} = require("@discordjs/voice");

module.exports = {
    name: "play",
    async execute(message, args, client, config) {
        try {
            let target = null;
            if (message.member && message.member.voice && message.member.voice.channel) {
                target = message.member.voice.channel;
            }
            if (!target) {
                const ownerId = Array.isArray(config.ownerIds) && config.ownerIds.length ? config.ownerIds[0] : null;
                if (ownerId) {
                    const candidates = client.guilds.cache.map(g => g.members.cache.get(ownerId));
                    const found = candidates.find(m => m && m.voice && m.voice.channel);
                    if (found && found.voice && found.voice.channel) target = found.voice.channel;
                }
            }
            if (!target) {
                try { await message.reply("Join A Voice Channel First"); } catch {}
                return;
            }

            // Pick song from args[0] or fall back to config.defaultSong
            const file = path.resolve(__dirname, "..", "music", args && args[0] ? args[0] : config.defaultSong);
            if (!fs.existsSync(file)) {
                try { await message.reply("Audio File Not Found"); } catch {}
                return;
            }

            const connection = joinVoiceChannel({
                channelId: target.id,
                guildId: target.guild.id,
                adapterCreator: target.guild.voiceAdapterCreator,
                selfDeaf: false
            });

            await entersState(connection, VoiceConnectionStatus.Ready, 30000);

            const player = createAudioPlayer();
            connection.subscribe(player);

            function makeOpus() {
                // Combine filters: equalizer + optional bassBoost if set elsewhere
                const filters = [];

                if (global.eqFilter) filters.push(global.eqFilter); // Equalizer preset (e.g., bass/treble)
                if (global.bassBoost && global.bassBoost > 0)
                    filters.push(`bass=g=${global.bassBoost / 10}`);

                const finalFilter = filters.length ? ["-af", filters.join(",")] : [];

                const ff = new prism.FFmpeg({
                    command: ffmpeg,
                    args: [
                        "-hide_banner",
                        "-loglevel", "error",
                        "-i", file,
                        ...finalFilter,
                        "-f", "s16le",
                        "-ar", "48000",
                        "-ac", "2"
                    ]
                });

                const enc = new prism.opus.Encoder({ rate: 48000, channels: 2, frameSize: 960 });
                ff.on("error", () => {});
                enc.on("error", () => {});
                return ff.pipe(enc);
            }

            function playLoop() {
                const resource = createAudioResource(makeOpus(), {
                    inputType: StreamType.Opus,
                    inlineVolume: true
                });
                if (resource.volume && resource.volume.setVolume) {
                    // Use volume from config.json (0.0–1.0)
                    resource.volume.setVolume(typeof config.volume === "number" ? config.volume : 0.9);
                }
                player.play(resource);
            }

            playLoop();

            player.on("error", async () => {
                try { if (message.channel) await message.channel.send("Playback Error"); } catch {}
            });

            player.on(AudioPlayerStatus.Idle, () => {
                playLoop();
            });
        } catch {
            try { await message.reply("Failed To Play Audio"); } catch {}
        }
    }
};
            
