
const debug = require('debug')('textactor:actor-domain');

import { Actor, ActorHelper, ActorName } from "../entities";
import { UseCase, uniq, RepUpdateData } from "@textactor/domain";
import { IActorRepository } from "./actorRepository";
import { IActorNameRepository } from "./actorNameRepository";
import { KnownActorData } from "../entities/actorHelper";
import { ActorNameType } from "../entities/actorName";
import { diff as arrayDiff } from 'fast-array-diff';

export class SaveActor extends UseCase<KnownActorData, Actor, void> {

    constructor(private actorRepository: IActorRepository, private nameRepository: IActorNameRepository) {
        super();
    }

    protected async innerExecute(knownData: KnownActorData): Promise<Actor> {

        const actor = ActorHelper.build(knownData);

        const lang = actor.lang;
        const country = actor.country;
        let names = knownData.names.map(item => item.name)
            .filter(item => ActorHelper.isValidName(item, lang));

        // names.unshift(actor.name);

        names = uniq(names);

        const nameIds = uniq(names.map(item => ActorHelper.createNameId(item, lang, country)));

        const dbActorNames = await this.nameRepository.getByIds(nameIds);
        const actorIds = uniq(dbActorNames.map(item => item.actorId));


        if (actorIds.length > 1) {
            return Promise.reject(new Error(`Found more than 1 existing actor: ${JSON.stringify(knownData)}`));
        }

        const actorNames = ActorHelper.createActorNames(knownData.names, lang, country, actor.id);

        if (actorIds.length === 1) {
            actor.id = actorIds[0];
            return this.updateActor(actor, actorNames);
        }

        return this.createActor(actor, actorNames);
    }

    private async createActor(actor: Actor, names: ActorName[]): Promise<Actor> {
        debug(`Creating new actor: ${actor.name}`);
        const createdActor = await this.actorRepository.create(actor);

        await this.nameRepository.addNames(names);

        return createdActor;
    }

    private async updateActor(actor: Actor, names: ActorName[]): Promise<Actor> {

        debug(`Updating actor: ${actor.name}`);

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
            debug(`Removing wiki names: ${diff.removed}`);
            await Promise.all(diff.removed.map(name => this.nameRepository.delete(name.id)));
        }

        diff = arrayDiff(dbNames, names, (a, b) => a.id === b.id);

        if (diff.added && diff.added.length) {
            const addNames = ActorHelper.sortActorNames(diff.added);
            debug(`Adding wiki names: ${addNames}`);
            await this.nameRepository.addNames(addNames);
        }
    }
}
