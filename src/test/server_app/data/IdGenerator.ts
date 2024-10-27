import { generateRandomId } from '../../../app/server_app/data/IdGenerator';

describe('IdGenerator test suite', () => {
  it('should return random strings', () => {
    const rondomId = generateRandomId();
    expect(rondomId).toHaveLength(20);
  });
});
