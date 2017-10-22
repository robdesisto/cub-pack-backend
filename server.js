'use strict';

/**
 * To create a permanent FB token see:
 * https://stackoverflow.com/questions/17197970/facebook-permanent-page-access-token
 */
require('dotenv').config();
const Hapi = require('hapi');
const contentful = require('contentful');
const config = require('./config');
const FB = require('fb');

const server = new Hapi.Server();

server.connection({
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
    routes: { cors: true }
});

server.route({
    method: 'GET',
    path: '/cms/pages',
    config: {
        handler: function (request, reply) {
            const cmsClient = contentful.createClient({
                space: process.env.CONTENTFUL_ID,
                accessToken: process.env.CONTENTFUL_TOKEN
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
        appId: process.env.FB_ID,
        appSecret: process.env.FB_SECRET
    };

    const fb = new FB.Facebook(options);

    fb.setAccessToken(process.env.FB_TOKEN);

    return fb;
}
