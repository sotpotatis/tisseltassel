# TisselTassel

[Netlify functions] boilerplate/proof of concept/template to easily 🤫hide🤫 your private API credentials with JavaScript.

## Introduction

Do you want to call an API in JavaScript that uses an API token, but don't want to expose it?
Then, you might want to look into this project, because this is exactly why I created it.

While the available API converters right now are as minimal as they can get, I believe this project might serve
as a base both for you and for me for requesting future stuff.

## How it works

So simple! Here is a minimal example of how to expose API credentials.

Create a reusable class (`src/apiConverters/myapi.js`):
```javascript
class MyAPI{
    constructor(apiToken){
        this.apiToken = apiToken // If you need other args, feel free to use whatever args you want
        this.methods = { // Add all API methods you want to expose here
            "bananas": fetchBananas
    }
    }
    fetchBananas(data){
        /* Each function has a data parameter.
        * Data is sent to the API when it is requested. 
        * It is not validated, so you have to validate it first. */
        if (!data.includes("bananas")){
            return null // Return null if the validation has failed
        }
        else {
            // Return the parameters that you would pass to axios() here.
            // Axios is a popular JavaScript requests library
            // The example below will call axios("https://monkeyapi.com/bananas?token=ABC")
            return (`https://monkeyapi.com/bananas?token=${apiToken}`)
        }
    }
}
module.exports = MyAPI
```
Add it to your config (`src/config.js`):
```javascript
const MyAPI = require("./apiConverters/myapi.js")
const config = {
    converters : {
        //...
        bananaAPI: new MyAPI("<Your API token goes here>")
        //..
    }
}
module.exports = config
```

Then request it:

**POST** `https://your-base-url.tld/api/tisseltassel`

with body 

```json
{
	"apiType": "bananaAPI",
	"apiMethod": "fetchBananas",
	"apiData": {
		"bananas": ["ripe"]
	}
}
```

and get a response back, without exposing any API secrets!

```json
{
	"success": true,
    "status": "success",
    "response": {
      "bananas": [...],
      "page": 1,
      "total_pages": 3
    }
}
```

## How to deploy (manually)

1. `npm install -g netlify-cli`
2. `netlify build`
3. `netlify deploy --prod`

## How to test (locally)

1. `netlify functions:build --src netlify/functions`
2. `netlify functions:serve`

## Naming

"Tisseltassel" is a Swedish saying for when people are whispering to each other.