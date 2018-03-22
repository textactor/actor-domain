
import test from 'ava';
import { MemoryActorRepository } from './memoryActorRepository';
import { MemoryActorNameRepository } from './memoryActorNameRepository';
import { SaveActor } from './saveActor';
import { ActorHelper, ActorType } from '../entities';


test('should save a new actor', async t => {
    const actorRepository = new MemoryActorRepository();
    const nameRepository = new MemoryActorNameRepository();

    const saveActor = new SaveActor(actorRepository, nameRepository);

    const actor = ActorHelper.create({
        lang: 'ro',
        country: 'md',
        name: 'Chișinău',
        names: ['Chișinău', 'Chisinau', 'chisinau', 'Chișinăului'],
        type: ActorType.PLACE,
    });

    t.is(typeof actor.id, 'string');

    const savedActor = await saveActor.execute(actor);

    t.is(actor.id, savedActor.id);
    t.is(actor.name, savedActor.name);
    t.is(savedActor.names.length, 2);
})

test('should save an existing actor', async t => {
    const actorRepository = new MemoryActorRepository();
    const nameRepository = new MemoryActorNameRepository();

    const saveActor = new SaveActor(actorRepository, nameRepository);

    const actor = ActorHelper.create({
        lang: 'ro',
        country: 'md',
        name: 'Chișinău',
        names: ['Chișinău', 'Chisinau', 'chisinau', 'Chișinăului'],
        type: ActorType.PLACE,
    });

    const savedActor = await saveActor.execute(actor);

    t.is(actor.id, savedActor.id);
    t.is(actor.name, savedActor.name);
    t.is(savedActor.names.length, 2);

    const actor2 = ActorHelper.create({
        lang: 'ro',
        country: 'md',
        name: 'Chișinău',
        names: ['Chișinăul', 'Capitala Moldovei'],
        type: ActorType.PLACE,
    });

    const savedActor2 = await saveActor.execute(actor2);

    t.is(actor.id, savedActor2.id);
    t.is(actor2.name, savedActor2.name);
    t.is(savedActor2.names.length, 4);
})
