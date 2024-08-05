import { MockInstance, vi } from 'vitest';

import { Parent, IFrame } from './core';

describe('Parent', () => {
  describe('when an iframe with an id of "id" is not found on the page', () => {
    beforeEach(() => {
      vi.spyOn(document, 'getElementById').mockReturnValue(null);
    });

    afterEach(() => {
      vi.resetAllMocks();
    });

    it('should throw', () => {
      expect(() =>
        Parent({
          iframe: { id: 'id', src: 'https://example.com' },
          effects: {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            someEffect: () => {},
          },
        })
      ).toThrow();
    });
  });

  describe('when an iframe with an id of "id" is found', () => {
    let addEventListenerSpy: MockInstance;

    beforeEach(() => {
      vi.spyOn(document, 'getElementById').mockReturnValue({
        nodeName: 'IFRAME',
        contentWindow: {
          postMessage: vi.fn(),
        },
      } as unknown as HTMLIFrameElement);

      addEventListenerSpy = vi
        .spyOn(window, 'addEventListener')
        .mockReturnValue();
    });

    afterEach(() => {
      vi.resetAllMocks();
    });

    it('should throw if iframe src is not a valid url', () => {
      expect(() =>
        Parent({
          iframe: { id: 'id', src: 'file://some/file/path' },
          effects: {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            someEffect: () => {},
          },
        })
      ).toThrow();
    });

    it('should add an event listener to the window', () => {
      Parent({
        iframe: { id: 'id', src: 'https://example.com' },
        effects: {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          someEffect: () => {},
        },
      });
      expect(addEventListenerSpy).toHaveBeenCalled();
    });
  });
});

describe('IFrame', () => {
  let addEventListenerSpy: MockInstance;

  beforeEach(() => {
    vi.spyOn(document, 'getElementById').mockReturnValue({
      nodeName: 'IFRAME',
      contentWindow: {
        postMessage: vi.fn(),
      },
    } as unknown as HTMLIFrameElement);

    addEventListenerSpy = vi
      .spyOn(window, 'addEventListener')
      .mockReturnValue();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should throw when parentOrigin is not a valid url', () => {
    expect(() =>
      IFrame({
        parentOrigin: 'file://some/file/path',
        effects: {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          someEffect: () => {},
        },
      })
    ).toThrow();
  });

  it('should add an event listener to the window', () => {
    IFrame({
      parentOrigin: 'https://example.com',
      effects: {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        someEffect: () => {},
      },
    });
    expect(addEventListenerSpy).toHaveBeenCalled();
  });
});
