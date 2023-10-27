import {describe, expect, test} from '@jest/globals';
import {sayHello} from '../index';

test('calculator.add adds two numbers together', () => {
    const result = sayHello();
    expect(result).toEqual(1);
});
