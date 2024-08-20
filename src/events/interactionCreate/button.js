module.exports = async (interaction, client) => {
    const { customId } = interaction;
    const isButton = interaction.isButton();

    if (isButton) {
        const button = client.buttons.get(customId);
        if (!button) return;
        await button.run({ interaction, client });
    }
};