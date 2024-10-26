import { DataBase } from '../../../app/server_app/data/DataBase';
import { UserCredentialsDataAccess } from '../../../app/server_app/data/UserCredentialsDataAccess';
import { Account } from '../../../app/server_app/model/AuthModel';

const insertMock = jest.fn();
const getByMock = jest.fn();

jest.mock('../../../app/server_app/data/Database', () => {
  return {
    DataBase: jest.fn().mockImplementation(() => {
      return {
        insert: insertMock,
        getBy: getByMock,
      };
    }),
  };
});

describe('UserCredentialsDataAccess', () => {
  let sut: UserCredentialsDataAccess;

  const fakeId = '1234';

  const acc1: Account = {
    id: '',
    userName: 'Barty',
    password: 'HelloWorld',
  };

  beforeEach(() => {
    sut = new UserCredentialsDataAccess();

    expect(DataBase).toHaveBeenCalledTimes(1);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add user and return the id', async () => {
    insertMock.mockResolvedValueOnce(fakeId);

    const actualId = await sut.addUser(acc1);
    expect(actualId).toBe(fakeId);
    expect(insertMock).toHaveBeenCalled();
  });

  it('should get user by ID', async () => {
    getByMock.mockResolvedValueOnce(acc1);

    const actualUser = await sut.getUserById(fakeId);
    expect(actualUser).toEqual(acc1);
    expect(getByMock).toHaveBeenCalledWith('id', fakeId);
  });

  it('should get user by username', async () => {
    getByMock.mockResolvedValueOnce(acc1);

    const actualUser = await sut.getUserByUserName(acc1.userName);
    expect(actualUser).toEqual(acc1);
    expect(getByMock).toHaveBeenCalledWith('userName', actualUser?.userName);
  });
});
