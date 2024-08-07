import { useParentContract } from '@liaison/react';

import { Button } from '@liaison/ui';
import { LoginForm } from '../ui';
import { useState } from 'react';

const IFRAME_ID = 'my-embedded-iframe';

export function App() {
  const [email, setEmail] = useState('');

  const { cb: callIFrameEffect } = useParentContract({
    iframeId: IFRAME_ID,
    iframeSrc: import.meta.env.VITE_IFRAME_URL,
    // define effects that the iframe can call on the parent
    // this effect will be called by the iframe when we click the logout button within the iframe
    effects: {
      onIFrameLogout: () => {
        setEmail('');
      },
    },
  });

  return (
    <div className="h-screen flex justify-center">
      <div className="flex flex-col items-center max-w-screen-sm h-full m-8 gap-4">
        <h1 className="text-2xl">
          <code>@liaison/react</code> Demo
        </h1>
        <p className="text-center">
          This is a simple demo application that demonstrates how{' '}
          <code>@liaison/react</code> can be used to securely share data between
          applications and embedded iframes hosted on different origins.
        </p>
        {email && (
          <div className="flex flex-col justify-center text-center gap-4">
            <h2>Logged in as: {email}</h2>
            <Button
              onClick={() => {
                setEmail('');
                callIFrameEffect({
                  name: 'onParentWindowLogout',
                });
              }}
            >
              Logout User (from Parent)
            </Button>
          </div>
        )}
        {!email && (
          <LoginForm
            onSubmit={(e) => {
              e.preventDefault();
              const { userEmail } = e.currentTarget.elements;

              // update internal parent application state
              setEmail(userEmail.value);

              // send a MessageEvent to the iframe application with information about the user that just "logged in"
              callIFrameEffect({
                name: 'onParentWindowLogin',
                args: {
                  email: userEmail.value,
                },
              });
            }}
          />
        )}
        <div className="w-full">
          <iframe
            id={IFRAME_ID}
            title="Embedded IFrame"
            src={import.meta.env.VITE_IFRAME_URL}
            className="border-2 border-dotted w-full"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
