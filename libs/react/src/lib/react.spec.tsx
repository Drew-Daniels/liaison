import { useIFrameContract, useParentContract } from './react';
import { vi } from 'vitest';
import { renderHook } from '@testing-library/react';

vi.mock('@liaison/core', () => {
  const ParentContract = vi.fn();
  ParentContract.prototype.cb = vi.fn();
  ParentContract.prototype.destroy = vi.fn();

  const IFrameContract = vi.fn();
  IFrameContract.prototype.cb = vi.fn();
  IFrameContract.prototype.destroy = vi.fn();

  return {
    ParentContract,
    IFrameContract,
  };
});

describe('useParentContract', () => {
  it('should return a callback function', () => {
    const { result } = renderHook(() =>
      useParentContract({
        iframeId: 'id',
        iframeSrc: 'src',
        effects: {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          myCustomEffect: () => {},
        },
      })
    );
    expect(result.current.cb).toBeInstanceOf(Function);
  });
});

describe('useIFrameContract', () => {
  it('should return a callback function', () => {
    const { result } = renderHook(() =>
      useIFrameContract({
        targetOrigin: 'targetOrigin',
        effects: {
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          myCustomEffect: () => {},
        },
      })
    );
    expect(result.current.cb).toBeInstanceOf(Function);
  });
});
