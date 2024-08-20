const { getSettings } = require('../schemas/guild');
const allowAdministrators = true;

module.exports = async ({ interaction }) => {
    // await interaction.deferReply({ ephemeral: true });
    const { member } = interaction;
    const guildSettings = await getSettings(interaction.guild);
    const botExecutor = guildSettings.botExecutor;
    const hasPermission = member.permissions.has('ADMINISTRATOR');
    const hasExecutorRole = member.roles.cache.has(botExecutor);

    if ((allowAdministrators && !hasPermission)
    || (!allowAdministrators && !hasPermission)
    || (botExecutor && !hasExecutorRole)
    && interaction.user.id !== guildSettings.data.owner) {
        await interaction.editReply({ content: 'You do not have permission to run this command', ephemeral: true });
        return true;
    }
};