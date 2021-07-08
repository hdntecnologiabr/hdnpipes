const https = require('https');
const queryString = require('querystring');

module.exports = ({ verificationToken, redirectUrl, clientId, clientSecret }) => async ctx => {
    const urlParameters = {
        grant_type: "authorization_code",
        code: verificationToken(ctx),
        redirect_uri: redirectUrl(ctx),
        client_id: clientId(ctx),
        client_secret: clientSecret(ctx)
    }

    const postData = queryString.stringify(urlParameters);

    const options = {
        hostname: 'www.linkedin.com',
        port: "443",
        path: `/oauth/v2/accessToken`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    return new Promise((resolve) => {
        try {
            const req = https.request(options, (response) => {
                //response.setEncoding('utf8');
                let chunks_of_data = [];

                response.on('data', (chunk) => {
                    chunks_of_data.push(chunk);
                });

                response.on('end', () => {
                    ctx.getUserAccessTokenResult = {
                        statusCode: response.statusCode,
                        response: JSON.parse(Buffer.concat(chunks_of_data).toString())
                    }
                    resolve(ctx);
                });
            })

            req.on('error', (error) => {
                ctx.getUserAccessTokenResult = {
                    statusCode: 500,
                    response: {
                        error_description: "Internal error when retrieving linkedin user access token"
                    }
                }
                resolve(ctx);
            });

            req.write(postData);

            req.end();
        } catch (error) {
            ctx.getUserAccessTokenResult = {
                statusCode: 500,
                response: {
                    error_description: "Internal error when retrieving linkedin user access token"
                }
            }
            resolve(ctx);
        }
    });
}