
import test from 'ava';
import { ActorHelper } from './actor-helper';
import { ActorNameType, ActorName } from './actor-name';
// import { ActorType } from '.';

test('#isValidName', t => {
    t.true(ActorHelper.isValidName('Name', 'en'));
    t.true(ActorHelper.isValidName('AB', 'en'));
    t.true(ActorHelper.isValidName('Name 2', 'en'));
    t.false(ActorHelper.isValidName('n', 'en'));
    t.false(ActorHelper.isValidName('n #', 'en'));
});

test('#sortActorNames', t => {
    const defaultName: ActorName = { type: ActorNameType.WIKI, name: '', id: '', actorId: '', country: '', lang: '', countWords: 1 };

    let result = ActorHelper.sortActorNames([
        { ...defaultName, type: ActorNameType.WIKI },
        { ...defaultName, type: ActorNameType.SAME },
        { ...defaultName, type: ActorNameType.WIKI },
        { ...defaultName, type: ActorNameType.SAME },
    ]);

    t.is(result[0].type, ActorNameType.WIKI);
    t.is(result[1].type, ActorNameType.WIKI);
    t.is(result[2].type, ActorNameType.SAME);
    t.is(result[3].type, ActorNameType.SAME);
});

// test('#create', t => {
//     t.throws(() => ActorHelper.build({ name: 'A', names: ['B'], lang: 'en', country: 'us' }), /Actor name is invalid/);
//     t.throws(() => ActorHelper.create({ name: 'A ?', names: ['Bar'], lang: 'en', country: 'us' }), /Actor name is invalid/);
//     const actor = ActorHelper.create({ name: 'Chisinau', names: [], type: ActorType.PLACE, country: 'us', lang: 'en' });

//     t.is(typeof actor.id, 'string');
// });
