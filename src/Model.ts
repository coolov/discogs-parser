
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

function newString(node: XmlNode): string {
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

function newImage(node: XmlNode): Image {
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

function newEntity(fields: XMLNodeMap, id: string | undefined, type: string): Entity {
    if (typeof id === 'undefined') {
        throw new Error('An id is required for type: ' + type);
    }

    return {
        id,
        type,
        data_quality: fields.data_quality?.text || '',
        images: mapChildren(fields.images, newImage)
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

function newVideo(node: XmlNode): Video {
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

function newReleaseArtist(node: XmlNode): ReleaseArtist {
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

function newBaseRelease(fields: XMLNodeMap): BaseRelease {
    // console.log(fields.videos?.attrs)
    return {
        notes: fields.notes?.text || '',
        title: fields.title?.text || '',
        artists: mapChildren(fields.artists, newReleaseArtist),
        genres: mapChildren(fields.genres, newString),
        styles: mapChildren(fields.styles, newString),
        videos: mapChildren(fields.videos, newVideo),
    }
}


// ---- CONTACT ----

interface Contact {
    name: string,
    profile: string,
    urls: string[],
}

function newContact(fields: XMLNodeMap): Contact {
    return {
        name: fields.name?.text || '',
        profile: fields.profile?.text || '',
        urls: mapChildren(fields.urls, newString)
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

export function newArtist(node: XmlNode): Artist {
    const fields = childrenToObject(node.children);

    return {
        ...newEntity(fields, fields.id?.text, 'artist'),
        ...newContact(fields),
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

export function newLabel(node: XmlNode): Label {
    const fields = childrenToObject(node.children);

    return {
        ...newEntity(fields, fields.id?.text, 'label'),
        ...newContact(fields),
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

export function newMaster(node: XmlNode): Master {
    const fields = childrenToObject(node.children);
    return {
        ...newEntity(fields, node.attrs.id, 'master'),
        ...newBaseRelease(fields),
        main_release: fields.main_release?.text || '',
        year: fields.year?.text || '',
    }
}

// ---- RELEASE ----

interface ReleaseCompany {
    id: string,
    name: string,
    catno: string,
    entity_type: string,
    entity_type_name: string,
    resource_url: string,
}

function newReleaseCompany(node: XmlNode): ReleaseCompany {
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

interface ReleaseFormat {
    name: string,
    qty: string,
    text: string,
    descriptions: string[]
}

function newReleaseFormat(node: XmlNode): ReleaseFormat {
    const fields = childrenToObject(node.children);
    return {
        name: node.attrs.name || '',
        qty: node.attrs.qty || '',
        text: node.attrs.text || '',
        descriptions: (fields.descriptions?.children || []).map(desc => desc.text || '')
    }
};

interface ReleaseIdentifier {
    type: string,
    description: string,
    value: string
}

function newReleaseIdentifier(node: XmlNode): ReleaseIdentifier {
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

function newReleaseLabel(node: XmlNode): ReleaseLabel {
    const fields = childrenToObject(node.children);
    return {
        id: node.attrs.id || '',
        name: node.attrs.name || '',
        catno: node.attrs.catno || '',
    };
}

interface ReleaseTracklist {
    position: string
    title: string
    duration: string
    artists: ReleaseArtist[]
    extraartists: ReleaseArtist[]
}

function newReleaseTracklist(node: XmlNode): ReleaseTracklist {
    const fields = childrenToObject(node.children);
    return {
        position: fields.position?.text || '',
        title: fields.title?.text || '',
        duration: fields.duration?.text || '',
        artists: mapChildren(fields.artists, newReleaseArtist),
        extraartists: mapChildren(fields.extraartists, newReleaseArtist)
    };
}


export interface Release extends Entity, BaseRelease {
    country: string,
    master_id: string,
    released: string,

    companies: ReleaseCompany[],
    extraartists: ReleaseArtist[],
    formats: ReleaseFormat[],
    identifiers: ReleaseIdentifier[],
    labels: ReleaseLabel[],
    tracklist: ReleaseTracklist[]
}

export function newRelease(node: XmlNode): Release {
    const fields = childrenToObject(node.children);

    return {
        ...newEntity(fields, node.attrs.id, 'release'),
        ...newBaseRelease(fields),
        country: fields.country?.text || '',
        master_id: fields.master_id?.text || '',
        released: fields.released?.text || '',
        companies: mapChildren(fields.companies, newReleaseCompany),
        extraartists: mapChildren(fields.extraartists, newReleaseArtist),
        formats: mapChildren(fields.formats, newReleaseFormat),
        identifiers: mapChildren(fields.identifiers, newReleaseIdentifier),
        labels: mapChildren(fields.labels, newReleaseLabel),
        tracklist: mapChildren(fields.tracklist, newReleaseTracklist)
    }
}

export type Record = Release | Master | Artist | Label;

export function nodeToType(node: XmlNode): Record {
    switch (node.tag) {
        case "label":
            return newLabel(node);
        case "release":
            return newRelease(node);
        case "master":
            return newMaster(node);
        case "artist":
            return newArtist(node);
        default:
            throw new Error('Failed to parse type!')
    }
}