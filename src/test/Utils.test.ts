import { StringUtils } from '../app/Utils';

describe('Utils test suite', () => {
  describe('StringUtils test', () => {
    let sut: StringUtils;

    beforeEach(() => {
      sut = new StringUtils();
      console.log('setup');
    });

    afterEach(() => {
      console.log('Teardown');
    });

    it('Should return correct Uppercase', () => {
      const actual = sut.toUpperCase('abc');

      expect(actual).toBe('ABC');
      console.log('Actual test');
    });

    it('Should throw error on invalid argument - function', () => {
      function expectError() {
        const actual = sut.toUpperCase('');
      }

      expect(expectError).toThrow();
      expect(expectError).toThrow('Invalid argument');
    });

    it('Should throw error on invalid argument - arrow function', () => {
      expect(() => sut.toUpperCase('')).toThrow('Invalid argument');
    });

    it('Should throw error on invalid argument - try catch block ', (done) => {
      try {
        sut.toUpperCase('');
        done();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toHaveProperty('message', 'Invalid argument');
        done();
      }
    });

    describe('ToUppercase examples', () => {
      it.each([
        { input: 'abc', expected: 'ABC' },
        { input: 'def', expected: 'DEF' },
      ])('$input toUpperCase should be expected', ({ input, expected }) => {
        const actual = sut.toUpperCase(input);

        expect(actual).toBe(expected);
      });
    });

    describe('getStringInfo for arg My-Bart should', () => {
      it('return right length', () => {
        const actual = sut.getStringInfo('My-Bart');

        expect(actual.characters).toHaveLength(7);
      });

      it('return right lowercase', () => {
        const actual = sut.getStringInfo('My-Bart');

        expect(actual.lowerCase).toBe('my-bart');
      });

      it('return right uppercase', () => {
        const actual = sut.getStringInfo('My-Bart');

        expect(actual.upperCase).toBe('MY-BART');
      });

      it('return right characters', () => {
        const actual = sut.getStringInfo('My-Bart');

        expect(actual.characters).toEqual(['M', 'y', '-', 'B', 'a', 'r', 't']);
        expect(actual.characters).toContain<string>('B');
      });

      it('return right defined extra info', () => {
        const actual = sut.getStringInfo('My-Bart');

        expect(actual.extraInfo).toBeDefined();
        expect(actual.extraInfo).toBeTruthy();
        expect(actual.extraInfo).not.toBe(undefined);
        expect(actual.extraInfo).not.toBeUndefined();
      });

      it('return right defined extra info', () => {
        const actual = sut.getStringInfo('My-Bart');

        expect(actual.extraInfo).toEqual({});
      });
    });
  });
});
