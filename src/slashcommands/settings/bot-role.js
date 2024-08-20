const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { getSettings } = require('../../schemas/guild');

// const WARN_COLOR = '#eb4034';
// const SUCCESS_COLOR = '#00ff44';
const CONSTRAST_SUCCESS = '#0099ff';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot-role')
        .setDescription('Manage authorized roles')
        .addSubcommand(sub =>
            sub
                .setName('set')
                .setDescription('Sets the assigned role as a bot executor')
                .addRoleOption(option =>
                    option
                        .setName('role')
                        .setDescription('The role to bind')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName('remove')
                .setDescription('Removes the assigned role from bot executor')
        ),
    
    run: async ({ interaction, client }) => {
        if (!interaction.deferred) await interaction.deferReply({ ephemeral: true });

        const { guild, options } = interaction;
        const sub = options.getSubcommand();
        const data = await getSettings(guild);
        const selectedRole = options.getRole('role');
        let selectedEmbed = null;

        switch (sub) {
            case 'set':
                if (data.botExecutor) {
                    selectedEmbed = new EmbedBuilder()
                        .setTitle('❌ Bot Settings Failed to Update')
                        .setDescription(`${interaction.guild.roles.cache.find(role => role.id === data.botExecutor)} is currently set as the bot executor`)
                } else {
                    selectedEmbed = new EmbedBuilder()
                        .setTitle('✅ Bot Settings Updated')
                        .setDescription(`The bot executor role has been updated to ${selectedRole}`)
                        .setColor(CONSTRAST_SUCCESS)
                        .setThumbnail(guild.iconURL())
                        .addFields(
                            { name: '🪪 Role', value: `${selectedRole}`, inline: true },
                            { name: '🆔 Role ID', value: `${selectedRole.id}`, inline: true }
                        )
                        .setTimestamp()
                        .setFooter({ text: 'Bot Settings', iconURL: client.user.avatarURL() });

                    data.botExecutor = selectedRole.id;
                    await data.save();
                }
                break;
            case 'remove':
                if (data.botExecutor) {
                    selectedEmbed = new EmbedBuilder()
                        .setTitle('✅ Bot Settings Updated')
                        .setDescription(`${interaction.guild.roles.cache.find(role => role.id === data.botExecutor)} has been removed as the bot executor role`);

                    data.botExecutor = null;
                    await data.save();
                } else {
                    selectedEmbed = new EmbedBuilder()
                        .setTitle('❌ There is currently no role assigned as bot executor');
                }
                break;
        }

        await interaction.editReply({
            embeds: [ selectedEmbed ],
            ephemeral: true
        });
    },
};