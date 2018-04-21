
import test from 'ava';
import { MemoryActorRepository } from './memoryActorRepository';
import { MemoryActorNameRepository } from './memoryActorNameRepository';
import { SaveActor } from './saveActor';
import { ActorHelper, ActorType } from '../entities';


test('should save a new actor', async t => {
    const actorRepository = new MemoryActorRepository();
    const nameRepository = new MemoryActorNameRepository();

    const saveActor = new SaveActor(actorRepository, nameRepository);

    const actorData = {
        lang: 'ro',
        country: 'md',
        name: 'Chișinău',
        names: ['Chișinău', 'Chisinau', 'chisinau', 'Chișinăului'].map(name => ({ name })),
        type: ActorType.PLACE,
    };

    const actor = ActorHelper.build(actorData);

    const savedActor = await saveActor.execute(actorData);

    t.not(actor.id, savedActor.id);
    t.is(actor.name, savedActor.name);
})

test('should save an existing actor', async t => {
    const actorRepository = new MemoryActorRepository();
    const nameRepository = new MemoryActorNameRepository();

    const saveActor = new SaveActor(actorRepository, nameRepository);

    const actorData = {
        lang: 'ro',
        country: 'md',
        name: 'Chișinău',
        names: ['Chișinău', 'Chisinau', 'chisinau', 'Chișinăului'].map(name => ({ name })),
        type: ActorType.PLACE,
    }

    const actor = ActorHelper.build(actorData);

    const savedActor = await saveActor.execute(actorData);

    t.not(actor.id, savedActor.id);
    t.is(actor.name, savedActor.name);
})
