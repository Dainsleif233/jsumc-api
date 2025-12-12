import mcping from '../../src/mcping';
import Logger from '../../src/libs/Logger';

export async function onRequestGet(ctx: any): Promise<Response> {
    const params = ctx.params.server;
    const server: string = Array.isArray(params) ? params[0] : params;

    const logger = new Logger('ping');
    logger.info('request.start', { server })
    return await mcping(server);
}
