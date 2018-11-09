
import test from 'ava';
import { ActorNameValidator } from './actor-name-validator';
import { ActorName } from './actor-name';



test('create invalid id', t => {
    const validator = new ActorNameValidator();
    t.throws(() => validator.onCreate({ id: '' } as ActorName), /"id" fails/);
    t.throws(() => validator.onCreate({ id: 'a' } as ActorName), /"id" fails/);
    t.throws(() => validator.onCreate({ id: '               ' } as ActorName), /"id" fails/);
    t.throws(() => validator.onCreate({ id: 'hfsejfjhsebfjs34723_12' } as ActorName), /"id" fails/);
})

test('create invalid lang', t => {
    const validator = new ActorNameValidator();
    t.throws(() => validator.onCreate({ id: '7b43r743y7rcb43ry43rc34' } as ActorName), /"lang" is required/);
    t.throws(() => validator.onCreate({ id: '7b43r743y7rcb43ry43rc34', lang: 'a' } as ActorName), /"lang" fails/);
    t.throws(() => validator.onCreate({ id: '7b43r743y7rcb43ry43rc34', lang: '-a' } as ActorName), /"lang" fails/);
    t.throws(() => validator.onCreate({ id: '7b43r743y7rcb43ry43rc34', lang: 'CA' } as ActorName), /"lang" fails/);
})

test('update invalid set', t => {
    const validator = new ActorNameValidator();
    t.throws(() => validator.onUpdate({ id: '7b43r743y7rcb43ry43rc34', set: { id: 'a' } }), /"id" is not allowed/);
    t.throws(() => validator.onUpdate({ id: '7b43r743y7rcb43ry43rc34', set: { country: 'ro' } }), /"country" is not allowed/);
})
