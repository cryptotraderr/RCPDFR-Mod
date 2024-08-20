const { model, Schema } = require('mongoose');
const FixedSizeMap = require('fixedsize-map');
const { encrypt, decrypt } = require('../utils/Helpers');
const cache = new FixedSizeMap(100);

const guildSchema = new Schema({
    _id: String,
    data: {
        name: String,
        region: String,
        owner: { type: String, ref: 'users' },
        joinedAt: Date,
        leftAt: Date,
        bots: { type: Number, default: 0 },
    },
    logging: {
        enabled: Boolean,
        log_channels: [
            {
                _id: String,
                name: String,
            },
        ]
    },
    cloud: {
        apiKey: String,
        universes: [{
            universeId: String,
            universeName: String,
        }],
    },
    
    botExecutor: String,
    clientId: String,
    presences: Array,
});

const guildModel = model('guild', guildSchema);

// noinspection JSCheckFunctionSignatures
module.exports = {
    getSettings: async (guild) => {
        if (!guild) throw new Error('Guild is undefined');
        if (!guild.id) throw new Error('Guild id is undefined');

        const cached = cache.get(guild.id);
        if (cached) {
            return cached;
        }

        let guildData = await guildModel.findById(guild.id);
        if (!guildData) {
            guildData = new guildModel({
                _id: guild.id,
                data: {
                    name: guild.name,
                    region: guild.preferredLocale,
                    owner: guild.ownerId,
                    joinedAt: guild.joinedAt,
                },
            });

            await guildData.save();
        }
        cache.add(guild.id, guildData);
        return guildData;
    },

    getApiKey: async (guildId) => {
        try {
            const record = await guildModel.findById(guildId);
            if (!record) console.error('Guild not found');
            const encodedKey = record.cloud.apiKey;
            return decrypt(encodedKey);
        } catch (err) {
            console.error(err);
            return null;
        }
    },

    setApiKey: async (guildId, apiKey) => {
        try {
            const encryptedApiKey = encrypt(apiKey);
            const result = await guildModel.findOneAndUpdate(
                { _id: guildId },
                { 'cloud.apiKey': encryptedApiKey },
                { new: true, upsert: true },
            );
            return result !== null;
        } catch (err) {
            console.err(err);
            return null;
        }
    },

    addUniverse: async (guildId, universeName, universeId) => {
        const result = await guildModel.findOneAndUpdate(
            { _id: guildId },
            { $push: { 'cloud.universes': { universeId: universeId, universeName: universeName } } },
            { new: true, upsert: true }
        );
        return result !== null;
    },

    removeUniverse: async (guildId, universeId) => {
        const result = await guildModel.findOneAndUpdate(
            { _id: guildId },
            { $pull: { 'cloud.universes': { universeId: universeId } } },
            { new: true }
        );
        return result !== null;
    },

    getUniverse: async (guildId, universeId) => {
        return await guildModel.findOne(
            { _id: guildId, 'cloud.universes.universeId': universeId },
            { 'cloud.universes.$': 1 }
        );
    },


    listUniverses: async (guildId) => {
        const guild = await guildModel.findOne(
            { _id: guildId },
            { 'cloud.universes': 1 }
        ).lean();
        return guild ? guild.cloud.universes : [];
    },
};