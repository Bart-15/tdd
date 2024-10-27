import { Authorizer } from '../../../app/server_app/auth/Authorizer';
import { ReservationsDataAccess } from '../../../app/server_app/data/ReservationsDataAccess';
import { LoginHandler } from '../../../app/server_app/handlers/LoginHandler';
import { RegisterHandler } from '../../../app/server_app/handlers/RegisterHandler';
import { ReservationsHandler } from '../../../app/server_app/handlers/ReservationsHandler';
import { HTTP_CODES } from '../../../app/server_app/model/ServerModel';
import { Server } from '../../../app/server_app/server/Server';
//Mock
jest.mock('../../../app/server_app/data/ReservationsDataAccess');
jest.mock('../../../app/server_app/handlers/ReservationsHandler');
jest.mock('../../../app/server_app/handlers/RegisterHandler');
jest.mock('../../../app/server_app/handlers/LoginHandler');
jest.mock('../../../app/server_app/auth/Authorizer');

const requestMock = {
  headers: {
    'user-agent': 'hello',
  },
  url: '',
};

const responseMock = {
  end: jest.fn(),
  writeHead: jest.fn(),
};

const serverMock = {
  listen: jest.fn(),
  close: jest.fn(),
};

jest.mock('http', () => ({
  createServer: (cb: Function) => {
    cb(requestMock, responseMock);
    return serverMock;
  },
}));

describe('Server test suite', () => {
  let sut: Server;

  beforeEach(() => {
    sut = new Server();
    expect(Authorizer).toHaveBeenCalledTimes(1);
    expect(ReservationsDataAccess).toHaveBeenCalledTimes(1);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should start server properly on port 8080 and end the request', async () => {
    await sut.startServer();

    expect(serverMock.listen).toHaveBeenCalledWith(8080);
    console.log('checking response.end calls:');
    expect(responseMock.end).toHaveBeenCalled();
  });

  it('should handle register request', async () => {
    requestMock.url = 'localhost:8080/register';
    const handleRequestSpy = jest.spyOn(
      RegisterHandler.prototype,
      'handleRequest'
    );
    await sut.startServer();

    expect(handleRequestSpy).toHaveBeenCalledTimes(1);
    expect(RegisterHandler).toHaveBeenCalledWith(
      requestMock,
      responseMock,
      expect.any(Authorizer)
    );
  });

  it('should handle login request', async () => {
    requestMock.url = 'localhost:8080/login';
    const handleRequestSpy = jest.spyOn(
      LoginHandler.prototype,
      'handleRequest'
    );
    await sut.startServer();

    expect(handleRequestSpy).toHaveBeenCalledTimes(1);
    expect(LoginHandler).toHaveBeenCalledWith(
      requestMock,
      responseMock,
      expect.any(Authorizer)
    );
  });

  it('should handle reservation request', async () => {
    requestMock.url = 'localhost:8080/reservation';
    const handleRequestSpy = jest.spyOn(
      ReservationsHandler.prototype,
      'handleRequest'
    );
    await sut.startServer();

    expect(handleRequestSpy).toHaveBeenCalledTimes(1);
    expect(ReservationsHandler).toHaveBeenCalledWith(
      requestMock,
      responseMock,
      expect.any(Authorizer),
      expect.any(ReservationsDataAccess)
    );
  });

  it('should do nothing for not supported routes', async () => {
    requestMock.url = 'localhost:8080/hello';
    const validateTokenSpy = jest.spyOn(Authorizer.prototype, 'validateToken');
    await sut.startServer();
    expect(validateTokenSpy).not.toHaveBeenCalled();
  });

  it('shoud handle error in servring request', async () => {
    requestMock.url = 'localhost:8080/reservation';
    const handleRequestSpy = jest.spyOn(
      ReservationsHandler.prototype,
      'handleRequest'
    );

    const serverError = new Error('Something went wrong');

    handleRequestSpy.mockRejectedValueOnce(serverError);
    await sut.startServer();

    expect(handleRequestSpy).toHaveBeenCalledTimes(1);
    expect(responseMock.writeHead).toHaveBeenCalledWith(
      HTTP_CODES.INTERNAL_SERVER_ERROR,
      JSON.stringify(`Internal server error: ${serverError.message}`)
    );
  });

  it('should stop the server', async () => {
    serverMock.close.mockImplementationOnce((cb: Function) => {
      cb();
    });

    await sut.startServer();

    await sut.stopServer();

    expect(serverMock.close).toHaveBeenCalledTimes(1);
  });

  it('should forward error while stopping server', async () => {
    serverMock.close.mockImplementationOnce((cb: Function) => {
      cb(new Error('Error while closing server'));
    });

    await sut.startServer();

    expect(async () => {
      await sut.stopServer();
    }).rejects.toThrow('Error while closing server');
    expect(serverMock.close).toHaveBeenCalledTimes(1);
  });
});
