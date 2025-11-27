// import sjmcl from '../../../src/sjmcl/rss';

export async function onRequestGet(ctx: any) {
    const params: string | Array<string> = ctx.params.src;

    return new Response(JSON.stringify(params), { status: 200 });
}