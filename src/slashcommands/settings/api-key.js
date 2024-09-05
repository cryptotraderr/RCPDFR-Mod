const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { getSettings } = require('../../schemas/guild');

const WARN_COLOR = '#eb4034';
const CONSTRAST_SUCCESS = '#0099ff';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('api-key')
        .setDescription('API Key management')
        .addSubcommand(sub =>
            sub
                .setName('set')
                .setDescription('Sets the api key')
                .addStringOption(option =>
                    option
                        .setName('key')
                        .setDescription('The Roblox API key to save (overwrites)')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('remove')
                .setDescription('Removes the key from the database')
        ),
    run: async ({ interaction }) => {
        if (!interaction.deferred) await interaction.deferReply({ ephemeral: true });

        const { guild, guildId, options } = interaction;
        const settings = await getSettings(guild);
        const sub = options.getSubcommand();
        const apiKey = options.getString('key');
        let selectedEmbed = null;

        switch(sub) {
            case 'set':
                settings.cloud.apiKey = apiKey;
                await settings.save();
                // await setApiKey(guildId, apiKey);
                selectedEmbed = new EmbedBuilder()
                    .setTitle('✔️ API Key Saved Successfully')
                    .addFields(
                        { name: 'REMINDER:', value: 'Never share your API keys with anyone! Doing so may completely expose your linked experience.', inline: false }
                    )
                    .setColor(CONSTRAST_SUCCESS);
                break;
            case 'remove':
                if (settings.cloud.apiKey) {
                    settings.cloud.apiKey = null;
                    await settings.save();
                    selectedEmbed = new EmbedBuilder()
                        .setTitle('✔️ API Key Removed Successfully')
                        .setColor(CONSTRAST_SUCCESS);
                } else {
                    selectedEmbed = new EmbedBuilder()
                        .setTitle('❌ No API key configured! Did you set one?')
                        .setColor(WARN_COLOR)
                }
                break;
        }

        await interaction.editReply({
            embeds: [ selectedEmbed ],
            ephemeral: true
        })
    },
};