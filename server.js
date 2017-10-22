'use strict';

/**
 * To create a permanent FB token see:
 * https://stackoverflow.com/questions/17197970/facebook-permanent-page-access-token
 */
const Hapi = require('hapi');
const contentful = require('contentful');
const config = require('./config');
const FB = require('fb');

const server = new Hapi.Server();

server.connection({ port: 3000, host: 'localhost', routes: { cors: true } });

server.route({
    method: 'GET',
    path: '/cms/pages',
    config: {
        handler: function (request, reply) {
            const cmsClient = contentful.createClient({
                space: config.cSpaceId,
                accessToken: config.cToken
            });

            cmsClient.getEntries()
                .then((res) => {
                    reply(res);
                }, (e) => {
                    console.error(e);
                    throw e;
                });
        }
    }
});

server.route({
    method: 'GET',
    path: '/fb/events',
    config: {
        handler: function (request, reply) {
            const fbClient = createFb();

            fbClient.api('/pack122/events', 'get')
                .then((res) => {
                    reply(res);
                }, (e) => {
                    console.error(e);
                    throw e;
                });
        }
    }
});

server.route({
    method: 'GET',
    path: '/fb/posts',
    config: {
        handler: function (request, reply) {
            const fbClient = createFb();

            fbClient.api('/pack122/posts', 'get')
                .then((res) => {
                    reply(res);
                }, (e) => {
                    console.error(e);
                    throw e;
                });
        }
    }
});

server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});

function createFb() {
    const options = {
        version: 'v2.10',
        appId: config.fbId,
        appSecret: config.fbSecret
    };

    const fb = new FB.Facebook(options);

    fb.setAccessToken(config.fbToken);

    return fb;
}
