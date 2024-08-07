import { vi } from 'vitest';

import { IFrameContract, ParentContract } from './core';
import { Effect } from '@liaison/types';

describe('ParentContract', () => {
  describe('when "targetOrigin" is not a valid url', () => {
    beforeEach(() => {
      vi.mock('@liaison/utils', () => ({
        validateUrl: vi.fn().mockImplementation(() => {
          throw new Error();
        }),
      }));
    });

    afterEach(() => {
      vi.unmock('@liaison/utils');
    });

    it('throws', () => {
      expect(
        () =>
          new ParentContract('my-iframe-id', 'bar', {
            foo: () => {
              console.log('bar');
            },
          })
      ).toThrow();
    });
  });

  describe('when effects are not valid', () => {
    it('throws', () => {
      const effect = null as unknown as Effect;
      expect(
        () =>
          new ParentContract('my-iframe-id', 'https://google.com', {
            foo: effect,
          })
      ).toThrow(`${effect} is not a valid effect`);
    });
  });

  describe('when the iframe is not found', () => {
    const id = 'my-iframe-id';
    beforeEach(() => {
      vi.mock('@liaison/utils', () => ({
        getIFrameById: vi.fn().mockImplementation(() => {
          throw new Error(
            `An iframe with an id of ${id} could not be found on the page`
          );
        }),
      }));
    });

    afterEach(() => {
      vi.unmock('@liaison/utils');
    });

    it('throws', () => {
      expect(
        () =>
          new ParentContract(id, 'https://google.com', {
            foo: () => {
              console.log('bar');
            },
          })
      ).toThrow(`An iframe with an id of ${id} could not be found on the page`);
    });
  });
});

describe('IFrameContract', () => {
  describe('when the targetOrigin is not a valid url', () => {
    it('throws', () => {
      expect(
        () =>
          new IFrameContract('foo', {
            bar: () => {
              console.log('baz');
            },
          })
      ).toThrow();
    });
  });

  describe('when effects are not valid', () => {
    it('throws', () => {
      const effect = null as unknown as Effect;
      expect(
        () =>
          new IFrameContract('https://google.com', {
            foo: effect,
          })
      ).toThrow(`${effect} is not a valid effect`);
    });
  });
});
