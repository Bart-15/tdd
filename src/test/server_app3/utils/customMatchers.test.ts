import { Reservation } from '../../../app/server_app/model/ReservationModel';

expect.extend({
  toBeValidReservation(reservation: Reservation) {
    const validId = reservation.id.length > 5 ? true : false;
    const validUser = reservation.id.length > 5 ? true : false;
    return {
      pass: validId && validUser,
      message: () => 'expect reservation to have valid id and user',
    };
  },

  toHaveUser(resrvation: Reservation, user: string) {
    const hasRightUser = user == resrvation.user;

    return {
      pass: hasRightUser,
      message: () =>
        `expected reservation to have user ${user}, received ${resrvation.user}`,
    };
  },
});

interface CustomMatchers<R> {
  toBeValidReservation(): R;
  toHaveUser(user: string): R;
}

declare global {
  namespace jest {
    interface Matchers<R> extends CustomMatchers<R> {}
  }
}

let someReservation: Reservation = {
  id: '123456',
  endDate: new Date().toDateString(),
  startDate: new Date().toDateString(),
  room: 'someRoom',
  user: 'someUser',
};

describe('custom matchers test', () => {
  it('check for valid reservation', () => {
    expect(someReservation).toBeValidReservation();
    expect(someReservation).toHaveUser('someUser');
  });
});
