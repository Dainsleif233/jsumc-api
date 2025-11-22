import mcping from './main';

export default {
    async fetch(request) {
        if (request.method !== 'GET') return;
        
        const server = new URL(request.url).pathname.substring(1);

        return mcping(server);
    }
};