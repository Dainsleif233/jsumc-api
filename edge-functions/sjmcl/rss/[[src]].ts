import transform from '../../../src/sjmcl/rss';

export async function onRequestGet(ctx: any): Promise<Response>{
    const params: string | string[] = ctx.params.src;

    let src: string;
    if (Array.isArray(params)) src = params.join('/');
    else src = params;

    const srcUrl = new URL(src);
    const originalUrl = new URL(ctx.request.url);
    srcUrl.search = originalUrl.search;

    return new Response(srcUrl.toString())
    return transform(srcUrl, originalUrl);
}