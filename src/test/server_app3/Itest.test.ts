import { Account } from '../../app/server_app/model/AuthModel';
import { Reservation } from '../../app/server_app/model/ReservationModel';
import {
  HTTP_CODES,
  HTTP_METHODS,
} from '../../app/server_app/model/ServerModel';
import { Server } from '../../app/server_app/server/Server';

describe('Server app integration tests', () => {
  let server: Server;

  beforeAll(async () => {
    server = new Server();
    await server.startServer();
  });

  afterAll(async () => {
    await server.stopServer();
  });

  const someUser: Account = {
    id: '',
    userName: 'someUserName',
    password: 'somePassword',
  };

  let someReservation: Reservation = {
    id: '',
    endDate: new Date().toDateString(),
    startDate: new Date().toDateString(),
    room: 'someRoom',
    user: 'someUser',
  };

  const invalidToken = '033a928ef2e8cd760e51';

  it('should register new user', async () => {
    const result = await fetch('http://localhost:8080/register', {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(someUser),
    });

    const resultBody = await result.json();
    expect(result.status).toBe(HTTP_CODES.CREATED);
    expect(resultBody.userId).toBeDefined();
  });

  let token: string;
  it('should login registered new user', async () => {
    const result = await fetch('http://localhost:8080/login', {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(someUser),
    });
    const resultBody = await result.json();

    expect(result.status).toBe(HTTP_CODES.CREATED);
    expect(resultBody.token).toBeDefined();
    token = resultBody.token;
  });

  let createdReservationId: string;
  it('should create reservation if authorized', async () => {
    const result = await fetch('http://localhost:8080/reservation', {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(someReservation),
      headers: {
        authorization: token,
      },
    });
    const resultBody = await result.json();

    expect(result.status).toBe(HTTP_CODES.CREATED);
    expect(resultBody.reservationId).toBeDefined();
    createdReservationId = resultBody.reservationId;
  });

  it('should not create reservation if input fields are invalid but authorized', async () => {
    const result = await fetch('http://localhost:8080/reservation', {
      method: HTTP_METHODS.POST,
      body: JSON.stringify('a' + someReservation),
      headers: {
        authorization: token,
      },
    });
    const resultBody = await result.json();

    expect(result.status).toBe(HTTP_CODES.BAD_REQUEST);
    expect(resultBody).toBe('Incomplete reservation!');
  });

  it('should not create reservation if input fields are invalid but authorized', async () => {
    const result = await fetch('http://localhost:8080/reservation', {
      method: HTTP_METHODS.POST,
      body: JSON.stringify('a' + someReservation),
      headers: {
        authorization: token,
      },
    });
    const resultBody = await result.json();

    expect(result.status).toBe(HTTP_CODES.BAD_REQUEST);
    expect(resultBody).toBe('Incomplete reservation!');
  });

  it('should not create reservation if user unauthorized', async () => {
    const result = await fetch('http://localhost:8080/reservation', {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(someReservation),
      headers: {
        authorization: invalidToken,
      },
    });
    const resultBody = await result.json();

    expect(result.status).toBe(HTTP_CODES.UNAUTHORIZED);
    expect(resultBody).toBe('Unauthorized operation!');
  });

  it('should get reservation if authorized', async () => {
    const result = await fetch(
      `http://localhost:8080/reservation/${createdReservationId}`,
      {
        method: HTTP_METHODS.GET,
        headers: {
          authorization: token,
        },
      }
    );

    const resuleBody = await result.json();
    const expectedReservation = {
      ...someReservation,
      id: createdReservationId,
    };
    expect(result.status).toBe(HTTP_CODES.OK);
    expect(resuleBody).toEqual(expectedReservation);
  });

  it('should not get reservation if user unauthorized', async () => {
    const result = await fetch('http://localhost:8080/reservation/all', {
      method: HTTP_METHODS.GET,
      headers: {
        authorization: invalidToken,
      },
    });
    const resultBody = await result.json();

    expect(result.status).toBe(HTTP_CODES.UNAUTHORIZED);
    expect(resultBody).toBe('Unauthorized operation!');
  });

  it('should get all reservation if authorized', async () => {
    const result = await fetch(`http://localhost:8080/reservation/all`, {
      method: HTTP_METHODS.GET,
      headers: {
        authorization: token,
      },
    });

    const resuleBody = await result.json();
    const expectedReservation = {
      ...someReservation,
      id: createdReservationId,
    };
    expect(result.status).toBe(HTTP_CODES.OK);
    expect(resuleBody).toEqual([expectedReservation]);
  });

  it('should throw an error if the user is authorized but ID not exist', async () => {
    const sampleId = '121431';
    const result = await fetch(
      `http://localhost:8080/reservation/${sampleId}`,
      {
        method: HTTP_METHODS.GET,
        headers: {
          authorization: token,
        },
      }
    );

    const resuleBody = await result.json();
    expect(result.status).toBe(HTTP_CODES.NOT_fOUND);
    expect(resuleBody).toBe(`Reservation with id ${sampleId} not found`);
  });

  it('should update reservation if authorized', async () => {
    const updateResult = await fetch(
      `http://localhost:8080/reservation/${createdReservationId}`,
      {
        method: HTTP_METHODS.PUT,
        body: JSON.stringify({
          startDate: 'otherStartDate',
        }),
        headers: {
          authorization: token,
        },
      }
    );
    expect(updateResult.status).toBe(HTTP_CODES.OK);
    const getResult = await fetch(
      `http://localhost:8080/reservation/${createdReservationId}`,
      {
        method: HTTP_METHODS.GET,
        headers: {
          authorization: token,
        },
      }
    );
    const getRequestBody: Reservation = await getResult.json();
    expect(getRequestBody.startDate).toBe('otherStartDate');
  });

  it('should not update reservation if no id provided but user is authorized', async () => {
    const updateResult = await fetch(`http://localhost:8080/reservation/`, {
      method: HTTP_METHODS.PUT,
      headers: {
        authorization: token,
      },
    });

    const responseBody = await updateResult.json();

    expect(updateResult.status).toBe(HTTP_CODES.BAD_REQUEST);
    expect(responseBody).toBe('Please provide an ID!');
  });

  it('should not update reservation if user unauthorized', async () => {
    const updateResult = await fetch(
      `http://localhost:8080/reservation/${createdReservationId}`,
      {
        method: HTTP_METHODS.PUT,
        body: JSON.stringify({
          startDate: 'otherStartDate',
        }),
        headers: {
          authorization: invalidToken,
        },
      }
    );
    const resultBody = await updateResult.json();

    expect(updateResult.status).toBe(HTTP_CODES.UNAUTHORIZED);
    expect(resultBody).toBe('Unauthorized operation!');
  });

  it('should not delete reservation if user unauthorized', async () => {
    const deleteResult = await fetch(
      `http://localhost:8080/reservation/${createdReservationId}`,
      {
        method: HTTP_METHODS.DELETE,
        headers: {
          authorization: invalidToken,
        },
      }
    );
    const resultBody = await deleteResult.json();

    expect(deleteResult.status).toBe(HTTP_CODES.UNAUTHORIZED);
    expect(resultBody).toBe('Unauthorized operation!');
  });

  it('should delete reservation if authorized', async () => {
    const deleteResult = await fetch(
      `http://localhost:8080/reservation/${createdReservationId}`,
      {
        method: HTTP_METHODS.DELETE,
        headers: {
          authorization: token,
        },
      }
    );

    expect(deleteResult.status).toBe(HTTP_CODES.OK);

    const getResult = await fetch(
      `http://localhost:8080/reservation/${createdReservationId}`,
      {
        method: HTTP_METHODS.GET,
        headers: {
          authorization: token,
        },
      }
    );
    expect(getResult.status).toBe(HTTP_CODES.NOT_fOUND);
  });

  it('should not delete reservation if no id provided but user is authorized', async () => {
    const deleteResult = await fetch(`http://localhost:8080/reservation/`, {
      method: HTTP_METHODS.DELETE,
      headers: {
        authorization: token,
      },
    });

    const responseBody = await deleteResult.json();

    expect(deleteResult.status).toBe(HTTP_CODES.BAD_REQUEST);
    expect(responseBody).toBe('Please provide an ID!');
  });

  it('should not create reservation if user unauthorized', async () => {
    const result = await fetch('http://localhost:8080/reservation', {
      method: HTTP_METHODS.POST,
      body: JSON.stringify(someReservation),
      headers: {
        authorization: invalidToken,
      },
    });
    const resultBody = await result.json();

    expect(result.status).toBe(HTTP_CODES.UNAUTHORIZED);
    expect(resultBody).toBe('Unauthorized operation!');
  });
});
