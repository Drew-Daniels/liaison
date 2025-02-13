import { Effect, Signal } from '@liaison/types';
import {
  getIFrameById,
  isSignal,
  validateEffects,
  validateUrl,
} from '@liaison/utils';

abstract class Contract {
  readonly effects: Record<string, Effect>;
  readonly targetOrigin: string;

  constructor(targetOrigin: string, effects: Record<string, Effect>) {
    this.targetOrigin = validateUrl(targetOrigin);
    this.effects = validateEffects(effects);
  }

  abstract cb(this: Contract, signal: Signal): void;

  destroy() {
    window.removeEventListener('message', this.onMessageEvent);
  }

  protected onMessageEvent = (messageEvent: MessageEvent) => {
    if (this.isWhitelisted(messageEvent) && isSignal(messageEvent)) {
      const { name, args = {} } = messageEvent.data;
      this.callEffect(name, args);
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

/**
 * `ParentContract` is used to define a contract with an embedded iframe with an id of `iframeId` and an origin of `targetOrigin`
 * All the effects defined in the parent contract are ones that the iframe window can request be called at any time in the parent
 */
export class ParentContract extends Contract {
  private readonly iframe: HTMLIFrameElement;

  constructor(
    iframeId: string,
    targetOrigin: string,
    effects: Record<string, Effect>
  ) {
    super(targetOrigin, effects);
    this.iframe = getIFrameById(iframeId);
    window.addEventListener('message', this.onMessageEvent);
  }

  cb(this: ParentContract, signal: Signal) {
    this.iframe.contentWindow?.postMessage(signal, this.targetOrigin);
  }
}

/**
 * The `IFrameContract` class is used to define a contract with a parent window with an origin of `targetOrigin`
 * All the effects defined in the iframe contract are ones that the parent window can request be called at any time in the iframe
 */
export class IFrameContract extends Contract {
  constructor(targetOrigin: string, effects: Record<string, Effect>) {
    super(targetOrigin, effects);
    window.addEventListener('message', this.onMessageEvent);
  }

  cb(this: IFrameContract, signal: Signal) {
    if (top == null)
      throw new Error(
        'IFrame model must be rendered within an embedded iframe'
      );
    top.postMessage(signal, this.targetOrigin);
  }
}
