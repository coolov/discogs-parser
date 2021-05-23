export interface Image {
  type: string;
  uri: string;
  uri150: string;
  width: string;
  height: string;
}

export interface ReleaseArtist {
  id: string;
  name: string;
  anv: string;
  role: string;
  join: string;
  tracks: string;
}

export interface BaseRelease {
  data_quality: string;
  images: Image[];
  notes: string;
  title: string;
  artists: ReleaseArtist[];
  genres: string[];
  styles: string[];
  videos: {
    src: string;
    duration: string;
    embed: string;
    title: string;
    description: string;
  }[];
}

export interface Master extends BaseRelease {
  id: string;
  type: string;
  main_release: string;
  year: string;
}

export interface Release extends BaseRelease {
  id: string;
  type: string;
  data_quality: string;
  images: Image[];
  country: string;
  master_id: string;
  released: string;
  extraartists: ReleaseArtist[];
  companies: {
    id: string;
    name: string;
    catno: string;
    entity_type: string;
    entity_type_name: string;
    resource_url: string;
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
    id: string;
    name: string;
    catno: string;
  }[];
  tracklist: {
    position: string;
    title: string;
    duration: string;
    artists: ReleaseArtist[];
    extraartists: ReleaseArtist[];
  }[];
}

export interface Artist {
  id: string;
  type: string;
  data_quality: string;
  images: Image[];
  name: string;
  profile: string;
  urls: string[];
  aliases: string[];
  groups: string[];
  // members: XmlNode[],
  namevariations: string[];
  realname: string;
}

export interface Label {
  id: string;
  type: string;
  data_quality: string;
  images: Image[];
  name: string;
  profile: string;
  urls: string[];
  contactinfo: string;
  parentLabelId: string;
  parentLabelName: string;
  sublabels: {
    id: string;
    name: string;
  }[];
}

export type Record = Release | Master | Artist | Label;
