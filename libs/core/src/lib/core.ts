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

interface BaseClientOpts {
  effects: Record<string, Effect>;
}

export interface ParentOpts extends BaseClientOpts {
  iframeId: string;
  iframeSrc: string;
}

export interface IFrameOpts extends BaseClientOpts {
  // TODO: Add support for multiple whitelisted URLs - in cases where the iFrame could be used in different sites
  /** The URL where your iframe expects to receive messages from: https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#targetorigin */
  targetOrigin: string;
}

export class ClientContract {
  readonly effects: Record<string, Effect>;
  readonly targetOrigin: string;

  constructor(targetOrigin: string, effects: Record<string, Effect>) {
    this.targetOrigin = this.validateUrl(targetOrigin);
    this.effects = this.validateEffects(effects);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public cb(this: ClientContract, signal: Signal) {
    throw new Error(
      'Client model must implement a callback function to receive signals'
    );
  }

  public destroy() {
    window.removeEventListener('message', this.onMessageEvent);
  }

  // Have to use arrow function here to preserve `this`
  protected onMessageEvent = (messageEvent: MessageEvent) => {
    if (this.isWhitelisted(messageEvent)) {
      if (this.isSignal(messageEvent)) {
        const { name, args = {} } = messageEvent.data;
        this.callEffect(name, args);
      }
    }
  }

  private callEffect(name: string, args: Record<string, unknown>) {
    if (this.effects[name]) {
      this.effects[name]({ args, cb: this.cb });
    } else {
      console.error(
        `[liaison] could not find an effect on the ${this.constructor.name} model called "${name}"`
      );
    }
  }

  private isSignal(e: MessageEvent): e is SignalEvent {
    if (e.data as Signal) {
      return true;
    }
    return false;
  }

  private isWhitelisted(messageEvent: MessageEvent) {
    return messageEvent.origin === this.targetOrigin;
  }

  private validateUrl(url: string) {
    if (!this.isValidUrl(url)) {
      throw new Error(`${url} is not a valid url`);
    }
    return url;
  }

  private isValidUrl(src: string) {
    let url;
    try {
      url = new URL(src);
    } catch {
      return false;
    }
    return url.protocol === 'http:' || url.protocol === 'https:';
  }

  private validateEffects(effects: Record<string, Effect>) {
    Object.values(effects).forEach((effect) => {
      if (typeof effect !== 'function') {
        throw new Error(`${effect} is not a valid effect`);
      }
    });
    return effects;
  }
}

export class ParentContract extends ClientContract {
  private readonly iframe: HTMLIFrameElement;

  constructor(
    iframeId: string,
    targetOrigin: string,
    effects: Record<string, Effect>
  ) {
    super(targetOrigin, effects);
    this.iframe = this.getIFrameFromId(iframeId);
    window.addEventListener('message', this.onMessageEvent);
  }

  public override cb(this: ParentContract, signal: Signal) {
    this.iframe.contentWindow?.postMessage(signal, this.targetOrigin);
  }

  private getIFrameFromId(id: string) {
    const el = document.getElementById(id);
    if (!this.isIFrame(el)) {
      throw new Error(
        `An iframe with an id of ${id} could not be found on the page`
      );
    }
    return el;
  }

  private isIFrame(el: HTMLElement | null): el is HTMLIFrameElement {
    return el !== null && el.nodeName === 'IFRAME';
  }
}

export class IFrameContract extends ClientContract {
  constructor(targetOrigin: string, effects: Record<string, Effect>) {
    super(targetOrigin, effects);
    window.addEventListener('message', this.onMessageEvent);
  }

  public override cb(this: IFrameContract, signal: Signal) {
    if (top == null)
      throw new Error(
        'IFrame model must be rendered within an embedded iframe'
      );
    top.postMessage(signal, this.targetOrigin);
  }
}
