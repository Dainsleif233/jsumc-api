import MCPing from './libs/MinecraftServerPing';

export default async function(server) {
    let mcping;
    if (server.includes(':')) {
        const host = server.split(':')[0];
        const port = parseInt(server.split(':')[1]);

        if (port === 25565) mcping = new MCPing(host);
        else mcping = new MCPing(host, port);
    } else mcping = new MCPing(server);

    try {
        const result = await mcping.ping();

        return Response.json(result);
    } catch (e) {
        return new Response(
            e.message,
            { status: 500 }
        );
    }
}