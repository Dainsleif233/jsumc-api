import { SJMCLPost, SJMCLResponse, SJMCLSourceInfo } from "../libs/SJMCL";
import { parseXMLString, XMLElement } from "../libs/XMLParser";
import Logger from "../libs/Logger";

export default async function (rssUrl: URL, originalUrl: URL) {
    const log = new Logger('SJMCL/RSS')

    try {
        const pageSize = Number(originalUrl.searchParams.get('pageSize')) || 0;
        originalUrl.searchParams.delete('pageSize');
        const cursor = Number(originalUrl.searchParams.get('cursor')) || 0;
        originalUrl.searchParams.delete('cursor');
        rssUrl.search = originalUrl.search;

        if (pageSize < 0 || cursor < 0) throw new Error('Invalid page size or cursor');

        log.info('Transform {}:{}:{} started', rssUrl.toString(), pageSize.toString(), cursor.toString());
        const response = await fetch(rssUrl);
        const rssString = await response.text();
        const rss = parseXMLString(rssString, 'text/xml');
        const channel = rss.querySelector('channel');
        if (!channel) throw new Error('RSS channel not found');

        const sourceInfo: SJMCLSourceInfo = {
            endpointUrl: originalUrl.toString(),
            fullName: pick(channel, 'description'),
            iconSrc: pick(channel, 'image', 'url') || undefined,
            name: pick(channel, 'title')
        };

        const items = channel.querySelectorAll('item');

        let next: number | undefined;
        if (items.length > cursor + pageSize) next = cursor + pageSize;

        let posts: SJMCLPost[] | undefined;
        if (pageSize === 0) posts = [];
        else if (items.length > cursor) posts = items.slice(cursor, cursor + pageSize).map(item => {
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

        log.info('Transform {} successfully', rssUrl.toString());
        return new Response(
            JSON.stringify(sjmclResp),
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (e: any) {
        log.error('Transform {} error: {}', rssUrl.toString(), e?.message);
        return new Response(e.message, { status: 500 });
    }
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
