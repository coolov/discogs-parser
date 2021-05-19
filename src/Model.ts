
import { ADDRGETNETWORKPARAMS } from 'dns';
import { XmlNode } from './XMLParser'

// ---- UTILS ----

interface XMLNodeMap {
    [index: string]: XmlNode | undefined;
}

function childrenToObject(children: XmlNode[]): XMLNodeMap {
    let obj: XMLNodeMap = {};
    children.forEach(child => {
        if (child.tag !== undefined) {
            obj[child.tag] = child;
        }
    });
    return obj;
}

// Map over all children of a given XMLNode
function mapChildren<T>(node: XmlNode | undefined, mapFn: (childNode: XmlNode) => T): T[] {
    return (node?.children || []).map(mapFn);
}

function mapFnText(node: XmlNode): string {
    return node.text;
}

// ---- ENTITY ----

interface Image {
    type: string,
    uri: string,
    uri150: string,
    width: string,
    height: string
}

function image(node: XmlNode): Image {
    return {
        type: node.attrs.type || '',
        uri: node.attrs.uri || '',
        uri150: node.attrs.uri150 || '',
        width: node.attrs.width || '',
        height: node.attrs.height || ''
    };
}


interface Entity {
    id: string,
    type: string,
    data_quality: string,
    images: Image[]
}

function entity(fields: XMLNodeMap, id: string | undefined, type: string): Entity {
    if (typeof id === 'undefined') {
        throw new Error('An id is required for type: ' + type);
    }

    return {
        id,
        type,
        data_quality: fields.data_quality?.text || '',
        images: mapChildren(fields.images, image)
    }
}

// ---- BASE RELEASE ----

interface Video {
    src: string,
    duration: string,
    embed: string,
    title: string,
    description: string
}

function video(node: XmlNode): Video {
    const fields = childrenToObject(node.children);
    return {
        src: node.attrs.src || '',
        duration: node.attrs.duration || '',
        embed: node.attrs.embed || '',
        title: fields.title?.text || '',
        description: fields.description?.text || '',
    }
}
interface ReleaseArtist {
    id: string,
    name: string,
    anv: string,
    role: string,
    join: string,
    tracks: string
}

function releaseArtist(node: XmlNode): ReleaseArtist {
    const fields = childrenToObject(node.children);
    return {
        id: fields.id?.text || "",
        name: fields.name?.text || "",
        anv: fields.anv?.text || "",
        role: fields.role?.text || "",

        // todo: verify that these 2 fields actually exist, and are of type text
        join: fields.join?.text || "",
        tracks: fields.tracks?.text || ""
    }
}


interface BaseRelease {
    notes: string,
    title: string,
    artists: ReleaseArtist[],
    genres: string[],
    styles: string[],
    videos: Video[],
}

function baseRelease(fields: XMLNodeMap): BaseRelease {
    // console.log(fields.videos?.attrs)
    return {
        notes: fields.notes?.text || '',
        title: fields.title?.text || '',
        artists: mapChildren(fields.artists, releaseArtist),
        genres: mapChildren(fields.genres, mapFnText),
        styles: mapChildren(fields.styles, mapFnText),
        videos: mapChildren(fields.videos, video),
    }
}


// ---- CONTACT ----

interface Contact {
    name: string,
    profile: string,
    urls: string[],
}

function contact(fields: XMLNodeMap): Contact {
    return {
        name: fields.name?.text || '',
        profile: fields.profile?.text || '',
        urls: mapChildren(fields.urls, mapFnText)
    }
}

// ---- ARTIST ----

export interface Artist extends Entity, Contact {
    aliases: string[],
    groups: string[],
    // members: XmlNode[],
    namevariations: string[],
    realname: string,
}

export function artist(node: XmlNode): Artist {
    const fields = childrenToObject(node.children);

    return {
        ...entity(fields, fields.id?.text, 'artist'),
        ...contact(fields),
        aliases: (fields.aliases?.children || []).map(n => n.text),
        groups: (fields.groups?.children || []).map(n => n.text),
        // todo: this is a weird mixed array... figure out how to implement it
        // members: fields.members?.children || [],
        namevariations: (fields.namevariations?.children || []).map(n => n.text),
        realname: fields.realname?.text || ''
    }
}

// ---- LABEL ----

interface Sublabel {
    id: string,
    name: string
}

export function sublabel(node: XmlNode): Sublabel {
    return {
        id: node.attrs.id || '',
        name: node.text || ''
    }
}

export interface Label extends Entity, Contact {
    contactinfo: string,

    // parse from attributes
    parentLabelId: string,
    parentLabelName: string,

    sublabels: Sublabel[],
}

export function label(node: XmlNode): Label {
    const fields = childrenToObject(node.children);

    return {
        ...entity(fields, fields.id?.text, 'label'),
        ...contact(fields),
        contactinfo: fields.contactinfo?.text || '',

        // parse from attributes
        parentLabelId: fields.parentLabel?.attrs.id || '',
        parentLabelName: fields.parentLabel?.text || '',

        sublabels: mapChildren(fields.sublabels, sublabel)
    }
}

// ---- MASTER ----

export interface Master extends Entity, BaseRelease {
    main_release: string,
    year: string,
}

export function master(node: XmlNode): Master {
    const fields = childrenToObject(node.children);
    return {
        ...entity(fields, node.attrs.id, 'artist'),
        ...baseRelease(fields),
        main_release: fields.main_release?.text || '',
        year: fields.year?.text || '',
    }
}

// ---- RELEASE ----

interface Company {
    id: string,
    name: string,
    catno: string,
    entity_type: string,
    entity_type_name: string,
    resource_url: string,
}

function company(node: XmlNode): Company {
    const fields = childrenToObject(node.children);
    return {
        id: fields.id?.text || '',
        name: fields.name?.text || '',
        catno: fields.catno?.text || '',
        entity_type: fields.entity_type?.text || '',
        entity_type_name: fields.entity_type_name?.text || '',
        resource_url: fields.resource_url?.text || '',
    };
}

interface Format {
    name: string,
    qty: string,
    text: string,
    descriptions: string[]
}

function format(node: XmlNode): Format {
    const fields = childrenToObject(node.children);
    return {
        name: node.attrs.name || '',
        qty: node.attrs.qty || '',
        text: node.attrs.text || '',
        descriptions: (fields.descriptions?.children || []).map(desc => desc.text || '')
    }
};

interface Identifier {
    type: string,
    description: string,
    value: string
}

function identifier(node: XmlNode): Identifier {
    return {
        type: node.attrs.type || '',
        description: node.attrs.description || '',
        value: node.attrs.value || ''
    };
}

interface ReleaseLabel {
    id: string,
    name: string,
    catno: string
}

function releaseLabel(node: XmlNode): ReleaseLabel {
    const fields = childrenToObject(node.children);
    return {
        id: node.attrs.id || '',
        name: node.attrs.name || '',
        catno: node.attrs.catno || '',
    };
}

interface Tracklist {
    position: string
    title: string
    duration: string
    artists: ReleaseArtist[]
    extraartists: ReleaseArtist[]
}

function tracklist(node: XmlNode): Tracklist {
    const fields = childrenToObject(node.children);
    return {
        position: fields.position?.text || '',
        title: fields.title?.text || '',
        duration: fields.duration?.text || '',
        artists: mapChildren(fields.artists, releaseArtist),
        extraartists: mapChildren(fields.extraartists, releaseArtist)
    };
}


export interface Release extends Entity, BaseRelease {
    country: string,
    master_id: string,
    released: string,

    companies: Company[],
    extraartists: ReleaseArtist[],
    formats: Format[],
    identifiers: Identifier[],
    labels: ReleaseLabel[],
    tracklist: Tracklist[]
}

export function release(node: XmlNode): Release {
    const fields = childrenToObject(node.children);
    return {
        ...entity(fields, '1', 'release'),
        ...baseRelease(fields),
        country: fields.country?.text || '',
        master_id: fields.master_id?.text || '',
        released: fields.released?.text || '',
        companies: mapChildren(fields.companies, company),
        extraartists: mapChildren(fields.extraartists, releaseArtist),
        formats: mapChildren(fields.formats, format),
        identifiers: mapChildren(fields.identifiers, identifier),
        labels: mapChildren(fields.labels, releaseLabel),
        tracklist: mapChildren(fields.tracklist, tracklist)
    }
}

export type Record = Release | Master | Artist | Label;

export function nodeToType(node: XmlNode): Record {
    switch (node.tag) {
        case "label":
            return label(node);
        case "release":
            return release(node);
        case "master":
            return master(node);
        case "artist":
            return artist(node);
        default:
            throw new Error('Failed to parse type!')
    }
}