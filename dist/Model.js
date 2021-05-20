"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeToType = exports.newRelease = exports.newMaster = exports.newLabel = exports.sublabel = exports.newArtist = void 0;
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
function newString(node) {
    return node.text;
}
function newImage(node) {
    return {
        type: node.attrs.type || '',
        uri: node.attrs.uri || '',
        uri150: node.attrs.uri150 || '',
        width: node.attrs.width || '',
        height: node.attrs.height || ''
    };
}
function newEntity(fields, id, type) {
    if (typeof id === 'undefined') {
        throw new Error('An id is required for type: ' + type);
    }
    return {
        id,
        type,
        data_quality: fields.data_quality?.text || '',
        images: mapChildren(fields.images, newImage)
    };
}
function newVideo(node) {
    const fields = childrenToObject(node.children);
    return {
        src: node.attrs.src || '',
        duration: node.attrs.duration || '',
        embed: node.attrs.embed || '',
        title: fields.title?.text || '',
        description: fields.description?.text || '',
    };
}
function newReleaseArtist(node) {
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
function newBaseRelease(fields) {
    // console.log(fields.videos?.attrs)
    return {
        notes: fields.notes?.text || '',
        title: fields.title?.text || '',
        artists: mapChildren(fields.artists, newReleaseArtist),
        genres: mapChildren(fields.genres, newString),
        styles: mapChildren(fields.styles, newString),
        videos: mapChildren(fields.videos, newVideo),
    };
}
function newContact(fields) {
    return {
        name: fields.name?.text || '',
        profile: fields.profile?.text || '',
        urls: mapChildren(fields.urls, newString)
    };
}
function newArtist(node) {
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
    };
}
exports.newArtist = newArtist;
function sublabel(node) {
    return {
        id: node.attrs.id || '',
        name: node.text || ''
    };
}
exports.sublabel = sublabel;
function newLabel(node) {
    const fields = childrenToObject(node.children);
    return {
        ...newEntity(fields, fields.id?.text, 'label'),
        ...newContact(fields),
        contactinfo: fields.contactinfo?.text || '',
        // parse from attributes
        parentLabelId: fields.parentLabel?.attrs.id || '',
        parentLabelName: fields.parentLabel?.text || '',
        sublabels: mapChildren(fields.sublabels, sublabel)
    };
}
exports.newLabel = newLabel;
function newMaster(node) {
    const fields = childrenToObject(node.children);
    return {
        ...newEntity(fields, node.attrs.id, 'master'),
        ...newBaseRelease(fields),
        main_release: fields.main_release?.text || '',
        year: fields.year?.text || '',
    };
}
exports.newMaster = newMaster;
function newReleaseCompany(node) {
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
function newReleaseFormat(node) {
    const fields = childrenToObject(node.children);
    return {
        name: node.attrs.name || '',
        qty: node.attrs.qty || '',
        text: node.attrs.text || '',
        descriptions: (fields.descriptions?.children || []).map(desc => desc.text || '')
    };
}
;
function newReleaseIdentifier(node) {
    return {
        type: node.attrs.type || '',
        description: node.attrs.description || '',
        value: node.attrs.value || ''
    };
}
function newReleaseLabel(node) {
    const fields = childrenToObject(node.children);
    return {
        id: node.attrs.id || '',
        name: node.attrs.name || '',
        catno: node.attrs.catno || '',
    };
}
function newReleaseTracklist(node) {
    const fields = childrenToObject(node.children);
    return {
        position: fields.position?.text || '',
        title: fields.title?.text || '',
        duration: fields.duration?.text || '',
        artists: mapChildren(fields.artists, newReleaseArtist),
        extraartists: mapChildren(fields.extraartists, newReleaseArtist)
    };
}
function newRelease(node) {
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
    };
}
exports.newRelease = newRelease;
function nodeToType(node) {
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
            throw new Error('Failed to parse type!');
    }
}
exports.nodeToType = nodeToType;
//# sourceMappingURL=Model.js.map