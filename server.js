'use strict';

require('dotenv').config();
const Hapi = require('hapi');
const contentful = require('contentful');
const FB = require('fb');

const server = new Hapi.Server();

server.connection({
    port: process.env.PORT || 5000,
    host: '0.0.0.0',
    routes: { cors: true }
});

server.route({
    method: 'GET',
    path: '/',
    config: {
        handler: function (request, reply) {
            reply('Hello Scouts!');
        }
    }
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
            let events = [];

            fbClient.api('/pack122/events', 'get')
                .then((res) => {
                    if (res.data && res.data.length > 0) {
                        const now = new Date().valueOf();

                        events = res.data.map((obj) => {
                            // convert to epoch time stamps so that safari is happy
                            obj.end_time = obj.end_time ? new Date(obj.end_time).valueOf() : null;
                            obj.start_time = new Date(obj.start_time).valueOf();
                            return obj;
                        }).filter((obj) => {
                            // show only upcoming
                            return obj.start_time > now;
                        }).reverse();
                    }

                    reply({data: events});
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
            let posts = [];

            fbClient.api('/pack122/posts', 'get')
                .then((res) => {
                    // Don't show posts without a message and show the last 10 qualifying
                    if (res.data && res.data.length > 0) {
                        posts = res.data.map((obj) => {
                            // convert to epoch time stamp so that safari is happy
                            obj.created_time = new Date(obj.created_time).valueOf();
                            return obj;
                        }).filter((obj) => obj.message).slice(0, 10);
                    }

                    reply({data: posts});
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

    /**
     * To create a permanent FB token see:
     * https://stackoverflow.com/questions/17197970/facebook-permanent-page-access-token
     */
    fb.setAccessToken(process.env.FB_TOKEN);

    return fb;
}
