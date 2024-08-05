import { render } from '@testing-library/react';

import { Button } from './ui';

describe('Button', () => {
  it('should render successfully', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const { baseElement } = render(<Button onClick={() => {}} />);
    expect(baseElement).toBeTruthy();
  });
});
