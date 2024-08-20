const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    name: 'submit-appeal',
    async run({interaction}) {
        const modal = new ModalBuilder()
                .setCustomId('unban-appeal')
                .setTitle('📝 Unban Appeal Application');

        const serverInputField = new TextInputBuilder()
            .setCustomId('serverInput')
            .setLabel('🆔 Place ID you are banned from')
            .setPlaceholder('18897342336')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const userInputField = new TextInputBuilder()
            .setCustomId('userInput')
            .setLabel('🪪 What is your username or user ID?')
            .setPlaceholder('corehimself')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const reasonInputField = new TextInputBuilder()
            .setCustomId('reasonInput')
            .setLabel('📝 Why would you like to appeal?')
            .setPlaceholder('I would like to appeal my ban because...')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const firstAct = new ActionRowBuilder().addComponents(serverInputField);
        const secAct = new ActionRowBuilder().addComponents(userInputField);
        const thirdAct = new ActionRowBuilder().addComponents(reasonInputField);
        modal.addComponents(firstAct, secAct, thirdAct);

        await interaction.showModal(modal);
    },
};