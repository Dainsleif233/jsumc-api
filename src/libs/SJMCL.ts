interface SJMCLResponse {
    next?: number;
    posts?: SJMCLPost[];
    sourceInfo: SJMCLSourceInfo;
}

interface SJMCLPost {
    abstract: string;
    createAt: string;
    id: number;
    imageSrc?: [string, number, number];
    keywords: string;
    link: string;
    source: SJMCLSourceInfo;
    title: string;
    updateAt: string;
}

interface SJMCLSourceInfo {
    endpointUrl: string;
    fullName: string;
    iconSrc?: string;
    name: string;
}

export { SJMCLResponse, SJMCLPost, SJMCLSourceInfo }