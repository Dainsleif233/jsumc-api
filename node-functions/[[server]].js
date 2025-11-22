import mcping from '../main';

export async function onRequestGet(ctx) {
    const param = ctx.params.server;
    const server = Array.isArray(param) ? param[0] : param;

    return mcping(server);
}