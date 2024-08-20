const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

// noinspection JSCheckFunctionSignatures
module.exports = {
    data: new SlashCommandBuilder()
    .setName("get-info")
    .setDescription("Gets info about a user")
    .addStringOption(option =>
        option
            .setName('player')
            .setDescription('Kick user by Username or User ID')
            .setRequired(true)
    ),
    run: async ({ interaction }) => {
        // await interaction.deferReply();

        /*const chosenPlayer = interaction.options.getString('player');
        const key = await getApiKey(interaction.guildId);

        const foundPlayer = await validatePlayer(chosenPlayer);
        const userInfo = await doSomething(key, foundPlayer.id);*/

        const userEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            /*.setTitle(userInfo.displayName)
            .setURL(`https://roblox.com/users/${userInfo.id}`)
            .setDescription(userInfo.about)
            .addFields(
                { name: 'Username', value: userInfo.name, inline: true },
                { name: 'ID', value: userInfo.id, inline: true },
                { name: 'Locale', value: userInfo.locale, inline: true },
                { name: 'Premium', value: userInfo.premium ? 'Yes' : 'No', inline: true },
                { name: 'ID Verified', value: userInfo.idVerified ? 'Yes' : 'No', inline: true },
                { name: 'Twitter', value: userInfo.socialNetworkProfiles.twitter || 'N/A', inline: true },
                { name: 'Twitch', value: userInfo.socialNetworkProfiles.twitch || 'N/A', inline: true }
            )*/
            // .setTimestamp(new Date(userInfo.createTime))
            .setFooter({ text: 'Creation Date', iconURL: 'https://roblox.com/favicon.ico'})

        await interaction.editReply({ embeds: [ userEmbed ] })
    },

    options: {
        devOnly: true,
        deleted: false,
    }
}