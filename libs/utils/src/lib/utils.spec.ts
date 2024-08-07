import { isSignal, validateUrl, isValidUrl, getIFrameById, isIFrame } from './utils';

describe('isSignal', () => {
  it('should return true when the event is a signal', () => {
    expect(isSignal({ data: { name: 'test' } } as MessageEvent)).toBe(true);
  });

  it('should return false when the event is not a signal', () => {
    expect(isSignal({ data: { payload: 'test' } } as MessageEvent)).toBe(false);
  });
});

describe('validateUrl', () => {
  it('should return a valid url with https protocol', () => {
    const url = 'https://example.com';
    expect(validateUrl(url)).toBe(url);
  });

  it('should return a valid url with http protocol', () => {
    const url = 'http://example.com';
    expect(validateUrl(url)).toBe(url);
  });

  it('should throw an error when the url is not valid', () => {
    const url = 'example.com';
    expect(() => validateUrl(url)).toThrow(`${url} is not a valid url`);
  });
});

describe('isValidUrl', () => {
  it('should return true when the url has https protocol', () => {
    const url = 'https://www.google.com';
    expect(isValidUrl(url)).toBe(true);
  });

  it('should return true when the url has http protocol', () => {
    const url = 'http://example.com';
    expect(isValidUrl(url)).toBe(true);
  });

  it('should return false when the url does not have http or https protocol', () => {
    const url = 'example.com';
    expect(isValidUrl(url)).toBe(false);
  });
});

describe('getIFrameById', () => {
  describe('when no element exists with an id of "id"', () => {
    beforeEach(() => {
      vi.spyOn(document, 'getElementById').mockReturnValue(null);
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should throw an error', () => {
      const id = 'id';
      expect(() => getIFrameById(id)).toThrow(
        `An iframe with an id of ${id} could not be found on the page`
      );
    });
  });
  describe('when an element exists with an id of "id", but it is not an iframe', () => {
    beforeEach(() => {
      vi.spyOn(document, 'getElementById').mockReturnValue({
        nodeName: 'DIV',
      } as HTMLIFrameElement);
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should throw an error', () => {
      const id = 'id';
      expect(() => getIFrameById(id)).toThrow(
        `An iframe with an id of ${id} could not be found on the page`
      );
    });
  });

  describe('when an iframe exists with an id of "id"', () => {
    beforeEach(() => {
      vi.spyOn(document, 'getElementById').mockReturnValue({
        nodeName: 'IFRAME',
      } as HTMLIFrameElement);
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should return the iframe', () => {
      const id = 'id';
      expect(getIFrameById(id)).toEqual({
        nodeName: 'IFRAME',
      } as HTMLIFrameElement);
    });
  });
});

describe('isIFrame', () => {
  it('should return true when the element is an iframe', () => {
    const el = {
      nodeName: 'IFRAME',
    } as HTMLIFrameElement;
    expect(isIFrame(el)).toBe(true);
  });

  it('should return false when the element is not an iframe', () => {
    const el = {
      nodeName: 'DIV',
    } as HTMLIFrameElement;
    expect(isIFrame(el)).toBe(false);
  });

  it('should return false when the element is null', () => {
    expect(isIFrame(null)).toBe(false);
  });
});
