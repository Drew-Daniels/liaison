import { useRef, useEffect } from 'react';
import {
  Parent,
  IFrame,
  ParentOpts,
  IFrameOpts,
  Signal,
  Client,
} from '@liaison/core';

/** Registers Effects that an iframe with an id of `id` and a src of `src` can enact on the parent window, and returns a `cb` function that can be used to enact events on an iframe */
export function useParent({ iframe: { id, src }, effects }: ParentOpts) {
  const parentRef = useRef<Client | null>(null);

  useEffect(() => {
    parentRef.current = Parent({
      iframe: {
        id,
        src,
      },
      effects,
    })
    return () => {
      if (parentRef.current) {
        parentRef.current.destroy();
        parentRef.current = null;
      }
    }
  }, [effects, id, src]);

  return {
    cb,
  }

  function cb(signal: Signal) {
    if (parentRef.current) {
      parentRef.current.cb(signal);
    }
  }
}

/** Registers Effects that a parent window with an origin of `parentOrigin` can enact on the iframe, and returns a `cb` function that can be used to enact events on a parent window */
export function useIFrame({ parentOrigin, effects }: IFrameOpts) {
  const iFrameModelRef = useRef<Client | null>(null);

  useEffect(() => {
    iFrameModelRef.current = IFrame({
      parentOrigin,
      effects,
    });

    return () => {
      if (iFrameModelRef.current) {
        iFrameModelRef.current.destroy();
        iFrameModelRef.current = null
      }
    };
  }, [effects, parentOrigin]);

  return {
    cb,
  }

  function cb(signal: Signal) {
    if (iFrameModelRef.current) {
      iFrameModelRef.current.cb(signal);
    }
  }
}
