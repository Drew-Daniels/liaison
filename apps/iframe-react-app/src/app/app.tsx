import { useState } from 'react';

import { useIFrame } from '@liaison/react';
import { Button } from '@liaison/ui';

function App() {
  const [email, setEmail] = useState('');

  const { cb: callParentEffect } = useIFrame({
    parentOrigin: import.meta.env.VITE_PARENT_WINDOW_URL,
    // define the effects that the parent window can call on the iframe
    effects: {
      onParentWindowLogin: ({ args: { email } }) => {
        if (email && typeof email === 'string') {
          setEmail(email);
        } else {
          // callParentEffect({ name: 'onLoginFailed' });
        }
      },
      onParentWindowLogout: () => {
        setEmail('');
      },
    },
  });

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      {!email && <p>Logged out</p>}
      {email && (
        <div className="flex flex-col items-center justify-center gap-4">
          <p>Logged in as: {email}</p>
          <Button
            onClick={() => {
              setEmail('');
              callParentEffect({
                name: 'onIFrameLogout',
              });
            }}
          >
            Logout User (from iframe)
          </Button>
        </div>
      )}
    </div>
  );
}

export default App;