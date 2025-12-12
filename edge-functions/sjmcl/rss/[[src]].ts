import transform from '../../../src/sjmcl/rss';
import Logger from '../../../src/libs/Logger';

export async function onRequestGet(ctx: any): Promise<Response>{
    const params: string | string[] = ctx.params.src;

    let src: string;
    if (Array.isArray(params)) src = params.join('/');
    else src = params;

    const srcUrl = new URL(src);
    const originalUrl = new URL(ctx.request.url);

    const logger = new Logger('sjmcl/rss');
    logger.info('request.start', { src });
    return await transform(srcUrl, originalUrl);
}
