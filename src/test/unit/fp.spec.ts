import { expect } from 'chai'
import {
    describe,
    it,
} from 'mocha'

import {
    compose,
    curry,
    pipe,
} from 'lodash/fp'

const add = (x: number) => x + 1
const multiple = (x: number) => x * 2
const calc = (x: number, y: number, z: number) => x + y + z

describe('when piping add with multiple functions', () => {
    const result = pipe(
        add,
        multiple,
    )(20)

    const expectedResult = 42
    it(`expect the result to be ${expectedResult}`, () => {
        expect(result).to.equal(expectedResult)
    })
})

describe('when composing add with multiple functions', () => {
    const result = compose(
        add,
        multiple,
    )(20)

    const expectedResult = 41
    it(`expect the result to be ${expectedResult}`, () => {
        expect(result).to.equal(expectedResult)
    })
})

describe('when currying a function', () => {
    const result = curry(calc)(5)(5)(5)

    const expectedResult = 15
    it(`expect the result to be ${expectedResult}`, () => {
        expect(result).to.equal(expectedResult)
    })
})
