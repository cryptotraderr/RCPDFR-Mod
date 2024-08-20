const { model, Schema } = require("mongoose");

const appealSchema = new Schema({
    _id: String,
    Data: [{
        interactionUser: String,
        chosenServer: String,
        robloxUser: String,
        reason: String,
    }]
});

module.exports = model("Appeals", appealSchema)