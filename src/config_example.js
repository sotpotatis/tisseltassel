/* config_example.js
I am an example config for Tisseltissel! Edit me.
See the README.md file for more information. */
// Import all the API converters that you want
const LastFMAPIConverter = require("./apiConverters/lastfm.js")
// ...then define the actual config...
const config = {
    converters : { // Define all the API converters you want to make available here.
        lastFM: new LastFMAPIConverter("<YOUR_API_KEY>") // The Last.FM API implementation is a barebones example.
    }
}
// ...then export it!
module.exports = config