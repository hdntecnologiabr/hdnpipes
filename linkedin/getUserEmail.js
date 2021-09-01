const https = require('https');

module.exports = ({ linkedinUserAccessToken }) => async ctx => {

    const options = {
        hostname: 'api.linkedin.com',
        port: "443",
        path: `/v2/emailAddress?q=members&projection=(elements*(handle~))`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${linkedinUserAccessToken(ctx)}`
        }
    };

    return new Promise((resolve, reject) => {
        try {
            https.get(options, (response) => {
                //response.setEncoding('utf8');
                let body = '';
                response.on('data', (chunk) => {
                    body += chunk;
                });
                response.on('end', () => {
                    ctx.getUserEmailResult = {
                        statusCode: response.statusCode,
                        response: JSON.parse(body).elements[0]["handle~"].emailAddress
                    }
                    resolve(ctx);
                });
            }).on('error', (e) => {
                console.log(e)
                ctx.getUserEmailResult = {
                    statusCode: 500,
                    response: {
                        error_description: "Internal error when retrieving linkedin user email"
                    }
                }
                resolve(ctx);
            });
        } catch (error) {
            console.log(error)
            ctx.getUserEmailResult = {
                statusCode: 500,
                response: {
                    error_description: "Internal error when retrieving linkedin user email"
                }
            }
            resolve(ctx);
        }
    });
}