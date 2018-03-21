
import { hello } from './index'
import test from 'ava'

test('test', t => {
    t.is(hello('Ion'), 'Hello Ion')
})