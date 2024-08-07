import { Effect, SignalEvent } from '@liaison/types';

function isSignal(e: MessageEvent): e is SignalEvent {
  const { data } = e;
  return 'name' in data;
}

function validateUrl(url: string) {
  if (!isValidUrl(url)) {
    throw new Error(`${url} is not a valid url`);
  }
  return url;
}

function isValidUrl(src: string) {
  let url;
  try {
    url = new URL(src);
  } catch (e) {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
}

function validateEffects(effects: Record<string, Effect>) {
  Object.values(effects).forEach((effect) => {
    if (typeof effect !== 'function') {
      throw new Error(`${effect} is not a valid effect`);
    }
  });
  return effects;
}

function getIFrameById(id: string) {
  const el = document.getElementById(id);
  if (!isIFrame(el)) {
    throw new Error(
      `An iframe with an id of ${id} could not be found on the page`
    );
  }
  return el;
}

function isIFrame(el: HTMLElement | null): el is HTMLIFrameElement {
  return el !== null && el.nodeName === 'IFRAME';
}

export {
  isSignal,
  isValidUrl,
  validateUrl,
  validateEffects,
  getIFrameById,
  isIFrame,
};
