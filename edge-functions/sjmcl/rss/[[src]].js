// import sjmcl from '../../../src/sjmcl';

export async function onRequestGet(ctx) {
    const params = ctx.params.server;
    if (Array.isArray(params))
        console.log(JSON.stringify(params));
    else
        console.log(params);

    return new Response(JSON.stringify(params), { status: 200 });
}