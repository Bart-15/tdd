import { IncomingMessage } from 'http';
import { getRequestBody } from '../../../app/server_app/utils/Utils';

const requestMock = {
  on: jest.fn(),
};

const someObject = {
  name: 'Bart',
  age: 30,
  city: 'Antipolo',
};

const someObjectAsString = JSON.stringify(someObject);
describe('getRequestBody test suite', () => {
  it('should return object for valid JSON', async () => {
    requestMock.on.mockImplementation((event, cb) => {
      if (event == 'data') {
        cb(someObjectAsString);
      } else {
        cb();
      }
    });

    const actual = await getRequestBody(
      requestMock as unknown as IncomingMessage
    );
    expect(actual).toEqual(someObject);
  });

  it('should throw error for invalid JSON', async () => {
    requestMock.on.mockImplementation((event, cb) => {
      if (event == 'data') {
        cb('a' + someObject);
      } else {
        cb();
      }
    });

    await expect(getRequestBody(requestMock as any)).rejects.toThrow(
      `Unexpected token 'a', \"a[object Object]\" is not valid JSON`
    );
  });

  it('should throw error for unexpected error', async () => {
    const throwError = new Error('Something went wrong');
    requestMock.on.mockImplementation((event, cb) => {
      if (event == 'error') {
        cb(throwError);
      }
    });

    await expect(getRequestBody(requestMock as any)).rejects.toThrow(
      throwError
    );
  });
});
