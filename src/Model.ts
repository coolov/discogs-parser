import { XmlNode } from "./XMLParser";
import {
  Artist,
  Label,
  Release,
  Master,
  Record,
  Image,
  ReleaseArtist,
  BaseRelease,
} from "./types";

// ---- UTILS ----

interface XMLNodeMap {
  [index: string]: XmlNode | undefined;
}

function childrenToObject(children: XmlNode[]): XMLNodeMap {
  let obj: XMLNodeMap = {};
  children.forEach((child) => {
    if (child.tag !== undefined) {
      obj[child.tag] = child;
    }
  });
  return obj;
}

// Map over all children of a given XMLNode
function mapChildren<T>(
  node: XmlNode | undefined,
  mapFn: (childNode: XmlNode, nodeMap: XMLNodeMap) => T
): T[] {
  return (node?.children || []).map((node) =>
    mapFn(node, childrenToObject(node.children))
  );
}

// Models

function newImage(node: XmlNode): Image {
  return {
    type: node.attrs.type || "",
    uri: node.attrs.uri || "",
    uri150: node.attrs.uri150 || "",
    width: node.attrs.width || "",
    height: node.attrs.height || "",
  };
}

function newReleaseArtist(node: XmlNode): ReleaseArtist {
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

function newBaseRelease(fields: XMLNodeMap): BaseRelease {
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

export function newMaster(node: XmlNode): Master {
  const fields = childrenToObject(node.children);
  return {
    id: node.attrs.id || "", // todo: fail if missing
    type: "master",
    main_release: fields.main_release?.text || "",
    year: fields.year?.text || "",
    ...newBaseRelease(fields),
  };
}

export function newRelease(node: XmlNode): Release {
  const fields = childrenToObject(node.children);
  if (!node.attrs.id) {
    throw new Error("Id is missing!");
  }
  return {
    id: node.attrs.id || "", // todo: fail if missing
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
      descriptions: (fields.descriptions?.children || []).map(
        (desc) => desc.text || ""
      ),
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

export function newArtist(node: XmlNode): Artist {
  const fields = childrenToObject(node.children);
  if (!fields.id?.text) {
    throw new Error("Id is missing!");
  }
  return {
    id: fields.id.text, // todo, fail if missing!
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

export function newLabel(node: XmlNode): Label {
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
      throw new Error("Failed to parse type!");
  }
}
