import { Actor, ActorType } from "./actor";
import { NameHelper, md5, uniq } from '@textactor/domain';
import * as ShortId from 'shortid';

export type CreatingActorData = {
    lang: string
    country: string
    name: string
    names: string[]

    type?: ActorType

    shortName?: string
    abbr?: string
    wikiDataId?: string
}

export class ActorHelper {

    static create(creatingData: CreatingActorData): Actor {
        const id = ShortId.generate();
        const lang = creatingData.lang.trim().toLowerCase();
        const country = creatingData.country.trim().toLowerCase();
        const name = NameHelper.standardText(creatingData.name.trim(), lang);
        const slug = NameHelper.slug(name.toLowerCase());

        let names = creatingData.names.map(item => NameHelper.standardText(item.trim(), lang));
        names.push(slug);
        names.unshift(name);
        names = uniq(names.filter(item => ActorHelper.isValidName(item, lang)));

        const actor: Actor = {
            id,
            lang,
            country,
            name,
            slug,
            names,
        };

        if (!ActorHelper.isValidName(actor.name, lang)) {
            throw new Error(`Actor name is invalid: ${actor.name}`);
        }

        if (names.length === 0) {
            throw new Error(`Actor names is invalid: ${actor.names}`);
        }

        if (!ActorHelper.isValidName(actor.slug, lang)) {
            throw new Error(`Actor slug is invalid: ${actor.slug}`);
        }

        if (creatingData.abbr) {
            actor.abbr = creatingData.abbr;
            if (!ActorHelper.isValidName(actor.abbr, lang)) {
                throw new Error(`Actor abbr is invalid: ${actor.abbr}`);
            }
        }
        if (creatingData.shortName) {
            actor.shortName = creatingData.shortName;
            if (!ActorHelper.isValidName(actor.shortName, lang)) {
                throw new Error(`Actor shortName is invalid: ${actor.shortName}`);
            }
        }
        if (creatingData.type) {
            actor.type = creatingData.type;
        }
        if (creatingData.wikiDataId) {
            actor.wikiDataId = creatingData.wikiDataId;
            if (!/^Q\d+$/.test(actor.wikiDataId)) {
                throw new Error(`wikiDataId is invalid: ${actor.wikiDataId}`);
            }
        }

        return actor;
    }

    public static isValidName(name: string, lang: string) {
        const normalName = ActorHelper.normalizeName(name, lang);
        return name.length === name.trim().length && name.length > 1 && name.length <= 200
            && normalName.length > 1 && normalName.length <= 200;
    }

    public static normalizeName(name: string, lang: string) {
        name = name.trim().replace(/\s+/g, ' ').trim();
        lang = lang.trim().toLowerCase();
        name = NameHelper.removeSymbols(name);
        name = NameHelper.standardText(name, lang);

        if (NameHelper.isAbbr(name)) {
            return name;
        }

        return name.toLowerCase();
    }

    public static nameHash(name: string, lang: string, country: string) {
        name = name.trim();
        name = ActorHelper.normalizeName(name, lang);
        name = NameHelper.atonic(name);

        return ActorHelper.hash(name, lang, country);
    }

    public static hash(name: string, lang: string, country: string) {
        return md5([lang.trim().toLowerCase(), country.trim().toLowerCase(), name.trim()].join('_'));
    }
}
