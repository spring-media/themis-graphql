const {
  spreadIf,
  insertIf,
  insertIfValue,
  insertFlatIfValue,
} = require('./utils');

describe('Utils', () => {
  describe('spreadIf', () => {
    it('spreads given object if condition is met', async () => {
      const obj = {
        ...spreadIf(true, {
          my: 'value',
        }),
      };

      expect(obj).toEqual({
        my: 'value',
      });
    });

    it('executes callback if condition is met and spreads result', async () => {
      const obj = {
        ...spreadIf(true, () => ({
          my: 'value',
        })),
      };

      expect(obj).toEqual({
        my: 'value',
      });
    });

    it('does not spread given object if condition is not met', async () => {
      const obj = {
        ...spreadIf(false, {
          my: 'value',
        }),
      };

      expect(obj).toEqual({});
    });

    it('spreads alternative if condition is not met', async () => {
      const obj = {
        ...spreadIf(false, {
          my: 'value',
        }, {
          my: 'alternative',
        }),
      };

      expect(obj).toEqual({
        my: 'alternative',
      });
    });
  });

  describe('insertIf', () => {
    it('inserts given elements if condition is met', async () => {
      const arr = [
        1,
        ...insertIf(true, 2, 3),
      ];

      expect(arr).toEqual([ 1, 2, 3 ]);
    });

    it('does not flatten elements', async () => {
      const arr = [
        1,
        ...insertIf(true, [ 2, 3 ]),
      ];

      expect(arr).toEqual([ 1, [ 2, 3 ] ]);
    });

    it('does not insert given elements if condition is not met', async () => {
      const arr = [
        1,
        ...insertIf(false, 2, 3),
      ];

      expect(arr).toEqual([1]);
    });
  });

  describe('insertIfValue', () => {
    it('inserts given elements if first element is not undefined', async () => {
      const arr = [
        1,
        ...insertIfValue(2, 3),
      ];

      expect(arr).toEqual([ 1, 2, 3 ]);
    });

    it('inserts given elements if first element is not undefined (truthy)', async () => {
      const arr = [
        1,
        ...insertIfValue(true, 3),
      ];

      expect(arr).toEqual([ 1, true, 3 ]);
    });

    it('inserts given elements if first element is not undefined (falsy)', async () => {
      const arr = [
        1,
        ...insertIfValue(false, 3),
      ];

      expect(arr).toEqual([ 1, false, 3 ]);
    });

    it('does not insert if first element is undefined', async () => {
      const obj = {};
      const arr = [
        1,
        ...insertIfValue(obj.noValue, 3),
      ];

      expect(arr).toEqual([1]);
    });
  });

  describe('insertFlatIfValue', () => {
    it('inserts given elements flat if first element is not undefined', async () => {
      const arr = [
        1,
        ...insertFlatIfValue([ 2, 3 ]),
      ];

      expect(arr).toEqual([ 1, 2, 3 ]);
    });

    it('inserts given elements flat if first element is not undefined (truthy)', async () => {
      const arr = [
        1,
        ...insertFlatIfValue([ true, 3 ]),
      ];

      expect(arr).toEqual([ 1, true, 3 ]);
    });

    it('inserts given elements flat if first element is not undefined (falsy)', async () => {
      const arr = [
        1,
        ...insertFlatIfValue([ false, 3 ]),
      ];

      expect(arr).toEqual([ 1, false, 3 ]);
    });

    it('does not insert flat if first element is undefined', async () => {
      const obj = {};
      const arr = [
        1,
        ...insertFlatIfValue([ obj.noValue, 3 ]),
      ];

      expect(arr).toEqual([1]);
    });

    it('does not insert flat if argument is undefined', async () => {
      const obj = {};
      const arr = [
        1,
        ...insertFlatIfValue(obj.noValue),
      ];

      expect(arr).toEqual([1]);
    });
  });
});
