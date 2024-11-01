import { IncomingMessage, ServerResponse } from 'http';
import { Authorizer } from '../../../app/server_app/auth/Authorizer';
import { LoginHandler } from '../../../app/server_app/handlers/LoginHandler';
import {
  HTTP_CODES,
  HTTP_METHODS,
} from '../../../app/server_app/model/ServerModel';
const getRequestBodyMock = jest.fn();

jest.mock('../../../app/server_app/utils/Utils', () => ({
  getRequestBody: () => getRequestBodyMock(),
}));

describe('LoginHandler test suite', () => {
  let sut: LoginHandler;

  const request = {
    method: '',
  };
  const responseMock = {
    statusCode: 0,
    writeHead: jest.fn(),
    write: jest.fn(),
  };
  const authorizerMock = {
    login: jest.fn(),
  };

  const someAcc = {
    userName: 'someUsername',
    password: 'somePassword',
  };

  const someToken = 'asdhasgdjb21356--1237213223--21';

  beforeEach(() => {
    sut = new LoginHandler(
      request as IncomingMessage,
      responseMock as unknown as ServerResponse,
      authorizerMock as unknown as Authorizer
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should logged in valid account', async () => {
    request.method = HTTP_METHODS.POST;
    getRequestBodyMock.mockResolvedValueOnce(someAcc);
    authorizerMock.login.mockResolvedValueOnce(someToken);

    await sut.handleRequest();

    //token
    expect(responseMock.statusCode).toBe(HTTP_CODES.CREATED);
    expect(responseMock.writeHead).toHaveBeenCalledWith(HTTP_CODES.CREATED, {
      'Content-Type': 'application/json',
    });
    expect(responseMock.write).toHaveBeenCalledWith(
      JSON.stringify({
        token: someToken,
      })
    );
  });

  it('should not log in if the the request body is empty object', async () => {
    request.method = HTTP_METHODS.POST;
    getRequestBodyMock.mockResolvedValueOnce({});

    await sut.handleRequest();

    //token
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
