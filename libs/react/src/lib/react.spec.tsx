import { useIFrame, useParent } from './react';
import { vi } from 'vitest';
import { renderHook } from '@testing-library/react';

vi.mock('@liaison/core', () => {
  const Parent = vi.fn();
  Parent.prototype.cb = vi.fn();
  Parent.prototype.destroy = vi.fn();

  const IFrame = vi.fn();
  IFrame.prototype.cb = vi.fn();
  IFrame.prototype.destroy = vi.fn();

  return {
    Parent,
    IFrame,
  };
});

describe('useParent', () => {
  it('should return a callback function', () => {
    const { result } = renderHook(() =>
      useParent({
        iframe: {
          id: 'id',
          src: 'src',
        },
        effects: {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          myCustomEffect: () => {},
        },
      })
    );
    expect(result.current.cb).toBeInstanceOf(Function);
  });
});

describe('useIFrame', () => {
  it('should return a callback function', () => {
    const { result } = renderHook(() =>
      useIFrame({
        parentOrigin: 'parentOrigin',
        effects: {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          myCustomEffect: () => {},
        },
      })
    );
    expect(result.current.cb).toBeInstanceOf(Function);
  });
});
