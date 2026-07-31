export type SectionSettings = Record<string, boolean>;

export interface Socials {
  instagram: string;
  x: string;
  facebook: string;
}

export interface Ceremony {
  time: string;
  venue: string;
  location: string;
  mapCoords?: { latitude: string; longitude: string };
}

export interface Reception {
  time: string;
  venue: string;
  location: string;
  mapCoords?: { latitude: string; longitude: string };
}

export interface MapLocation {
  address: string;
  city: string;
  region: string;
  mapUrl: string;
}

export interface Events {
  ceremony: Ceremony;
  reception: Reception;
  mapLocation: MapLocation;
  menuImage: string;
}

export interface Entourage {
  parents: string;
  sponsors: string;
  maidOfHonor: string;
  bestMan: string;
}

export interface Footer {
  date: string;
  tagline: string;
  socials: Socials;
  image: string;
  text: string;
}

export interface Couple {
  name1: string;
  name2: string;
  hashtag: string;
}

export interface Hero {
  subtitle: string;
  date: string;
  location: string;
  image: string;
}

export interface SaveTheDate {
  heading: string;
  quote: string;
}

export interface Countdown {
  targetDate: string;
  heading: string;
}

export interface Story {
  heading: string;
  paragraph1: string;
  paragraph2: string;
  image: string;
}

export interface Gallery {
  enabled: boolean;
  images: string[];
}

export interface Quote {
  text: string;
  author: string;
}

export interface Rsvp {
  heading: string;
  deadline: string;
  whatsapp: string;
}

export interface InvitationCard {
  image: string;
}

export interface TimelineItem {
  event: string;
  description: string;
  time: string;
  icon: string;
}

export interface WebsiteContent {
  couple: Couple;
  hero: Hero;
  saveTheDate: SaveTheDate;
  countdown: Countdown;
  story: Story;
  events: Events;
  gallery: Gallery;
  quote: Quote;
  rsvp: Rsvp;
  entourage: Entourage;
  footer: Footer;
  invitationCard: InvitationCard;
  timeline: TimelineItem[];
  frontNames?: string;
  endNames?: string;
}
