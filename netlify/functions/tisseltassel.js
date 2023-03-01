/* tisseltassel.js
Exposes the main Netlify functions. */
// Import config
const axios = require("axios");
const config = require("../../src/config");
// Constants
const requiredParameters = ["apiType", "apiMethod", "apiData"];
const successStatus = "success";
const errorStatus = "error";
// Using custom headers in the Netlify configuration file does not work with functions, so we have to define them below
// (source: https://docs.netlify.com/routing/headers/:
// "If you are proxying content to your site or dealing with a URL handled by a function such as a server-side rendered (SSR) page, custom headers won’t be applied to that content.
// In those cases, the site being proxied to or the serverless function should return any required headers instead.")
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": config.cors.origin,
  "Access-Control-Allow-Methods": config.cors.methods || "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": config.cors.headers || "Content-Type",
};

function generateAPIResponse(status, content) {
  /**
   * Function for generating an API response which is a JSON object.
   * @param status The status of the response.
   * @param content The content of the response.
   */
  content.status = status;
  content.success = status === successStatus;
  return JSON.stringify(content);
}
function generateAPIError(message, content = null) {
  /**
   * Shortcut function for generating an API error.
   * @param message The error message.
   */
  if (content === null) {
    content = {};
  }
  content.message = message;
  return generateAPIResponse(errorStatus, content);
}
function generateAPISuccess(content) {
  /** Shortcut function for returning an API success response.
   * @param content The content to include in the response.*/
  return generateAPIResponse(successStatus, content);
}
exports.handler = function (event, context, callback) {
  /**
   * Runs every time a request is incoming.
   */
  // Only allow POST methods, regardless the API method.
  // Remember, the handler only receives the API data and then makes a request
  // to the third party API, meaning methods don't need to match at all.
  if (event.httpMethod !== "POST") {
    if (event.httpMethod === "OPTIONS") {
      // Return CORS headers on OPTIONS
      console.log("Returning options...");
      callback(null, {
        statusCode: 200,
        headers: CORS_HEADERS,
      });
    } else {
      callback(null, {
        statusCode: 405,
        body: generateAPIError("Method not allowed (hint: use POST)"),
        headers: CORS_HEADERS,
      });
    }
  }
  let params = null;
  try {
    params = JSON.parse(event.body);
  } catch (e) {
    console.log(`Failed to parse JSON (${e}). Returning error...`);
    callback(null, {
      statusCode: 400,
      body: generateAPIError("Invalid JSON."),
      headers: CORS_HEADERS,
    });
    return;
  }
  console.log("Validating incoming request to tisseltassel...");
  if (params.length === 0) {
    console.log("No parameters passed.");
    callback(null, {
      statusCode: 400,
      body: generateAPIError("No parameters were passed."),
      headers: CORS_HEADERS,
    });
    return;
  }
  // Validate parameters
  const paramKeys = Object.keys(params);
  for (const requiredParameter of requiredParameters) {
    if (!paramKeys.includes(requiredParameter)) {
      callback(null, {
        statusCode: 400,
        body: generateAPIError(
          `Parameter ${requiredParameter} missing from request.`
        ),
        headers: CORS_HEADERS,
      });
      return;
    }
  }
  console.log("Request has required parameters.");
  const apiType = params.apiType;
  const apiMethod = params.apiMethod;
  const apiData = params.apiData;
  // Validate type and method
  if (!Object.keys(config.converters).includes(apiType)) {
    console.log("Invalid API type requested.");
    callback(null, {
      statusCode: 404,
      body: generateAPIError(
        `Non-existent API ${apiType} requested (is not available on server).`
      ),
      headers: CORS_HEADERS,
    });
    return;
  } else if (
    !Object.keys(config.converters[apiType].methods).includes(apiMethod)
  ) {
    console.log("Invalid API method requested.");
    callback(null, {
      statusCode: 404,
      body: generateAPIError(
        `Non-existent API method ${apiType} requested (is not available on server).`
      ),
      headers: CORS_HEADERS,
    });
    return;
  }
  if (typeof apiData !== "object") {
    console.log("Invalid apiData type.");
    callback(null, {
      statusCode: 400,
      body: generateAPIError("Invalid argument apiData (is not object)"),
      headers: CORS_HEADERS,
    });
  }
  const axiosArguments = config.converters[apiType].methods[apiMethod](apiData);
  // The converter function should return null if data passed is invalid.
  if (axiosArguments === null) {
    console.log("Something failed in argument validation. Returning error...");
    callback(null, {
      statusCode: 400,
      body: generateAPIError(`Argument validation failed.`),
      headers: CORS_HEADERS,
    });
    return;
  }
  console.log(`Requesting API with arguments ${axiosArguments}...`);
  // Pass the arguments we received to fetch()
  axios(axiosArguments[0], axiosArguments[1])
    .then((response) => {
      const responseJSON = response.data; // Get response JSON
      // Return either ok or bad response
      console.log("Request succeeded!");
      callback(null, {
        statusCode: 200,
        body: generateAPISuccess({
          response: responseJSON,
        }),
        headers: CORS_HEADERS,
      });
    })
    .catch((error) => {
      console.log(`Request failed with error ${error}.`);
      callback(null, {
        statusCode: 500,
        body: generateAPIError(
          `Request failed :(`,
          // Add response if a response exists.
          {
            response:
              error.response !== undefined
                ? error.response.data !== undefined
                  ? error.response.data
                  : null
                : null,
          }
        ),
        headers: CORS_HEADERS,
      });
    });
};
