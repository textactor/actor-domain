
const debug = require('debug')('textactor:actor-domain');

import { Actor, ActorHelper } from "../entities";
import { UseCase, uniq, RepUpdateData } from "@textactor/domain";
import { IActorRepository } from "./actorRepository";
import { IActorNameRepository } from "./actorNameRepository";
import { KnownActorData } from "../entities/actorHelper";
import { uniqProp } from "../utils";

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

        names.unshift(actor.name);

        const nameIds = uniq(names.map(item => ActorHelper.createNameId(item, lang, country)));

        const dbActorNames = await this.nameRepository.getByIds(nameIds);
        const actorIds = uniq(dbActorNames.map(item => item.actorId));


        if (actorIds.length > 1) {
            return Promise.reject(new Error(`Found more than 1 existing actor: ${JSON.stringify(knownData)}`));
        }

        if (actorIds.length === 1) {
            actor.id = actorIds[0];
            return this.updateActor(actor, names);
        }

        return this.createActor(actor, names);
    }

    private async createActor(actor: Actor, names: string[]): Promise<Actor> {
        debug(`Creating new actor: ${actor.name}`);
        const createdActor = await this.actorRepository.create(actor);

        return this.updateActorNames(createdActor, names);
    }

    private async updateActor(actor: Actor, names: string[]): Promise<Actor> {

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

        const updateData: RepUpdateData<Actor> = { item: { id: actor.id } };

        Object.keys(actor).forEach(key => {
            if (['id', 'createdAt'].indexOf(key) < 0
                && [undefined, null, ''].indexOf((<any>actor)[key]) < 0
                && (<any>actor)[key] !== (<any>existingActor)[key]) {
                (<any>updateData.item)[key] = (<any>actor)[key];
            }
        });

        if (Object.keys(updateData.item).length < 2) {
            debug(`no updates to actor: ${actor.name}`);
        } else {
            existingActor = await this.actorRepository.update(updateData);
        }

        return this.updateActorNames(existingActor, names);
    }

    private updateActorNames(actor: Actor, names: string[]): Promise<Actor> {
        names.unshift(actor.name);
        names = uniq(names);

        let actorNames = ActorHelper.createActorNames(names, actor.lang, actor.country, actor.id);
        actorNames = uniqProp(actorNames, 'id');
        return this.nameRepository.addNames(actorNames).then(() => actor);
    }
}
