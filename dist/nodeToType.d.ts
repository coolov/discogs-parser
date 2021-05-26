import { XmlNode } from "./XMLParser";
import { Artist, Label, Release, Master, DiscogsItem } from "./types";
export declare function newMaster(node: XmlNode): Master;
export declare function newRelease(node: XmlNode): Release;
export declare function newArtist(node: XmlNode): Artist;
export declare function newLabel(node: XmlNode): Label;
export declare function nodeToType(node: XmlNode): DiscogsItem;
