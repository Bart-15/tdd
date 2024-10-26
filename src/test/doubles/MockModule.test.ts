jest.mock('../../app/doubles/OtherUtils', () => ({
  ...jest.requireActual('../../app/doubles/OtherUtils'), // keep other functions
  calculateComplexity: () => 10,
}));

import * as OtherUtils from '../../app/doubles/OtherUtils';

// mock uuid
jest.mock('uuid', () => ({
  v4: () => '1267819',
}));

describe('test module suite', () => {
  it('calculate complexity', () => {
    const result = OtherUtils.calculateComplexity({} as any);
    expect(result).toBe(10);
  });

  it('return uppercase', () => {
    const result = OtherUtils.toUpperCase('joe');
    expect(result).toBe('JOE');
  });

  it('should return string with ID', () => {
    const result = OtherUtils.toLowerCaseWithId('hello');
    expect(result).toBe('hello1267819');
  });
});
