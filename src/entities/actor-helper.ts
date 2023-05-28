import { Actor, ActorType } from "./actor";
import { NameHelper, md5, uniqByProperty } from "@textactor/domain";
import { generate as generateNewId } from "shortid";
import { ActorNameType, ActorName } from "./actor-name";

export type BuildActorParams = {
  lang: string;
  country: string;
  name: string;
  abbr?: string;
  type?: ActorType;
  commonName?: string;
  englishName?: string;
  wikiEntity: {
    wikiDataId: string;
    name: string;
    wikiPageTitle: string;
    description?: string;
    countLinks: number;
    countryCodes: string[];
  };
  names: BuildActorNameParams[];
  context?: string;
};

export type BuildActorNameParams = {
  name: string;
  type: ActorNameType;
  popularity: number;
};

export class ActorHelper {
  static newId(): string {
    return generateNewId();
  }

  static build(params: BuildActorParams): Actor {
    const id = ActorHelper.newId();
    const lang = params.lang.trim().toLowerCase();
    const country = params.country.trim().toLowerCase();
    let abbr = params.abbr;
    const name = params.name;

    const actor: Actor = {
      id,
      lang,
      country,
      type: params.type,
      name,
      abbr,
      wikiDataId: params.wikiEntity.wikiDataId,
      wikiPageTitle: params.wikiEntity.wikiPageTitle,
      wikiCountLinks: params.wikiEntity.countLinks
    };

    if (params.wikiEntity) {
      if (params.wikiEntity.description) {
        actor.description = params.wikiEntity.description;
        if (actor.description.length > 100) {
          actor.description = actor.description.substr(0, 100).trim();
        }
      }

      if (actor.wikiPageTitle === actor.name) {
        delete actor.wikiPageTitle;
      }
    }

    if (params.englishName) {
      actor.englishName = params.englishName;
    }

    if (params.commonName) {
      actor.commonName = params.commonName;
    }

    if (actor.name === actor.commonName) {
      delete actor.commonName;
    }

    return actor;
  }

  public static isValidName(name: string, lang: string) {
    if (!name) {
      return false;
    }
    const normalName = NameHelper.normalizeName(name, lang);
    return (
      name.length === name.trim().length &&
      name.length > 1 &&
      name.length <= 200 &&
      normalName.length > 1 &&
      normalName.length <= 200
    );
  }

  public static nameHash(name: string, lang: string) {
    name = NameHelper.formatUniqueName(name, lang);

    return md5(name);
  }

  public static createNameId(name: string, lang: string, country: string) {
    lang = lang.trim().toLowerCase();
    country = country.trim().toLowerCase();

    const hash = ActorHelper.nameHash(name, lang);

    return [lang, country, hash].join("");
  }

  static createActorNames(
    names: BuildActorNameParams[],
    lang: string,
    country: string,
    actorId: string
  ): ActorName[] {
    const actorNames = names
      .filter((item) => ActorHelper.isValidName(item.name, lang))
      .map<ActorName>((item) => ({
        type: item.type,
        name: item.name,
        lang,
        country,
        actorId,
        id: ActorHelper.createNameId(item.name, lang, country),
        countWords: NameHelper.countWords(item.name)
      }));

    return uniqByProperty(actorNames, "id");
  }

  static sortActorNames(names: ActorName[]) {
    return names.sort((a, b) => getNameOrder(a) - getNameOrder(b));
  }
}

function getNameOrder(name: ActorName) {
  return name.type === ActorNameType.WIKI ? 0 : 1;
}
