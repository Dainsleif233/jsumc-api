// import sjmcl from '../../../src/sjmcl/rss';

export async function onRequestGet(ctx: any) {
    const params = await ctx.params.src;

    return new Response(params, { status: 200 });
}