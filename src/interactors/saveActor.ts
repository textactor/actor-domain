
const debug = require('debug')('textactor:actor-domain');

import { Actor, ActorHelper, ActorName } from "../entities";
import { UseCase, uniq, RepUpdateData } from "@textactor/domain";
import { IActorRepository } from "./actorRepository";
import { IActorNameRepository } from "./actorNameRepository";

export class SaveActor extends UseCase<Actor, Actor, void> {

    constructor(private actorRepository: IActorRepository, private nameRepository: IActorNameRepository) {
        super();
    }

    protected async innerExecute(actor: Actor): Promise<Actor> {

        actor = { ...actor };

        const lang = actor.lang = actor.lang.trim().toLowerCase();
        const country = actor.country = actor.country.trim().toLowerCase();

        const names = uniq(actor.names.filter(item => ActorHelper.isValidName(item, lang)));

        if (names.length === 0) {
            return Promise.reject(new Error(`Invalid actor names: ${names}`));
        }

        const nameIds = uniq(names.map(item => ActorHelper.createNameId(item, lang, country)));

        const dbActorNames = await this.nameRepository.getByIds(nameIds);
        const actorIds = uniq(dbActorNames.map(item => item.actorId));


        if (actorIds.length > 1) {
            return Promise.reject(new Error(`Found more than 1 existing actor with a provited name`));
        }

        actor.names = names;

        if (actorIds.length === 1) {
            actor.id = actorIds[0];
            return this.updateActor(actor);
        }

        actor.names = [actor.name];

        await this.actorRepository.create(actor);

        const actorNames: ActorName[] = names.map(name => ({
            name,
            lang,
            country,
            actorId: actor.id,
            id: ActorHelper.createNameId(name, lang, country),
        }));

        const addedNames = await this.nameRepository.addNames(actorNames);
        const newNames = uniq(actor.names.concat(addedNames.map(item => item.name)));

        debug(`Setting actor names: ${newNames}`);

        return this.actorRepository.update({ item: { id: actor.id, names: newNames } });
    }

    private async updateActor(actor: Actor): Promise<Actor> {

        debug(`Updating actor: ${actor.slug}`);

        const lang = actor.lang;
        const country = actor.country;
        const existingActor = await this.actorRepository.getById(actor.id);

        if (!existingActor) {
            return Promise.reject(new Error(`Not found Actor id==${actor.id}`));
        }

        if (existingActor.lang !== lang || existingActor.country !== country) {
            return Promise.reject(new Error(`Invalid Actor id==${actor.id} locale: ${lang}_${country}`));
        }

        let newNames: string[] = [];

        for (let name of actor.names) {
            if (existingActor.names.indexOf(name) < 0) {
                newNames.push(name);
            }
        }

        if (newNames.length) {
            const newActorNames: ActorName[] = actor.names.map(name => ({
                name,
                lang,
                country,
                actorId: actor.id,
                id: ActorHelper.createNameId(name, lang, country),
            }));

            const addedNames = await this.nameRepository.addNames(newActorNames);

            newNames = addedNames.map(item => item.name);

            actor.names = uniq(existingActor.names.concat(newNames));
        } else {
            delete actor.names;
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
            return existingActor;
        }

        return this.actorRepository.update(updateData);
    }
}
