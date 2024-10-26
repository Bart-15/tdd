import {
  calculateComplexity,
  OtherStringUtils,
  toUpperCaseWithCb,
} from '../../app/doubles/OtherUtils';

describe('OtherUtils test suite', () => {
  describe('OtherStringUtils test with spies', () => {
    let sut: OtherStringUtils;

    beforeEach(() => {
      sut = new OtherStringUtils();
    });

    it('should spy to track calls', () => {
      const toUpperCaseSpy = jest.spyOn(sut, 'toUpperCase');
      sut.toUpperCase('dcv');
      expect(toUpperCaseSpy).toHaveBeenCalledWith('dcv');
    });

    it('should track calls to ther modules', () => {
      const clgSpy = jest.spyOn(console, 'log');
      sut.logString('hello');
      expect(clgSpy).toHaveBeenCalledWith('hello');
    });

    it('should replace the implementation of a method', () => {
      jest.spyOn(sut, 'callExternalService').mockImplementation(() => {
        console.log('calling mocked impelementation');

        sut.callExternalService();
      });
    });
  });

  describe('Tracking cb with Jest mocks', () => {
    const cbMock = jest.fn();

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('calls cb for invalid argument - tracking cass', () => {
      const actual = toUpperCaseWithCb('', cbMock);
      expect(actual).toBeUndefined();
      expect(cbMock).toHaveBeenCalledWith('Invalid argument!');
      expect(cbMock).toHaveBeenCalledTimes(1);
    });

    it('calls cb for valid argument - tracking cass', () => {
      const actual = toUpperCaseWithCb('abc', cbMock);
      expect(actual).toBe('ABC');
      expect(cbMock).toHaveBeenCalledWith('called function with abc');
      expect(cbMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Tracking cb with with custom mock', () => {
    let cbArgs: string[] = [];
    let timesCalled = 0;

    function cbMock(arg: string) {
      cbArgs.push(arg);
      timesCalled++;
    }

    afterEach(() => {
      cbArgs = [];
      timesCalled = 0;
    });

    it('calls cb for invalid argument - tracking cass', () => {
      const actual = toUpperCaseWithCb('', cbMock);
      expect(actual).toBeUndefined();
      expect(cbArgs).toContain('Invalid argument!');
      expect(timesCalled).toBe(1);
    });

    it('calls cb for valid argument - tracking cass', () => {
      const actual = toUpperCaseWithCb('abc', cbMock);
      expect(actual).toBe('ABC');
      expect(cbArgs).toContain('called function with abc');
      expect(timesCalled).toBe(1);
    });
  });

  it('ToUpperCase - calls cb for invalid argument', () => {
    const actual = toUpperCaseWithCb('', () => {});
    expect(actual).toBeUndefined();
  });

  it('ToUpperCase - calls cb for valid argument', () => {
    const actual = toUpperCaseWithCb('DDS', () => {});
    expect(actual).toBe('DDS');
  });

  it('calculate complexity', () => {
    const someInfo = {
      length: 5,
      extraInfo: {
        field1: 'info1',
        field2: 'info2',
      },
    };

    const actual = calculateComplexity(someInfo as any);
    expect(actual).toBe(10);
  });
});
