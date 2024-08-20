const axios = require('axios');
const { createEmbed } = require('../utils/Helpers');
const { getApiKey } = require('../schemas/guild');

const BASE_ROBLOX_API = 'https://apis.roblox.com';
const BASE_USER_URL = 'https://users.roblox.com/v1/usernames/users'; // usernames
const BASE_ROBLOX_URL = 'https://api.roblox.com/users/'; // userIDs
const BASE_THUMBNAIL_URL = 'https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=';

// Messaging Service & Datastores
const MESSAGING_TOPIC = 'DTR';

async function publish_message(apiKey, universeId, message) {
    const object_url = new URL(`/messaging-service/v1/universes/${universeId}/topics/${MESSAGING_TOPIC}`, BASE_ROBLOX_API);
    const params = {
        "message": message
    };

    try {
        const response = await axios.post(object_url, params, {
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            return true; // 'Message successfully sent!';
        } else {
            console.error('An unknown error has occurred')
            return false;
        }
    } catch (err) {
        if (err.response) {
            if (err.response.status === 401) {
                console.error('API key not valid for operation, user does not have authorization')
            } else if (err.response.status === 403) {
                console.error('Publish is not allowed on universe')
            } else if (err.response.status === 500) {
                console.error('Server internal error / Unknown error')
            } else if (err.response.status === 400) {
                if (err.response.data === "requestMessage cannot be longer than 1024 characters. (Parameter 'requestMessage')") {
                    console.error('The request message cannot be longer than 1024 characters')
                }
                console.log(err.response.data);
            }
        } else {
            console.error(`Error with publishing message: ${err.message}`);
        }
        return false;
    }
}
async function apply_restriction(apiKey, universeId, playerIdentifier, banState, displayReason, internalReason, duration, excludeAlts) {
    const object_url = new URL(`/cloud/v2/universes/${universeId}/user-restrictions/${playerIdentifier}`, 'https://apis.roblox.com');
    const gameJoinRestriction = {
        active: banState,
        privateReason: internalReason,
        displayReason: displayReason,
    };

    if (duration > 0) gameJoinRestriction.duration = `${duration}s`;
    if (excludeAlts !== null) gameJoinRestriction.excludeAlts = excludeAlts;

    try {
        const response = await axios.patch(object_url, { gameJoinRestriction: gameJoinRestriction }, {
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            }
        })
        return response.status === 200
    } catch (error) {
        console.error('Restriction API Error:', error.response ? error.response.data : error.message);
    }
}

async function get_restriction(apiKey, universeId, pageToken = '') {
    let object_url = `https://apis.roblox.com/cloud/v2/universes/${universeId}/user-restrictions:listLogs?maxPageSize=10`;// new URL(`/cloud/v2/universes/${universeId}/user-restrictions?maxPageSize=10`, BASE_ROBLOX_API);
    if (pageToken) { object_url += `&pageToken=${pageToken}`}

    try {
        const response = await axios.get(object_url, { 
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            }
         });
        return response.data;
    } catch (error) {
        console.error('Restriction API Error:', error.response ? error.response.data : error.message);
    }
}

// Images & Usernames
async function retrievePlayerThumbnail(player) {
    // const object_url = `https://apis.roblox.com/cloud/v2/users/${player}:generateThumbnail?size=50&format=PNG&shape=ROUND`;
    const object_url = BASE_THUMBNAIL_URL + player + '&size=50x50&format=Png&isCircular=true';
    try {
        /*const response = await axios.get(object_url, {
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json',
            }
        });*/
        const response = await axios.get(object_url);
        const data = response.data.data[0];
        if (data.state === 'Blocked') {
            console.log("blocked image, broken link");
            return null;
        }
        return data.imageUrl;
    } catch (err) {
        console.log('Failed to retrieve image', err);
        return err;
    }
}

async function validatePlayer(playerInput) {
    const objectUrl = isNumeric(playerInput) ? BASE_ROBLOX_URL
        + playerInput : BASE_USER_URL;

    try {
        const response = await axios.post(objectUrl, {
            "usernames": [ playerInput ],
            "excludeBannedUsers": true
        });

        const data = response.data.data[0];
        return data ? { id: data.id, name: data.name } : null;
    } catch (err) {
        console.error(`Error with player validation: ${err.message}`)
        return null;
    }
}

// Interactions
async function validateAndRetrieve(interaction, chosenPlayer, ignoreReply) {
    const apiKey = await getApiKey(interaction.guildId);
    if (!apiKey) {
        if (ignoreReply) return null;
        const noKeyEmbed = createEmbed('⚠️ API Key not configured!', 'Be sure to setup your API key with proper configured permissions.');
        await interaction.editReply({ embeds: [ noKeyEmbed ] });
        return null;
    }

    const validatedPlayer = await validatePlayer(chosenPlayer);
    if (!validatedPlayer || !validatedPlayer.id) {
        if (ignoreReply) {
            return { apiKey };
        }
        await interaction.editReply({ content: `Could not find the user: ${chosenPlayer}` });
        return null;
    }

    const playerThumbnail = await retrievePlayerThumbnail(validatedPlayer.id);
    return { apiKey, validatedPlayer, playerThumbnail };
}

// Helpers
async function getUniverseIdFromPlace(id) {
    try {
        const res = await axios.get(`https://apis.roblox.com/universes/v1/places/${id}/universe`, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return res.data.universeId
    } catch (err) {
        console.error('IDVerse' + err);
    }
}

function isNumeric(str) {
    if (typeof str != "string") return false
    return !isNaN(str) &&
        !isNaN(parseFloat(str))
}

module.exports = { apply_restriction, get_restriction, publish_message, getUniverseIdFromPlace, validateAndRetrieve }