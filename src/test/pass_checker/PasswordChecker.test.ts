import { PasswordChecker } from '../../app/pass_checker/PasswordChecker';
import { PasswordErrors } from './../../app/pass_checker/PasswordChecker';

describe('Password test suite', () => {
  let sut: PasswordChecker;

  beforeEach(() => {
    sut = new PasswordChecker();
  });

  describe('Password is invalid', () => {
    it('Password is less than 8 characters', () => {
      const actual = sut.checkPassword('asacasa');
      expect(actual.valid).toBe(false);
      expect(actual.reasons).toContain(PasswordErrors.SHORT);
    });

    it('Password with no lowercase', () => {
      const actual = sut.checkPassword('BAJAKSJKAAS');
      expect(actual.valid).toBe(false);
      expect(actual.reasons).toContain(PasswordErrors.NO_LOWER_CASE);
    });

    it('Password with no uppercase', () => {});
  });

  describe('Password is valid', () => {
    it('Password is greater than 8 characters', () => {
      const actual = sut.checkPassword('asacasasas');
      expect(actual.reasons).not.toContain(PasswordErrors.SHORT);
    });

    it('Password with uppercase letter', () => {
      const actual = sut.checkPassword('ASASASaaawq');
      expect(actual.reasons).not.toContain(PasswordErrors.NO_UPPER_CASE);
    });

    it('Password with uppercase letter', () => {
      const actual = sut.checkPassword('ASASaasqdQ');
      expect(actual.reasons).not.toContain(PasswordErrors.NO_LOWER_CASE);
    });

    it('Complex password is valid', () => {
      const actual = sut.checkPassword('asaAsasaYU1');
      expect(actual.reasons).toHaveLength(0);
      expect(actual.valid).toBe(true);
    });
  });

  describe('Admin password', () => {
    it('with no number is invalid', () => {
      const actual = sut.checkAdminPassword('asasaAASD');
      expect(actual.reasons).toContain(PasswordErrors.NO_NUMBER);
      expect(actual.valid).toBe(false);
    });

    it('with number is valid', () => {
      const actual = sut.checkAdminPassword('asasaAASD12');
      expect(actual.reasons).not.toContain(PasswordErrors.NO_NUMBER);
      expect(actual.valid).toBe(true);
    });
  });
});
