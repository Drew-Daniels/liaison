type Effect = (params: {
  cb: (signal: Signal) => void;
  args: Record<string, unknown>;
}) => void;

interface SignalEvent extends MessageEvent {
  data: Signal;
}

interface Signal {
  name: string;
  args?: Record<string, unknown>;
}

interface Client {
  cb: (signal: Signal) => void;
  destroy: () => void;
}

type Hook = Omit<Client, 'destroy'>;

interface BaseClientOpts {
  effects: Record<string, Effect>;
}

interface ParentOpts extends BaseClientOpts {
  iframeId: string;
  iframeSrc: string;
}

interface IFrameOpts extends BaseClientOpts {
  targetOrigin: string;
}

export {
  Effect,
  SignalEvent,
  Signal,
  Client,
  Hook,
  BaseClientOpts,
  ParentOpts,
  IFrameOpts,
}

