const { ButtonBuilder, ButtonStyle, EmbedBuilder, ActionRowBuilder } = require('discord.js');
const { getSettings } = require('../schemas/guild');
const appealSchema = require('../schemas/appeals');

module.exports = {
    name: 'unban-appeal',
    run: async ({ interaction }) => { 
        const userAppeal = await appealSchema.findOne({ 'Data.interactionUser': interaction.user.id });
        if (userAppeal) {
            return interaction.reply({
                content: '❌ You already have a submitted appeal!',
                ephemeral: true
            })
        }

        const { guild, fields, user } = interaction;
        const settings = await getSettings(guild);
        const chosenServer = fields.getTextInputValue('serverInput');
        const robloxUser = fields.getTextInputValue('userInput');
        const reason = fields.getTextInputValue('reasonInput');

        if (settings.logging.enabled) {
            const channel = settings.logging.log_channels.find(channel => channel.name === 'appeals');
            const logChannel = await interaction.guild.channels.fetch(channel._id);
            if (!logChannel) return;

            const appealEmbed = new EmbedBuilder()
                .setTitle(`🛡️ ${user.username} Appeal | 🆔 ${user.id}`)
                .addFields([
                    { name: '👤 Username', value: robloxUser, inline: true },
                    { name: '🆔 Chosen Game', value: chosenServer, inline: true },
                    { name: '🔗 Game Link', value: `https://roblox.com/games/${chosenServer}/`, inline: true },
                    { name: '📝 Reason', value: reason, inline: true },
                ])
                .setTimestamp();

            const approveButton = new ButtonBuilder()
                .setCustomId('approve-appeal')
                .setLabel('✅ Approve Appeal')
                .setStyle(ButtonStyle.Primary);

            const declineButton = new ButtonBuilder()
                .setCustomId('decline-appeal')
                .setLabel('❌ Decline Appeal')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(approveButton, declineButton);
            const rowMessage = await logChannel.send({
                embeds: [ appealEmbed ],
                components: [ row ],
                fetchReply: true
            });

            await appealSchema.create(
                {
                _id: rowMessage.id,
                Data: [{
                    interactionUser: user.id,
                    chosenServer: chosenServer,
                    robloxUser: robloxUser,
                    reason: reason
                }]
            });
        } else {
            return interaction.reply({
                content: '❌ Ban Appeal logging is disabled for this server!',
                ephemeral: true
            });
        }
        

        await interaction.reply({
            content: '✅ Your ban appeal has been submitted!',
            ephemeral: true
        });
    },
};