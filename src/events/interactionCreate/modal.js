module.exports = async (interaction, client) => {
    const { customId } = interaction;
    const isModal = interaction.isModalSubmit();

    if (isModal) {
        const modal = client.modals.get(customId);
        if (!modal) return;
        await modal.run({ interaction });
    }
};