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
  join: string;
  tracks: string;
}

export interface BaseRelease {
  dataQuality: string;
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
  id: number;
  type: string;
  mainReleaseId: number | null;
  year: string;
}

export interface Release extends BaseRelease {
  id: number;
  type: string;
  dataQuality: string;
  images: Image[];
  country: string;
  masterId: number | null;
  released: string;
  extraArtists: ReleaseArtist[];
  companies: {
    id: string;
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
    labelId: string;
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
  images: Image[];
  name: string;
  profile: string;
  urls: string[];
  aliases: string[];
  groups: string[];
  // members: XmlNode[],
  nameVariations: string[];
  realName: string;
}

export interface Label {
  id: number;
  type: string;
  dataQuality: string;
  images: Image[];
  name: string;
  profile: string;
  urls: string[];
  contactInfo: string;
  parentLabelId: number | null;
  parentLabelName: string;
  sublabels: {
    labelId: number;
    labelName: string;
  }[];
}

export type Record = Release | Master | Artist | Label;
