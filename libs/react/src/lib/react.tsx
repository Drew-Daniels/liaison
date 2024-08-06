import { useRef, useEffect } from 'react';
import {
  ParentContract,
  IFrameContract,
  ParentOpts,
  IFrameOpts,
  Signal,
  Client,
} from '@liaison/core';

/** Registers Effects that an iframe with an id of `id` and a src of `src` can enact on the parent window, and returns a `cb` function that can be used to enact events on an iframe */
export function useParentContract({ iframeId, iframeSrc, effects }: ParentOpts) {
  const parentRef = useRef<Client | null>(null);

  useEffect(() => {
    parentRef.current = new ParentContract(iframeId, iframeSrc, effects);
    return () => {
      if (parentRef.current) {
        parentRef.current.destroy();
        parentRef.current = null;
      }
    };
  }, [effects, iframeId, iframeSrc]);

  return {
    cb,
  };

  function cb(signal: Signal) {
    if (parentRef.current) {
      parentRef.current.cb(signal);
    }
  }
}

/** Registers Effects that a parent window with an origin of `targetOrigin` can enact on the iframe, and returns a `cb` function that can be used to enact events on a parent window */
export function useIFrameContract({ targetOrigin, effects }: IFrameOpts) {
  const iFrameModelRef = useRef<Client | null>(null);

  useEffect(() => {
    iFrameModelRef.current = new IFrameContract(targetOrigin, effects);

    return () => {
      if (iFrameModelRef.current) {
        iFrameModelRef.current.destroy();
        iFrameModelRef.current = null;
      }
    };
  }, [effects, targetOrigin]);

  return {
    cb,
  };

  function cb(signal: Signal) {
    if (iFrameModelRef.current) {
      iFrameModelRef.current.cb(signal);
    }
  }
}
