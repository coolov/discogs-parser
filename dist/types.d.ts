export interface Image {
    type: string;
    uri: string;
    uri150: string;
    width: string;
    height: string;
}
export interface ReleaseArtist {
    artistId: number;
    artistName: string;
    anv: string;
    role: string;
    connect: string;
    tracks: string;
}
export interface BaseRelease {
    dataQuality: string;
    notes: string;
    title: string;
    images: Image[];
    artists: ReleaseArtist[];
    genres: string[];
    styles: string[];
    videos: {
        src: string;
        duration: number | null;
        embed: boolean;
        title: string;
        description: string;
    }[];
}
export interface Master extends BaseRelease {
    id: number;
    type: string;
    mainReleaseId: number | null;
    year: string;
}
export interface Release extends BaseRelease {
    id: number;
    type: string;
    dataQuality: string;
    country: string;
    masterId: number | null;
    released: string;
    images: Image[];
    extraArtists: ReleaseArtist[];
    companies: {
        companyId: string;
        name: string;
        catNo: string;
        entityType: string;
        entityTypeName: string;
        resourceUrl: string;
    }[];
    formats: {
        name: string;
        qty: string;
        text: string;
        descriptions: string[];
    }[];
    identifiers: {
        type: string;
        description: string;
        value: string;
    }[];
    labels: {
        labelId: number | null;
        labelName: string;
        catNo: string;
    }[];
    tracklist: {
        position: string;
        title: string;
        duration: string;
        artists: ReleaseArtist[];
        extraArtists: ReleaseArtist[];
    }[];
}
export interface Artist {
    id: number;
    type: string;
    dataQuality: string;
    name: string;
    profile: string;
    realName: string;
    images: Image[];
    urls: string[];
    aliases: string[];
    groups: string[];
    nameVariations: string[];
}
export interface Label {
    id: number;
    type: string;
    dataQuality: string;
    name: string;
    profile: string;
    contactInfo: string;
    parentLabelId: number | null;
    parentLabelName: string;
    images: Image[];
    urls: string[];
    sublabels: {
        labelId: number;
        labelName: string;
    }[];
}
export declare type DiscogsItem = Release | Master | Artist | Label;
