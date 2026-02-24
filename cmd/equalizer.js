// equalizer.js
module.exports = {
    name: "equalizer",
    description: "Set an equalizer preset (flat, bass, treble, vocal)",
    async execute(message, args) {
        const preset = (args[0] || "flat").toLowerCase();
        const presets = {
            flat: "equalizer=f=10000:t=h:width_type=h:width=2000:g=0",
            bass: "equalizer=f=60:width_type=h:width=100:g=10",
            treble: "equalizer=f=1000000:width_type=h:width=200000:g=500",
            vocal: "equalizer=f=1000:width_type=h:width=300:g=8"
        };

        if (!presets[preset]) {
            return message.reply(
                "🎛️ Unknown preset. Try one of: **flat**, **bass**, **treble**, **vocal**"
            );
        }

        // Store preset globally so play.js can use it
        global.eqFilter = presets[preset];
        message.reply(`🎚️ Equalizer preset set to **${preset}**`);
    }
};
