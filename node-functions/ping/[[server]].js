import mcping from '../../src/mcping';

export async function onRequestGet(ctx) {
    const params = ctx.params.server;
    const server = Array.isArray(params) ? params[0] : params;

    return mcping(server);
}