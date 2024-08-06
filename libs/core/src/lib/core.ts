import { Effect, Signal } from '@liaison/types';
import { isSignal, validateEffects, validateUrl } from '@liaison/utils';

export class ClientContract {
  readonly effects: Record<string, Effect>;
  readonly targetOrigin: string;

  constructor(targetOrigin: string, effects: Record<string, Effect>) {
    this.targetOrigin = validateUrl(targetOrigin);
    this.effects = validateEffects(effects);
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

  protected onMessageEvent = (messageEvent: MessageEvent) => {
    if (this.isWhitelisted(messageEvent)) {
      if (isSignal(messageEvent)) {
        const { name, args = {} } = messageEvent.data;
        this.callEffect(name, args);
      }
    }
  };

  private callEffect(name: string, args: Record<string, unknown>) {
    if (this.effects[name]) {
      this.effects[name]({ args, cb: this.cb });
    } else {
      console.error(
        `[liaison] could not find an effect on the ${this.constructor.name} model called "${name}"`
      );
    }
  }

  private isWhitelisted(messageEvent: MessageEvent) {
    return messageEvent.origin === this.targetOrigin;
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
