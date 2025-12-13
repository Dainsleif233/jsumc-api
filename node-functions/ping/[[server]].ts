import mcping from '../../src/mcping';
import Logger from '../../src/utils/Logger';

export async function onRequestGet(ctx: any): Promise<Response> {
    const params = ctx.params.server;
    const server: string = Array.isArray(params) ? params[0] : params;

    const log = new Logger('MCPing');
    log.info('Pinging {}', server)
    return new Response(JSON.stringify(params));
    // return mcping(server);
}
