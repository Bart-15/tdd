import { IncomingMessage, ServerResponse } from 'http';
import { Authorizer } from '../../../app/server_app/auth/Authorizer';
import { RegisterHandler } from '../../../app/server_app/handlers/RegisterHandler';
import { Account } from '../../../app/server_app/model/AuthModel';
import {
  HTTP_CODES,
  HTTP_METHODS,
} from '../../../app/server_app/model/ServerModel';

const getRequestBodyMock = jest.fn();

jest.mock('../../../app/server_app/utils/Utils', () => ({
  getRequestBody: () => getRequestBodyMock(),
}));

describe('RegisterHandler test suite', () => {
  let sut: RegisterHandler;

  const request = {
    method: '',
  };
  const responseMock = {
    statusCode: 0,
    writeHead: jest.fn(),
    write: jest.fn(),
  };
  const authorizerMock = {
    registerUser: jest.fn(),
  };

  beforeEach(() => {
    sut = new RegisterHandler(
      request as IncomingMessage,
      responseMock as unknown as ServerResponse,
      authorizerMock as unknown as Authorizer
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const someId = '123456';

  const someAcc: Account = {
    id: '',
    password: 'somePassword',
    userName: 'somePassword',
  };

  it('should register valid account in request', async () => {
    request.method = HTTP_METHODS.POST;
    getRequestBodyMock.mockResolvedValueOnce(someAcc);
    authorizerMock.registerUser.mockResolvedValueOnce(someId);

    await sut.handleRequest();

    expect(responseMock.statusCode).toBe(HTTP_CODES.CREATED);
    expect(responseMock.writeHead).toHaveBeenCalledWith(HTTP_CODES.CREATED, {
      'Content-Type': 'application/json',
    });

    expect(responseMock.write).toHaveBeenCalledWith(
      JSON.stringify({
        userId: someId,
      })
    );
  });

  it('should not register invalid account in request', async () => {
    request.method = HTTP_METHODS.POST;
    getRequestBodyMock.mockResolvedValueOnce({});
    authorizerMock.registerUser.mockResolvedValueOnce('');

    await sut.handleRequest();
    expect(responseMock.statusCode).toBe(HTTP_CODES.BAD_REQUEST);
    expect(responseMock.writeHead).toHaveBeenCalledWith(
      HTTP_CODES.BAD_REQUEST,
      {
        'Content-Type': 'application/json',
      }
    );

    expect(responseMock.write).toHaveBeenCalledWith(
      JSON.stringify('userName and password required')
    );
  });

  it('should do nothing for not supported http methods', async () => {
    request.method = HTTP_METHODS.GET;
    await sut.handleRequest();

    expect(responseMock.writeHead).not.toHaveBeenCalled();
    expect(responseMock.write).not.toHaveBeenCalled();
    expect(getRequestBodyMock).not.toHaveBeenCalled();
  });
});
