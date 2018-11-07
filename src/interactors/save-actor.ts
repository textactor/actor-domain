
const debug = require('debug')('textactor:actor-domain');

import { Actor, ActorHelper, ActorName } from "../entities";
import { UseCase, uniq, RepUpdateData } from "@textactor/domain";
import { IActorRepository } from "./actor-repository";
import { IActorNameRepository } from "./actor-name-repository";
import { KnownActorData } from "../entities/actor-helper";
import { ActorNameType } from "../entities/actor-name";
import { diff as arrayDiff } from 'fast-array-diff';
import { logger } from "../logger";
import { DeleteActor } from "./delete-actor";

export class SaveActor extends UseCase<KnownActorData, Actor, void> {
    private deleteActorUseCase: DeleteActor

    constructor(private actorRepository: IActorRepository, private nameRepository: IActorNameRepository) {
        super();

        this.deleteActorUseCase = new DeleteActor(actorRepository, nameRepository);
    }

    protected async innerExecute(knownData: KnownActorData): Promise<Actor> {

        const actor = ActorHelper.build(knownData);

        const lang = actor.lang;
        const country = actor.country;
        const knownNames = knownData.names.slice(0);
        if (knownData.wikiEntity.wikiDataId) {
            knownNames.push({ name: 'wiki-' + knownData.wikiEntity.wikiDataId, popularity: 1, type: ActorNameType.WIKI });
        }

        let names = knownNames.map(item => item.name)
            .filter(item => ActorHelper.isValidName(item, lang));

        // names.unshift(actor.name);

        names = uniq(names);

        const nameIds = uniq(names.map(item => ActorHelper.createNameId(item, lang, country)));

        const dbActorNames = await this.nameRepository.getByIds(nameIds);
        const actorIds = uniq(dbActorNames.map(item => item.actorId));


        if (actorIds.length > 1) {
            return this.conflictActor(actorIds, knownData);
        }

        if (actorIds.length === 1) {
            actor.id = actorIds[0];
            return this.updateActor(actor, ActorHelper.createActorNames(knownNames, lang, country, actor.id));
        }

        return this.createActor(actor, ActorHelper.createActorNames(knownNames.filter(item => item.popularity > 0), lang, country, actor.id));
    }

    private async conflictActor(ids: string[], knownData: KnownActorData): Promise<Actor> {
        const actors = await this.actorRepository.getByIds(ids);

        const wikiDataId = knownData.wikiEntity.wikiDataId;

        logger.warn(`Found more than 1 existing actor for: ${JSON.stringify({ name: knownData.name, names: knownData.names })}`,
            { actors: actors.map(item => ({ id: item.id, name: item.name, wikiDataId: item.wikiDataId })) });

        const isLocalNewActor = knownData.wikiEntity.countryCodes.includes(knownData.country);

        for (let actor of actors) {
            if (actor.wikiDataId !== wikiDataId) {
                const isLocalOldActor = actor.countryCodes && actor.countryCodes.includes(knownData.country);
                let deleteOldActor = false;

                const oldActorPopularity = getEntityPopularity(actor.wikiCountLinks);
                const newActorPopularity = getEntityPopularity(knownData.wikiEntity.countLinks);

                // both are local entities
                if (isLocalNewActor && isLocalOldActor) {
                    deleteOldActor = knownData.wikiEntity.countLinks > actor.wikiCountLinks;
                }
                else if (isLocalNewActor) {
                    deleteOldActor = oldActorPopularity < EntityPopularity.POPULAR && newActorPopularity > EntityPopularity.LOW;
                } else if (isLocalOldActor) {
                    deleteOldActor = newActorPopularity === EntityPopularity.POPULAR && oldActorPopularity <= EntityPopularity.LOW;
                }

                if (deleteOldActor) {
                    await this.deleteActorUseCase.execute(actor.id);
                    logger.warn(`Deleted not locale/popular actor: ${actor.name}`, actor);
                    return this.innerExecute(knownData);
                }
            }
        }

        const unpopularActor = actors.sort((a, b) => a.wikiCountLinks - b.wikiCountLinks)[0];

        await this.deleteActorUseCase.execute(unpopularActor.id);
        logger.warn(`Deleted most unpopular actor: ${unpopularActor.name}`, unpopularActor);
        return this.innerExecute(knownData);
    }

    private async createActor(actor: Actor, names: ActorName[]): Promise<Actor> {
        debug(`Creating new actor: ${actor.name}, ${JSON.stringify(names)}`);
        const createdActor = await this.actorRepository.create(actor);

        await this.nameRepository.addNames(names);

        return createdActor;
    }

    private async updateActor(actor: Actor, names: ActorName[]): Promise<Actor> {

        debug(`Updating actor: ${actor.name}, ${JSON.stringify(names)}`);

        const lang = actor.lang;
        const country = actor.country;
        let existingActor = await this.actorRepository.getById(actor.id);

        if (!existingActor) {
            return Promise.reject(new Error(`Not found Actor id==${actor.id}`));
        }

        if (existingActor.lang !== lang || existingActor.country !== country) {
            return Promise.reject(new Error(`Invalid Actor id==${actor.id} locale: ${lang}_${country}`));
        }

        const updateData: RepUpdateData<string, Actor> = { id: actor.id, set: {} };

        Object.keys(actor).forEach(key => {
            if (['id', 'createdAt'].indexOf(key) < 0
                && [undefined, null, ''].indexOf((<any>actor)[key]) < 0
                && (<any>actor)[key] !== (<any>existingActor)[key]) {
                (<any>updateData.set)[key] = (<any>actor)[key];
            }
        });

        if (!updateData.set || !Object.keys(updateData.set).length) {
            debug(`no updates to actor: ${actor.name}`);
        } else {
            existingActor = await this.actorRepository.update(updateData);
        }

        await this.updateActorNames(names);

        return existingActor;
    }

    private async updateActorNames(names: ActorName[]) {
        if (!names.length) {
            return;
        }
        const actorId = names[0].actorId;

        const newWikiNames = names.filter(item => item.type === ActorNameType.WIKI);

        const dbNames = await this.nameRepository.getNamesByActorId(actorId);
        const oldWikiNames = dbNames.filter(item => item.type === ActorNameType.WIKI);

        let diff = arrayDiff(oldWikiNames, newWikiNames, (a, b) => a.id === b.id);

        if (diff.removed && diff.removed.length) {
            debug(`Removing wiki names: ${JSON.stringify(diff.removed)}`);
            await Promise.all(diff.removed.map(name => this.nameRepository.delete(name.id)));
        }

        diff = arrayDiff(dbNames, names, (a, b) => a.id === b.id);

        if (diff.added && diff.added.length) {
            const addNames = ActorHelper.sortActorNames(diff.added);
            debug(`Adding wiki names: ${JSON.stringify(addNames)}`);
            await this.nameRepository.addNames(addNames);
        }
    }
}

function getEntityPopularity(countLinks: number): EntityPopularity {
    if (!countLinks || countLinks < 0) {
        return EntityPopularity.UNKNOWN;
    }

    if (countLinks < 8) {
        return EntityPopularity.LOW;
    }
    if (countLinks < 40) {
        return EntityPopularity.NORMAL;
    }
    if (countLinks < 80) {
        return EntityPopularity.HIGH;
    }

    return EntityPopularity.POPULAR;
}

export enum EntityPopularity {
    UNKNOWN = 1,
    LOW = 2,
    NORMAL = 3,
    HIGH = 4,
    POPULAR = 5,
}
