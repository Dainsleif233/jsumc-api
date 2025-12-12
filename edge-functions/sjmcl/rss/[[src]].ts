import transform from '../../../src/sjmcl/rss';
import Logger from '../../../src/libs/Logger';

export function onRequestGet(ctx: any): Promise<Response>{
    const params: string | string[] = ctx.params.src;

    let src: string;
    if (Array.isArray(params)) src = params.join('/');
    else src = params;

    const srcUrl = new URL(src);
    const originalUrl = new URL(ctx.request.url);

    const log = new Logger('SJMCL/RSS');
    log.info('Fetching {}', src);
    return transform(srcUrl, originalUrl);
}
