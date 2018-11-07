import { Actor, ActorType } from "./actor";
import { NameHelper, md5, uniqByProp } from '@textactor/domain';
import { generate as generateNewId } from 'shortid';
import { ActorNameType, ActorName } from "./actorName";

export type KnownActorData = {
    lang: string
    country: string
    name: string
    abbr?: string
    type?: ActorType
    commonName?: string
    englishName?: string
    wikiEntity: {
        wikiDataId: string
        name: string
        wikiPageTitle: string
        description?: string
        countLinks: number
        countryCodes: string[]
    }
    names: KnownActorName[]
    context?: string
}

export type KnownActorName = {
    name: string
    type: ActorNameType
    popularity: number
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
        const name = knownData.name;

        // if (!abbr && !NameHelper.isAbbr(name)) {
        //     const abbrs = knownData.names.map(item => item.name)
        //         .filter(name => NameHelper.isAbbr(name) && ActorHelper.isValidName(name, lang));
        //     if (abbrs.length) {
        //         abbr = NameHelper.findAbbr(abbrs) || undefined;
        //     }
        // }

        const actor: Actor = {
            id,
            lang,
            country,
            type: knownData.type,
            name,
            abbr,
            wikiDataId: knownData.wikiEntity.wikiDataId,
            wikiPageTitle: knownData.wikiEntity.wikiPageTitle,
            wikiCountLinks: knownData.wikiEntity.countLinks,
        };

        if (knownData.wikiEntity) {
            if (knownData.wikiEntity.description) {
                actor.description = knownData.wikiEntity.description;
                if (actor.description.length > 100) {
                    actor.description = actor.description.substr(0, 100).trim();
                }
            }

            if (actor.wikiPageTitle === actor.name) {
                delete actor.wikiPageTitle;
            }
        }

        if (knownData.englishName) {
            actor.englishName = knownData.englishName;
        }

        if (knownData.commonName) {
            actor.commonName = knownData.commonName;
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

    static createActorNames(names: KnownActorName[], lang: string, country: string, actorId: string): ActorName[] {
        const actorNames = names.filter(item => ActorHelper.isValidName(item.name, lang))
            .map<ActorName>(item => ({
                type: item.type,
                name: item.name,
                lang,
                country,
                actorId,
                id: ActorHelper.createNameId(item.name, lang, country),
                countWords: NameHelper.countWords(item.name),
            }));

        return uniqByProp(actorNames, 'id');
    }

    static sortActorNames(names: ActorName[]) {
        return names.sort((a, b) => getNameOrder(a) - getNameOrder(b));
    }
}

function getNameOrder(name: ActorName) {
    return name.type === ActorNameType.WIKI ? 0 : 1;
}
