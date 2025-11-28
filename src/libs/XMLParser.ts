class XMLElement {
    tagName: string;
    textContent: string;
    children: XMLElement[];
    attributes: Record<string, string>;

    constructor(tagName: string) {
        this.tagName = tagName;
        this.textContent = '';
        this.children = [];
        this.attributes = {};
    }

    querySelector(selector: string): XMLElement | null {
        for (const child of this.children) {
            if (child.tagName === selector) {
                return child;
            }
        }

        for (const child of this.children) {
            const found = child.querySelector(selector);
            if (found) return found;
        }

        return null;
    }

    querySelectorAll(selector: string): XMLElement[] {
        const results: XMLElement[] = [];

        for (const child of this.children) {
            if (child.tagName === selector)
                results.push(child);
            results.push(...child.querySelectorAll(selector));
        }

        return results;
    }
}

class XMLParser {
    parse(xmlString: string): XMLElement {
        xmlString = xmlString.replace(/<\?xml[^?]*\?>/g, '');
        xmlString = xmlString.replace(/<!--[\s\S]*?-->/g, '');

        const root = new XMLElement('document');
        this.parseElement(xmlString, root);

        return root;
    }

    private parseElement(xml: string, parent: XMLElement): number {
        let pos = 0;

        while (pos < xml.length) {
            const tagStart = xml.indexOf('<', pos);
            if (tagStart === -1) break;

            if (tagStart > pos) {
                const text = xml.substring(pos, tagStart).trim();
                if (text && parent.children.length === 0)
                    parent.textContent = this.decodeHTML(text);
            }

            if (xml[tagStart + 1] === '/') {
                const tagEnd = xml.indexOf('>', tagStart);
                if (tagEnd === -1) break;
                return tagEnd + 1;
            }

            if (xml.substring(tagStart, tagStart + 9) === '<![CDATA[') {
                const cdataEnd = xml.indexOf(']]>', tagStart);
                if (cdataEnd === -1) break;
                const cdataContent = xml.substring(tagStart + 9, cdataEnd);
                if (parent.children.length === 0)
                    parent.textContent = cdataContent.trim();
                pos = cdataEnd + 3;
                continue;
            }

            const tagEnd = xml.indexOf('>', tagStart);
            if (tagEnd === -1) break;
            
            const tagContent = xml.substring(tagStart + 1, tagEnd);
            const isSelfClosing = tagContent.endsWith('/');
            const tagInfo = isSelfClosing ? tagContent.slice(0, -1) : tagContent;

            const spaceIndex = tagInfo.indexOf(' ');
            const tagName = spaceIndex === -1 ? tagInfo.trim() : tagInfo.substring(0, spaceIndex).trim();

            const element = new XMLElement(tagName);

            if (spaceIndex !== -1) {
                const attributesString = tagInfo.substring(spaceIndex + 1);
                this.parseAttributes(attributesString, element);
            }

            parent.children.push(element);

            if (isSelfClosing) pos = tagEnd + 1;
            else {
                const nextPos = this.parseElement(xml.substring(tagEnd + 1), element);
                pos = tagEnd + 1 + nextPos;
            }
        }

        return pos;
    }

    private parseAttributes(attributesString: string, element: XMLElement): void {
        const attrRegex = /(\w+)\s*=\s*["']([^"']*)["']/g;
        let match;

        while ((match = attrRegex.exec(attributesString)) !== null)
            element.attributes[match[1]] = this.decodeHTML(match[2]);
    }

    private decodeHTML(text: string): string {
        const entities: Record<string, string> = {
            '&lt;': '<',
            '&gt;': '>',
            '&amp;': '&',
            '&quot;': '"',
            '&apos;': "'",
            '&#39;': "'"
        };

        return text.replace(/&[^;]+;/g, (entity) => {
            return entities[entity] || entity;
        });
    }
}

function parseXMLString(xmlString: string, mimeType: string = 'text/xml'): XMLElement {
    const parser = new XMLParser();
    return parser.parse(xmlString);
}

export { XMLElement, XMLParser, parseXMLString }