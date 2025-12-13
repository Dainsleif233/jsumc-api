import transform from '../../../src/sjmcl/rss';
import Logger from '../../../src/utils/Logger';

export async function onRequestGet(ctx: any): Promise<Response>{
    const params: string[] = ctx.params.src;
    
    return new Response(JSON.stringify(params));

    // const src = params.join('/');
    // const srcUrl = new URL(src);
    // const originalUrl = new URL(ctx.request.url);

    // const log = new Logger('SJMCL/RSS');
    // log.info('Fetching {}', src);
    // return transform(srcUrl, originalUrl);
}
