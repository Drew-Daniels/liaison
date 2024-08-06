import { MockInstance, vi } from 'vitest';

import { ParentContract, IFrameContract } from './core';

describe('ParentContract', () => {
  describe('when an iframe with an id of "id" is not found on the page', () => {
    beforeEach(() => {
      vi.spyOn(document, 'getElementById').mockReturnValue(null);
    });

    afterEach(() => {
      vi.resetAllMocks();
    });

    it('should throw', () => {
      expect(
        () =>
          new ParentContract('id', 'https://example.com', {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            someEffect: () => {},
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
      expect(
        () =>
          new ParentContract('id', 'file://some/file/path', {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            someEffect: () => {},
          })
      ).toThrow();
    });

    it('should add an event listener to the window', () => {
      new ParentContract('id', 'https://example.com', {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        someEffect: () => {},
      });
      expect(addEventListenerSpy).toHaveBeenCalled();
    });
  });
});

describe('IFrameContract', () => {
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

  it('should throw when targetOrigin is not a valid url', () => {
    expect(
      () =>
        new IFrameContract('file://some/file/path', {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          someEffect: () => {},
        })
    ).toThrow();
  });

  it('should add an event listener to the window', () => {
    new IFrameContract('https://example.com', {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      someEffect: () => {},
    });
    expect(addEventListenerSpy).toHaveBeenCalled();
  });
});
