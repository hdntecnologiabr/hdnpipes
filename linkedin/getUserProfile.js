const https = require('https');

module.exports = ({ linkedinUserAccessToken }) => async ctx => {

    const options = {
        hostname: 'api.linkedin.com',
        port: "443",
        path: `/v2/me`,
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
                    ctx.getUserProfileResult = {
                        statusCode: response.statusCode,
                        response: JSON.parse(body)
                    }
                    resolve(ctx);
                });
            }).on('error', (e) => {
                ctx.getUserProfileResult = {
                    statusCode: 500,
                    response: {
                        error_description: "Internal error when retrieving linkedin user profile"
                    }
                }
                resolve(ctx);
            });
        } catch (error) {
            ctx.getUserProfileResult = {
                statusCode: 500,
                response: {
                    error_description: "Internal error when retrieving linkedin user profile"
                }
            }
            resolve(ctx);
        }
    });
}