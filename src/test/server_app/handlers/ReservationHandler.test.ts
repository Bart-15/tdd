import { IncomingMessage, ServerResponse } from 'http';
import { Authorizer } from '../../../app/server_app/auth/Authorizer';
import { ReservationsDataAccess } from '../../../app/server_app/data/ReservationsDataAccess';
import { ReservationsHandler } from '../../../app/server_app/handlers/ReservationsHandler';
import { Reservation } from '../../../app/server_app/model/ReservationModel';
import {
  HTTP_CODES,
  HTTP_METHODS,
} from '../../../app/server_app/model/ServerModel';

const getRequestBodyMock = jest.fn();

jest.mock('../../../app/server_app/utils/Utils', () => ({
  getRequestBody: () => getRequestBodyMock(),
}));

describe('ReservationHandler test suite', () => {
  let sut: ReservationsHandler;

  const request = {
    method: '',
    url: '',
    headers: {
      authorization: '',
    },
  };

  const responseMock = {
    statusCode: 0,
    writeHead: jest.fn(),
    write: jest.fn(),
  };
  const authorizerMock = {
    validateToken: jest.fn(),
    registerUser: jest.fn(),
  };

  const reservationsDataAccessMocks = {
    createReservation: jest.fn(),
    updateReservation: jest.fn(),
    deleteReservation: jest.fn(),
    getReservation: jest.fn(),
    getAllReservations: jest.fn(),
  };

  const someReservation: Reservation = {
    id: '',
    endDate: new Date().toDateString(),
    startDate: new Date().toDateString(),
    room: 'someRoom',
    user: 'someUser',
  };

  const someId = '12568124';
  const authToken = 'hello-world';

  beforeEach(() => {
    sut = new ReservationsHandler(
      request as IncomingMessage,
      responseMock as unknown as ServerResponse,
      authorizerMock as unknown as Authorizer,
      reservationsDataAccessMocks as unknown as ReservationsDataAccess
    );

    request.headers.authorization = authToken;
    authorizerMock.validateToken.mockResolvedValueOnce(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
    (request.url = ''), (responseMock.statusCode = 0);
  });

  describe('POST Request', () => {
    beforeEach(() => {
      request.method = HTTP_METHODS.POST;
    });

    it('should create reservation from valid request', async () => {
      jest.spyOn(sut as any, 'isValidReservation').mockReturnValue(true);

      getRequestBodyMock.mockResolvedValueOnce(someReservation);
      reservationsDataAccessMocks.createReservation.mockResolvedValueOnce(
        someId
      );

      await sut.handleRequest();

      expect(responseMock.statusCode).toBe(HTTP_CODES.CREATED);
      expect(responseMock.writeHead).toHaveBeenCalledWith(HTTP_CODES.CREATED, {
        'Content-Type': 'application/json',
      });
      expect(responseMock.write).toHaveBeenCalledWith(
        JSON.stringify({ reservationId: someId })
      );
    });

    it('should not create reservation from invalid request', async () => {
      getRequestBodyMock.mockResolvedValueOnce({});
      reservationsDataAccessMocks.createReservation.mockResolvedValueOnce('');

      await sut.handleRequest();

      expect(responseMock.statusCode).toBe(HTTP_CODES.BAD_REQUEST);

      expect(responseMock.write).toHaveBeenCalledWith(
        JSON.stringify('Incomplete reservation!')
      );
    });

    it('should not create reservation from invalid field in request', async () => {
      getRequestBodyMock.mockResolvedValueOnce({
        ...someReservation,
        someField: '123435',
      });

      await sut.handleRequest();

      expect(responseMock.statusCode).toBe(HTTP_CODES.BAD_REQUEST);

      expect(responseMock.write).toHaveBeenCalledWith(
        JSON.stringify('Incomplete reservation!')
      );
    });
  });

  describe('GET Request', () => {
    beforeEach(() => {
      request.method = HTTP_METHODS.GET;
    });

    it('should return all reservations', async () => {
      request.url = '/reservations/all';
      reservationsDataAccessMocks.getAllReservations.mockResolvedValueOnce([
        someReservation,
      ]);

      await sut.handleRequest();
      expect(responseMock.writeHead).toHaveBeenCalledWith(HTTP_CODES.OK, {
        'Content-Type': 'application/json',
      });
      expect(responseMock.write).toHaveBeenCalledWith(
        JSON.stringify([someReservation])
      );
    });

    it('should return reservation by id', async () => {
      request.url = `/reservations/${someId}`;
      reservationsDataAccessMocks.getReservation.mockResolvedValueOnce(
        someReservation
      );

      await sut.handleRequest();
      expect(responseMock.writeHead).toHaveBeenCalledWith(HTTP_CODES.OK, {
        'Content-Type': 'application/json',
      });
      expect(responseMock.write).toHaveBeenCalledWith(
        JSON.stringify(someReservation)
      );
    });

    it('should return not found for non existting id', async () => {
      request.url = `/reservations/${someId}`;
      reservationsDataAccessMocks.getReservation.mockResolvedValueOnce(
        undefined
      );

      await sut.handleRequest();
      expect(responseMock.statusCode).toBe(HTTP_CODES.NOT_fOUND);
      expect(responseMock.write).toHaveBeenCalledWith(
        JSON.stringify(`Reservation with id ${someId} not found`)
      );
    });

    it('should return bad request if no id provided', async () => {
      request.url = `/reservations/`;

      await sut.handleRequest();
      expect(responseMock.statusCode).toBe(HTTP_CODES.BAD_REQUEST);
      expect(responseMock.write).toHaveBeenCalledWith(
        JSON.stringify('Please provide an ID!')
      );
    });
  });

  describe('PUT Request', () => {
    beforeEach(() => {
      request.method = HTTP_METHODS.PUT;
    });

    it('should update reservation from valid request', async () => {
      request.url = `/reservations/${someId}`;
      reservationsDataAccessMocks.getReservation.mockResolvedValueOnce(
        someReservation
      );
      const updatedObj = {
        startDate: 'someDate',
        endDate: 'endtDate',
      };
      getRequestBodyMock.mockResolvedValueOnce(updatedObj);

      await sut.handleRequest();

      expect(
        reservationsDataAccessMocks.updateReservation
      ).toHaveBeenCalledTimes(2);
      expect(
        reservationsDataAccessMocks.updateReservation
      ).toHaveBeenCalledWith(someId, 'startDate', updatedObj.startDate);

      expect(
        reservationsDataAccessMocks.updateReservation
      ).toHaveBeenCalledWith(someId, 'endDate', updatedObj.endDate);

      expect(responseMock.writeHead).toHaveBeenCalledWith(HTTP_CODES.OK, {
        'Content-Type': 'application/json',
      });
      expect(responseMock.write).toHaveBeenCalledWith(
        JSON.stringify(
          `Updated ${Object.keys(updatedObj)} of reservation ${someId}`
        )
      );
    });

    it('should not update reservation from invalid request', async () => {
      request.url = `/reservations/${someId}`;
      reservationsDataAccessMocks.getReservation.mockResolvedValueOnce(
        someReservation
      );
      getRequestBodyMock.mockResolvedValueOnce({
        startDate1: 'date',
      });

      await sut.handleRequest();

      expect(responseMock.statusCode).toBe(HTTP_CODES.BAD_REQUEST);

      expect(responseMock.write).toHaveBeenCalledWith(
        JSON.stringify('Please provide valid fields to update!')
      );
    });

    it('should not update reservation from invalid field in request', async () => {
      request.url = `/reservations/${someId}`;
      reservationsDataAccessMocks.getReservation.mockResolvedValueOnce(
        someReservation
      );
      getRequestBodyMock.mockResolvedValueOnce({
        startDate1: 'someDate',
      });

      await sut.handleRequest();

      expect(responseMock.statusCode).toBe(HTTP_CODES.BAD_REQUEST);
      expect(responseMock.write).toHaveBeenCalledWith(
        JSON.stringify('Please provide valid fields to update!')
      );
    });

    it('should return not found for non existting id', async () => {
      request.url = `/reservations/${someId}`;
      reservationsDataAccessMocks.getReservation.mockResolvedValueOnce(
        undefined
      );

      await sut.handleRequest();
      expect(responseMock.statusCode).toBe(HTTP_CODES.NOT_fOUND);
      expect(responseMock.write).toHaveBeenCalledWith(
        JSON.stringify(`Reservation with id ${someId} not found`)
      );
    });

    it('should return bad request if no id provided', async () => {
      request.url = `/reservations/`;

      await sut.handleRequest();
      expect(responseMock.statusCode).toBe(HTTP_CODES.BAD_REQUEST);
      expect(responseMock.write).toHaveBeenCalledWith(
        JSON.stringify('Please provide an ID!')
      );
    });
  });

  describe('DELETE Request', () => {
    beforeEach(() => {
      request.method = HTTP_METHODS.DELETE;
    });

    it('should delete reservation with existing id', async () => {
      request.url = `/reservaltions/${someId}`;

      await sut.handleRequest();
      expect(responseMock.statusCode).toBe(HTTP_CODES.OK);
      expect(responseMock.write).toHaveBeenCalledWith(
        JSON.stringify(`Deleted reservation with id ${someId}`)
      );
    });

    it('should not delete reservation if id not provided', async () => {
      request.url = '/reservaltions';

      await sut.handleRequest();
      expect(responseMock.statusCode).toBe(HTTP_CODES.BAD_REQUEST);
      expect(responseMock.write).toHaveBeenCalledWith(
        JSON.stringify('Please provide an ID!')
      );
    });
  });
});
