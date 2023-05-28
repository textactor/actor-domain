export enum ActorType {
  EVENT = "EVENT",
  ORG = "ORG",
  PERSON = "PERSON",
  PLACE = "PLACE",
  PRODUCT = "PRODUCT",
  WORK = "WORK"
}

export type Actor = {
  id: string;
  name: string;
  lang: string;
  country: string;

  commonName?: string;
  englishName?: string;

  countryCodes?: string[];

  abbr?: string;

  type?: ActorType;
  wikiDataId: string;
  wikiPageTitle?: string;

  createdAt?: number;
  updatedAt?: number;

  description?: string;
  wikiCountLinks: number;
};

export const ACTOR_TYPE = {
  updateFields() {
    return [
      "name",
      "commonName",
      "englishName",
      "countryCodes",
      "abbr",
      "wikiPageTitle",
      "type",
      "description",
      "updatedAt",
      "wikiCountLinks"
    ];
  },
  deleteFields() {
    return [
      "commonName",
      "englishName",
      "abbr",
      "wikiPageTitle",
      "type",
      "description"
    ];
  }
};
