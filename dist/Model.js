"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeToType = exports.newLabel = exports.newArtist = exports.newRelease = exports.newMaster = void 0;
function childrenToObject(children) {
    let obj = {};
    children.forEach((child) => {
        if (child.tag !== undefined) {
            obj[child.tag] = child;
        }
    });
    return obj;
}
// Map over all children of a given XMLNode
function mapChildren(node, mapFn) {
    return (node?.children || []).map((node) => mapFn(node, childrenToObject(node.children)));
}
// Models
function newImage(node) {
    return {
        type: node.attrs.type || "",
        uri: node.attrs.uri || "",
        uri150: node.attrs.uri150 || "",
        width: node.attrs.width || "",
        height: node.attrs.height || "",
    };
}
function newReleaseArtist(node) {
    const fields = childrenToObject(node.children);
    if (!fields.id?.text) {
        throw new Error("Id is missing!");
    }
    return {
        id: fields.id.text,
        name: fields.name?.text || "",
        anv: fields.anv?.text || "",
        role: fields.role?.text || "",
        // todo: verify that these 2 fields actually exist, and are of type text
        join: fields.join?.text || "",
        tracks: fields.tracks?.text || "",
    };
}
function newBaseRelease(fields) {
    return {
        dataQuality: fields.data_quality?.text || "",
        images: mapChildren(fields.images, newImage),
        notes: fields.notes?.text || "",
        title: fields.title?.text || "",
        artists: mapChildren(fields.artists, newReleaseArtist),
        genres: mapChildren(fields.genres, (node) => node.text),
        styles: mapChildren(fields.styles, (node) => node.text),
        videos: mapChildren(fields.videos, (node, fields) => ({
            src: node.attrs.src || "",
            duration: node.attrs.duration || "",
            embed: node.attrs.embed || "",
            title: fields.title?.text || "",
            description: fields.description?.text || "",
        })),
    };
}
function newMaster(node) {
    const fields = childrenToObject(node.children);
    return {
        id: node.attrs.id || "",
        type: "master",
        main_release: fields.main_release?.text || "",
        year: fields.year?.text || "",
        ...newBaseRelease(fields),
    };
}
exports.newMaster = newMaster;
function newRelease(node) {
    const fields = childrenToObject(node.children);
    if (!node.attrs.id) {
        throw new Error("Id is missing!");
    }
    return {
        id: node.attrs.id || "",
        type: "release",
        country: fields.country?.text || "",
        masterId: fields.master_id?.text || "",
        released: fields.released?.text || "",
        ...newBaseRelease(fields),
        companies: mapChildren(fields.companies, (node, fields) => ({
            id: fields.id?.text || "",
            name: fields.name?.text || "",
            catno: fields.catno?.text || "",
            entity_type: fields.entity_type?.text || "",
            entity_type_name: fields.entity_type_name?.text || "",
            resource_url: fields.resource_url?.text || "",
        })),
        extraartists: mapChildren(fields.extraartists, newReleaseArtist),
        formats: mapChildren(fields.formats, (node, fields) => ({
            name: node.attrs.name || "",
            qty: node.attrs.qty || "",
            text: node.attrs.text || "",
            descriptions: (fields.descriptions?.children || []).map((desc) => desc.text || ""),
        })),
        identifiers: mapChildren(fields.identifiers, (node) => ({
            type: node.attrs.type || "",
            description: node.attrs.description || "",
            value: node.attrs.value || "",
        })),
        labels: mapChildren(fields.labels, (node) => ({
            id: node.attrs.id || "",
            name: node.attrs.name || "",
            catno: node.attrs.catno || "",
        })),
        tracklist: mapChildren(fields.tracklist, (node, fields) => ({
            position: fields.position?.text || "",
            title: fields.title?.text || "",
            duration: fields.duration?.text || "",
            artists: mapChildren(fields.artists, newReleaseArtist),
            extraartists: mapChildren(fields.extraartists, newReleaseArtist),
        })),
    };
}
exports.newRelease = newRelease;
function newArtist(node) {
    const fields = childrenToObject(node.children);
    if (!fields.id?.text) {
        throw new Error("Id is missing!");
    }
    return {
        id: fields.id.text,
        type: "artist",
        dataQuality: fields.data_quality?.text || "",
        images: mapChildren(fields.images, newImage),
        name: fields.name?.text || "",
        profile: fields.profile?.text || "",
        urls: mapChildren(fields.urls, (node) => node.text),
        aliases: (fields.aliases?.children || []).map((n) => n.text),
        groups: (fields.groups?.children || []).map((n) => n.text),
        // todo: this is a weird mixed array... figure out how to implement it
        // members: fields.members?.children || [],
        namevariations: (fields.namevariations?.children || []).map((n) => n.text),
        realname: fields.realname?.text || "",
    };
}
exports.newArtist = newArtist;
function newLabel(node) {
    const fields = childrenToObject(node.children);
    if (!fields.id?.text) {
        throw new Error("Id is missing!");
    }
    return {
        id: fields.id.text,
        type: "label",
        dataQuality: fields.data_quality?.text || "",
        images: mapChildren(fields.images, newImage),
        name: fields.name?.text || "",
        profile: fields.profile?.text || "",
        urls: mapChildren(fields.urls, (node) => node.text),
        contactinfo: fields.contactinfo?.text || "",
        parentLabelId: fields.parentLabel?.attrs.id || "",
        parentLabelName: fields.parentLabel?.text || "",
        sublabels: mapChildren(fields.sublabels, (node) => ({
            id: node.attrs.id || "",
            name: node.text || "",
        })),
    };
}
exports.newLabel = newLabel;
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
            throw new Error("Failed to parse type!");
    }
}
exports.nodeToType = nodeToType;
//# sourceMappingURL=Model.js.map