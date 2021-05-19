"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeToType = exports.release = exports.master = exports.label = exports.sublabel = exports.artist = void 0;
function childrenToObject(children) {
    let obj = {};
    children.forEach(child => {
        if (child.tag !== undefined) {
            obj[child.tag] = child;
        }
    });
    return obj;
}
// Map over all children of a given XMLNode
function mapChildren(node, mapFn) {
    return (node?.children || []).map(mapFn);
}
function mapFnText(node) {
    return node.text;
}
function image(node) {
    return {
        type: node.attrs.type || '',
        uri: node.attrs.uri || '',
        uri150: node.attrs.uri150 || '',
        width: node.attrs.width || '',
        height: node.attrs.height || ''
    };
}
function entity(fields, id, type) {
    if (typeof id === 'undefined') {
        throw new Error('An id is required for type: ' + type);
    }
    return {
        id,
        type,
        data_quality: fields.data_quality?.text || '',
        images: mapChildren(fields.images, image)
    };
}
function video(node) {
    const fields = childrenToObject(node.children);
    return {
        src: node.attrs.src || '',
        duration: node.attrs.duration || '',
        embed: node.attrs.embed || '',
        title: fields.title?.text || '',
        description: fields.description?.text || '',
    };
}
function releaseArtist(node) {
    const fields = childrenToObject(node.children);
    return {
        id: fields.id?.text || "",
        name: fields.name?.text || "",
        anv: fields.anv?.text || "",
        role: fields.role?.text || "",
        // todo: verify that these 2 fields actually exist, and are of type text
        join: fields.join?.text || "",
        tracks: fields.tracks?.text || ""
    };
}
function baseRelease(fields) {
    // console.log(fields.videos?.attrs)
    return {
        notes: fields.notes?.text || '',
        title: fields.title?.text || '',
        artists: mapChildren(fields.artists, releaseArtist),
        genres: mapChildren(fields.genres, mapFnText),
        styles: mapChildren(fields.styles, mapFnText),
        videos: mapChildren(fields.videos, video),
    };
}
function contact(fields) {
    return {
        name: fields.name?.text || '',
        profile: fields.profile?.text || '',
        urls: mapChildren(fields.urls, mapFnText)
    };
}
function artist(node) {
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
    };
}
exports.artist = artist;
function sublabel(node) {
    return {
        id: node.attrs.id || '',
        name: node.text || ''
    };
}
exports.sublabel = sublabel;
function label(node) {
    const fields = childrenToObject(node.children);
    return {
        ...entity(fields, fields.id?.text, 'label'),
        ...contact(fields),
        contactinfo: fields.contactinfo?.text || '',
        // parse from attributes
        parentLabelId: fields.parentLabel?.attrs.id || '',
        parentLabelName: fields.parentLabel?.text || '',
        sublabels: mapChildren(fields.sublabels, sublabel)
    };
}
exports.label = label;
function master(node) {
    const fields = childrenToObject(node.children);
    return {
        ...entity(fields, node.attrs.id, 'artist'),
        ...baseRelease(fields),
        main_release: fields.main_release?.text || '',
        year: fields.year?.text || '',
    };
}
exports.master = master;
function company(node) {
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
function format(node) {
    const fields = childrenToObject(node.children);
    return {
        name: node.attrs.name || '',
        qty: node.attrs.qty || '',
        text: node.attrs.text || '',
        descriptions: (fields.descriptions?.children || []).map(desc => desc.text || '')
    };
}
;
function identifier(node) {
    return {
        type: node.attrs.type || '',
        description: node.attrs.description || '',
        value: node.attrs.value || ''
    };
}
function releaseLabel(node) {
    const fields = childrenToObject(node.children);
    return {
        id: node.attrs.id || '',
        name: node.attrs.name || '',
        catno: node.attrs.catno || '',
    };
}
function tracklist(node) {
    const fields = childrenToObject(node.children);
    return {
        position: fields.position?.text || '',
        title: fields.title?.text || '',
        duration: fields.duration?.text || '',
        artists: mapChildren(fields.artists, releaseArtist),
        extraartists: mapChildren(fields.extraartists, releaseArtist)
    };
}
function release(node) {
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
    };
}
exports.release = release;
function nodeToType(node) {
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
            throw new Error('Failed to parse type!');
    }
}
exports.nodeToType = nodeToType;
//# sourceMappingURL=Model.js.map