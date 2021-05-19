import { XmlNode } from './XMLParser';
interface Image {
    type: string;
    uri: string;
    uri150: string;
    width: string;
    height: string;
}
interface Entity {
    id: string;
    type: string;
    data_quality: string;
    images: Image[];
}
interface Video {
    src: string;
    duration: string;
    embed: string;
    title: string;
    description: string;
}
interface ReleaseArtist {
    id: string;
    name: string;
    anv: string;
    role: string;
    join: string;
    tracks: string;
}
interface BaseRelease {
    notes: string;
    title: string;
    artists: ReleaseArtist[];
    genres: string[];
    styles: string[];
    videos: Video[];
}
interface Contact {
    name: string;
    profile: string;
    urls: string[];
}
export interface Artist extends Entity, Contact {
    aliases: string[];
    groups: string[];
    namevariations: string[];
    realname: string;
}
export declare function newArtist(node: XmlNode): Artist;
interface Sublabel {
    id: string;
    name: string;
}
export declare function sublabel(node: XmlNode): Sublabel;
export interface Label extends Entity, Contact {
    contactinfo: string;
    parentLabelId: string;
    parentLabelName: string;
    sublabels: Sublabel[];
}
export declare function newLabel(node: XmlNode): Label;
export interface Master extends Entity, BaseRelease {
    main_release: string;
    year: string;
}
export declare function newMaster(node: XmlNode): Master;
interface ReleaseCompany {
    id: string;
    name: string;
    catno: string;
    entity_type: string;
    entity_type_name: string;
    resource_url: string;
}
interface ReleaseFormat {
    name: string;
    qty: string;
    text: string;
    descriptions: string[];
}
interface ReleaseIdentifier {
    type: string;
    description: string;
    value: string;
}
interface ReleaseLabel {
    id: string;
    name: string;
    catno: string;
}
interface ReleaseTracklist {
    position: string;
    title: string;
    duration: string;
    artists: ReleaseArtist[];
    extraartists: ReleaseArtist[];
}
export interface Release extends Entity, BaseRelease {
    country: string;
    master_id: string;
    released: string;
    companies: ReleaseCompany[];
    extraartists: ReleaseArtist[];
    formats: ReleaseFormat[];
    identifiers: ReleaseIdentifier[];
    labels: ReleaseLabel[];
    tracklist: ReleaseTracklist[];
}
export declare function newRelease(node: XmlNode): Release;
export declare type Record = Release | Master | Artist | Label;
export declare function nodeToType(node: XmlNode): Record;
export {};
