const querystring = require("querystring")
class LastFMAPIConverter {
    constructor(apiKey) {
        this.apiKey = apiKey
        this.getRecentUserTracks = this.getRecentUserTracks.bind(this)
        this.generateAxiosArguments = this.generateAxiosArguments.bind(this)
        this.methods = {
            "user.getRecentTracks": this.getRecentUserTracks
        }
    }
    generateAxiosArguments(method, params){
        /**
         * Generates the methods to send to axios().
         * @param method: The Last.FM API method to use.
         * @param params: The URL parameters to pass.
         */
        // Add basic request details: method, format and API key
        params.method = method
        params.format = "json"
        params.api_key = this.apiKey
        const paramsText = "?" + querystring.stringify(params) // Add parameters
        return [`https://ws.audioscrobbler.com/2.0${paramsText}`, null]
    }
    getRecentUserTracks(data){
        if (data.user === undefined){ // Validate that all required parameters are passed
            return null
        }
        return this.generateAxiosArguments(" user.getRecentTracks", {
            user: data.user
        })
    }
}
module.exports = LastFMAPIConverter