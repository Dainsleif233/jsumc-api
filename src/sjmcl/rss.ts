import { SJMCLPost, SJMCLResponse, SJMCLSourceInfo } from "../libs/SJMCL";
import { parseXMLString, XMLElement } from "../libs/XMLParser";

export default async function (rssUrl: string, originalUrl: string) {
    try {
        if (!rssUrl) throw new Error('No RSS URL provided');

        const url = new URL(rssUrl);
        const pageSize = Number(url.searchParams.get('pageSize')) || 0;
        url.searchParams.delete('pageSize');
        const cursor = Number(url.searchParams.get('cursor')) || 0;
        url.searchParams.delete('cursor');

        if (pageSize < 0 || cursor < 0) throw new Error('Invalid page size or cursor');

        const response = await fetch(url);
        const rssString = await response.text();
        const rss = parseXMLString(rssString, 'text/xml');
        const channel = rss.querySelector('channel');
        if (!channel) throw new Error('RSS channel not found');

        const sourceInfo: SJMCLSourceInfo = {
            endpointUrl: getEndpointUrl(originalUrl),
            fullName: pick(channel, 'description'),
            iconSrc: pick(channel, 'image', 'url') || undefined,
            name: pick(channel, 'title')
        };

        const items = channel.querySelectorAll('item');

        let next: number | undefined;
        if (items.length > cursor + pageSize) next = cursor + pageSize;

        let posts: SJMCLPost[] | undefined;
        if (pageSize === 0) posts = [];
        else if (items.length > cursor) posts = items.slice(cursor, cursor + pageSize - 1).map(item => {
            const keywords = item.querySelectorAll('category').map(category => category.textContent);
            const date = formatRssDate(pick(item, 'pubDate'));

            const post: SJMCLPost = { 
                abstract: pick(item, 'description') || pick(item, 'title'),
                createAt: date,
                id: items.indexOf(item),
                imageSrc: sourceInfo.iconSrc ? [sourceInfo.iconSrc, 720, 720] : undefined,
                keywords: keywords.join(','),
                link: pick(item, 'link'),
                source: sourceInfo,
                title: pick(item, 'title') || pick(item, 'description'),
                updateAt: date
            }
            return post;
        });

        const sjmclResp: SJMCLResponse = { next, posts, sourceInfo }

        return new Response(
            JSON.stringify(sjmclResp),
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (e: any) {
        return new Response(e.message, { status: 500 });
    }
}

function getEndpointUrl(url: string) {
    const endpointUrl = new URL(url);
    endpointUrl.searchParams.delete('pageSize');
    endpointUrl.searchParams.delete('cursor');
    return endpointUrl.toString();
}

function pick(root: XMLElement, ...selectors: string[]) {
    let current: XMLElement | null = root;
    
    for (const selector of selectors) {
        if (!current) return '';
        current = current.querySelector(selector);
    }
    
    return current?.textContent?.trim() ?? '';
}

function formatRssDate(rssDateStr: string): string {
    try {
        const date = new Date(rssDateStr);
        return date.toISOString().split('.')[0];
    } catch {
        return new Date().toISOString().split('.')[0];
    }
}