import { Authorizer } from '../../../app/server_app/auth/Authorizer';
import { SessionTokenDataAccess } from '../../../app/server_app/data/SessionTokenDataAccess';
import { UserCredentialsDataAccess } from '../../../app/server_app/data/UserCredentialsDataAccess';
import { Account } from '../../../app/server_app/model/AuthModel';

const isValidationMock = jest.fn();
const generateTokenMock = jest.fn();
const invalidateTokenMock = jest.fn();

jest.mock('../../../app/server_app/data/SessionTokenDataAccess', () => {
  return {
    SessionTokenDataAccess: jest.fn().mockImplementation(() => {
      return {
        isValidToken: isValidationMock,
        generateToken: generateTokenMock,
        invalidateToken: invalidateTokenMock,
      };
    }),
  };
});

const getByUserNameMock = jest.fn();
jest.mock('../../../app/server_app/data/UserCredentialsDataAccess', () => {
  return {
    UserCredentialsDataAccess: jest.fn().mockImplementation(() => {
      return {
        getUserByUserName: getByUserNameMock,
      };
    }),
  };
});

describe('Authorizer test suites', () => {
  let sut: Authorizer;

  beforeEach(() => {
    sut = new Authorizer();
    expect(SessionTokenDataAccess).toHaveBeenCalledTimes(1);
    expect(UserCredentialsDataAccess).toHaveBeenCalledTimes(1);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const someTokenID = '12678asdsda';

  const someUser: Account = {
    id: '',
    userName: 'User10',
    password: 'Password123',
  };

  it('should return true token is valid', async () => {
    isValidationMock.mockResolvedValueOnce(true);

    const actual = await sut.validateToken(someTokenID);
    expect(actual).toBe(true);
  });

  it('should invalidate token once user logout', async () => {
    invalidateTokenMock.mockResolvedValueOnce(undefined);

    const actual = await sut.logout(someTokenID);
    expect(actual).toEqual(undefined);
  });

  it('should generate token upon login', async () => {
    getByUserNameMock.mockResolvedValueOnce(someUser);
    generateTokenMock.mockResolvedValueOnce(someTokenID);

    const actual = await sut.login(someUser.userName, someUser.password);

    expect(actual).toBe(someTokenID);
  });

  it('should validate token on logout call', async () => {
    await sut.logout(someTokenID);
    expect(invalidateTokenMock).toHaveBeenCalledWith(someTokenID);
  });

  it('should return undefined for invalid credentials', async () => {
    getByUserNameMock.mockResolvedValueOnce({
      password: someUser.password,
    });

    generateTokenMock.mockResolvedValueOnce(someTokenID);

    const actual = await sut.login(someUser.userName, 'Hellloworld');
    expect(actual).toBeUndefined();
  });
});
