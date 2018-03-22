
import test from 'ava';
import { ActorHelper } from './actorHelper';
import { ActorType } from '.';

test('#isValidName', t => {
    t.true(ActorHelper.isValidName('Name', 'en'));
    t.true(ActorHelper.isValidName('AB', 'en'));
    t.true(ActorHelper.isValidName('Name 2', 'en'));
    t.false(ActorHelper.isValidName('n', 'en'));
    t.false(ActorHelper.isValidName('n #', 'en'));
});

test('#create', t => {
    t.throws(() => ActorHelper.create({ name: 'A', names: ['B'], lang: 'en', country: 'us' }), /Actor name is invalid/);
    t.throws(() => ActorHelper.create({ name: 'A ?', names: ['Bar'], lang: 'en', country: 'us' }), /Actor name is invalid/);
    const actor = ActorHelper.create({ name: 'Chisinau', names: [], type: ActorType.PLACE, country: 'us', lang: 'en' });

    t.is(typeof actor.id, 'string');
});
