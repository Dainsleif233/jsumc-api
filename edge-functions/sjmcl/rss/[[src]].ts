import transform from '../../../src/sjmcl/rss';

export async function onRequestGet(ctx: any): Promise<Response>{
    const params: string | string[] = ctx.params.src;

    let src: string;
    if (Array.isArray(params)) src = params.join('/');
    else src = params;

    const request: Request = ctx.request;

    return transform(src, request.url);
}