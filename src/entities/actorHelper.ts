import { Actor, ActorType } from "./actor";
import { NameHelper, md5 } from '@textactor/domain';
import { generate as generateNewId } from 'shortid';
import { ActorName } from ".";

export type KnownActorData = {
    lang: string
    country: string
    name: string
    abbr?: string
    type?: ActorType
    wikiEntity?: {
        wikiDataId: string,
        name: string,
        wikiPageTitle?: string,
        // countryCode?: string,
        description?: string,
    }
    names: { name: string, abbr?: string }[]
    context?: string
}

export class ActorHelper {

    static newId(): string {
        return generateNewId();
    }
    static build(knownData: KnownActorData): Actor {
        const id = ActorHelper.newId();
        const lang = knownData.lang.trim().toLowerCase();
        const country = knownData.country.trim().toLowerCase();
        let abbr = knownData.abbr;
        const name = NameHelper.standardText(buildActorName(knownData.name, knownData.wikiEntity && knownData.wikiEntity.wikiPageTitle), lang);

        if (!abbr && !NameHelper.isAbbr(name)) {
            const abbrs = knownData.names.map(item => item.abbr || NameHelper.isAbbr(item.name) && item.name || null)
                .filter(name => ActorHelper.isValidName(name, lang));
            if (abbrs.length) {
                abbr = NameHelper.findAbbr(abbrs);
            }
        }

        const actor: Actor = {
            id,
            lang,
            country,
            type: knownData.type,
            name,
            abbr,
        };
        if (knownData.wikiEntity) {
            if (knownData.wikiEntity.description) {
                actor.description = knownData.wikiEntity.description;
            }
            actor.wikiDataId = knownData.wikiEntity.wikiDataId;
            actor.wikiPageTitle = knownData.wikiEntity.wikiPageTitle;

            if (actor.wikiPageTitle === actor.name) {
                delete actor.wikiPageTitle;
            }
        }

        return actor;
    }

    public static isValidName(name: string, lang: string) {
        if (!name) {
            return false;
        }
        const normalName = NameHelper.normalizeName(name, lang);
        return name.length === name.trim().length && name.length > 1 && name.length <= 200
            && normalName.length > 1 && normalName.length <= 200;
    }

    public static nameHash(name: string, lang: string) {
        name = NameHelper.formatUniqueName(name, lang);

        return md5(name);
    }

    public static createNameId(name: string, lang: string, country: string) {
        lang = lang.trim().toLowerCase();
        country = country.trim().toLowerCase();

        const hash = ActorHelper.nameHash(name, lang);

        return [lang, country, hash].join('');
    }

    static createActorNames(names: string[], lang: string, country: string, actorId: string): ActorName[] {
        const actorNames = names.filter(name => ActorHelper.isValidName(name, lang))
            .map(name => ({ name, lang, country, actorId, id: ActorHelper.createNameId(name, lang, country) }));

        return actorNames;
    }
}

function buildActorName(name: string, wikiPageTitle?: string): string {
    if (wikiPageTitle) {
        if (name.length >= wikiPageTitle.length) {
            name = wikiPageTitle;
        }
    }

    return formatShortName(name);
}

function formatShortName(name: string) {
    if (~name.indexOf(')')) {
        const shortName = name.substr(0, name.indexOf('(')).trim();
        if (NameHelper.countWords(shortName) > 1) {
            return shortName;
        }
    }
    return name;
}
