type Effect = (params: {
  cb: (signal: Signal) => void;
  args: Record<string, unknown>;
}) => void;

export interface SignalEvent extends MessageEvent {
  data: Signal;
}

export interface Signal {
  name: string;
  args?: Record<string, unknown>;
}

export interface Client {
  cb: (signal: Signal) => void;
  destroy: () => void;
}

export type Hook = Omit<Client, 'destroy'>;

export interface ParentIFrameOpts {
  id: string;
  src: string;
}

interface BaseClientOpts {
  /** The Effects that the Parent model can enact on the IFrame or those that the IFrame model can enact on the Parent */
  effects: Record<string, Effect>;
}

export interface ParentOpts extends BaseClientOpts {
  iframe: ParentIFrameOpts;
}

export interface IFrameOpts extends BaseClientOpts {
  // TODO: Add support for multiple whitelisted URLs - in cases where the iFrame could be used in different sites
  /** The URL where your iframe expects to receive messages from: https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#targetorigin */
  parentOrigin: string;
}

export function Parent({ iframe: { id, src }, effects }: ParentOpts): Client {
  _init();

  return {
    cb,
    destroy,
  };

  function _init() {
    _validateIFrameId();
    _validateUrl(src);
    _validateEffects(effects);
    window.addEventListener('message', _onMessageEvent);

    function _validateIFrameId() {
      const iframe = document.getElementById(id);
      if (iframe && !isIFrame(iframe)) {
        throw new Error(
          `An element with an id of ${id} was found, but was actually a ${iframe.nodeName}`
        );
      }

      function isIFrame(el: HTMLElement) {
        return el.nodeName === 'IFRAME';
      }
    }
  }

  function _onMessageEvent(messageEvent: MessageEvent) {
    if (_whitelisted(messageEvent, src)) {
      if (_isSignal(messageEvent)) {
        const { name, args = {} } = messageEvent.data;
        _callEffect(name, args);
      }
    }
  }

  function _callEffect(name: string, args: Record<string, unknown>) {
    if (effects[name]) {
      effects[name]({ args, cb });
    } else {
      console.error(
        `[liaison] could not find an effect on the Parent model called "${name}"`
      );
    }
  }

  function destroy() {
    window.removeEventListener('message', _onMessageEvent);
  }

  function cb(signal: Signal) {
    const el = document.getElementById(id);
    if (el === null) {
      console.error(`[liaison] could not find an element with an id of ${id}`);
      return;
    }
    if (!isIFrame(el)) {
      console.error(
        `[liaison] found an element with an id of ${id}, but it was not an iframe. Instead, it was a ${el.nodeName}`
      );
      return;
    }
    if (el && el.contentWindow && isIFrame(el)) {
      el.contentWindow.postMessage(signal, src);
    } else {
      console.error(`[liaison] could not find an iframe with an id of ${id}`);
    }
  }

  function isIFrame(el: HTMLElement): el is HTMLIFrameElement {
    return el.nodeName === 'IFRAME';
  }
}

export function IFrame({ parentOrigin, effects }: IFrameOpts): Client {
  _init();

  return {
    cb,
    destroy,
  };

  function _init() {
    _validateUrl(parentOrigin);
    _validateEffects(effects);
    window.addEventListener('message', _onMessageEvent);
  }

  function destroy() {
    window.removeEventListener('message', _onMessageEvent);
  }

  function _onMessageEvent(messageEvent: MessageEvent) {
    if (_whitelisted(messageEvent, parentOrigin)) {
      if (_isSignal(messageEvent)) {
        const { name, args = {} } = messageEvent.data;
        _callEffect(name, args);
      }
    }
  }

  function _callEffect(name: string, args: Record<string, unknown>) {
    if (effects[name]) {
      effects[name]({ args, cb });
    } else {
      throw new Error(
        `Could not find an effect on the IFrame model called "${name}"`
      );
    }
  }

  function cb(signal: Signal) {
    if (top == null)
      throw new Error(
        'IFrame model must be rendered within an embedded iframe'
      );
    top.postMessage(signal, parentOrigin);
  }
}

function _whitelisted(messageEvent: MessageEvent, trustedOrigin: string) {
  return messageEvent.origin === trustedOrigin;
}

function _isSignal(e: MessageEvent): e is SignalEvent {
  if (e.data as Signal) {
    return true;
  }
  return false;
}

function _validateUrl(u: string) {
  if (!_validUrl(u)) throw new Error(`${u} is not a valid url`);
}

function _validUrl(u: string) {
  let url;
  try {
    url = new URL(u);
  } catch {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
}

function _validateEffects(effects: unknown) {
  if (typeof effects === 'object' && effects !== null) {
    const effectNames = Object.keys(effects);
    // TODO: Enforce better checking here to ensure that functions passed as effects match the Effect function signature.
    effectNames.forEach((name) => {
      const effect = effects[name as keyof typeof effects];
      const isEffect = typeof effect === 'function';
      if (!isEffect) throw new Error(`${name} is not a function`);
    });
  } else {
    throw new Error(
      'effects must be an object where each property is a function'
    );
  }
}
