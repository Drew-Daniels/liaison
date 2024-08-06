# Liaison
_Liaison_ is a simple library with 0 dependencies that enables easy, secure communication between a browser window and embedded iframes, using the browser [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) API.

> The window.postMessage() method safely enables cross-origin communication between Window objects; e.g., between a page and a pop-up that it spawned, or between a page and an iframe embedded within it.

### Use Case
The `postMessage` API allows for easy cross-origin resource sharing between windows and embedded applications, however you still need to:
- Manually create event listeners that listen for `MessageEvents` from specific origins
- Manage removal of event listeners where necessary - such as in `React` applications, where you need to ensure that they are removed when a component is unmounted
- Define an API contract between window and iframe code that can be used to reliably transmit data across applications
  - This is especially difficult if you only have control over one application's code

`liaison` makes it easy to just define who you expect to receive messages from, and how you want these messages to be handled when they occur without needing to worry about all of the other implementation details around using the `postMessage` API.

### Examples

#### Authentication
Often times the user using the parent window application will be associated in some way to the user using the embedded application, so it's helpful to have some sort of mechanism that allows information about the user to be shared across these applications. This could be anything from metadata about the user, or authorization tokens allowing the embedded application to authenticate with some external API on behalf of that user.

#### Events
When you want some event to occur in one application as a result of something happening in the other. An example could be that when an application is loaded in an iframe, you want it to request the parent application for the authorization token belonging to the user using the parent window application. You could use `liaison` to dispatch a `MessageEvent` to the parent window that will result in the authorization token being sent back to the iframe application.

### `ParentContact` Model
The `ParentContract` model is used to define functions (`Effects`) that can be run in the parent application whenever the iframe application requests they be run.

### `IFrameContract` Model
The `IFrameContract` model is used to define functions (`Effects`) that can be run the iframe application whenever the parent application requests they be run.

#### Effects
An `Effect` is a function defined on one model, that the the other model can request be called at anytime. These functions can be synchronous or asynchronous.

```js

// In the iframe application code, we use the "IFrameContract" class to:
// - initialize event listeners for any MessageEvents that come from the parent window with an origin of "https://my-application.com"
// - get a reference to a callback function, "cb" so we can dispatch MessageEvents to the parent window with an origin of "https://my-application.com"
const { cb: callParentEffect } = new IFrameContract({
  targetOrigin: 'https://my-application.com',
  effects: {
    onParentLogout: () => {
      setUser(null);
    }
  }
})

// Here we are defining a function that, when called, will update the internal state of the iframe application, as well as notify the parent application that the user has logged out in the iframe
function logout() {
  setUser(null);
  callParentEffect({
    name: 'onIFrameLogout'
  })
}

// In the parent application code, we use the "ParentContract" class to:
// - initialize event listeners for any MessageEvents that come from the iframe window with an id of "my-embedded-iframe" and origin of "https://my-iframe-application.com"
// - get a reference to a callback function, "cb" so we can dispatch MessageEvents to this iframe application

const { cb: callIFrameEffect } = new ParentContract({
    iframeId: 'my-embedded-iframe',
    iframeSrc: 'https://my-iframe-application.com',
    effects: {
      onIFrameLogout: () => {
        setUser(null)
      },
    }
});

function login() {
  callIFrameEffect({
    name: 'onParentLogin',
    args: {
      email: 'user@email.com'
    }
  })
}

function logout() {
  callIFrameEffect({
    name: 'onParentLogout',
    args: {}
  })
}
```

#### Message Handling (`Signals`)
When the parent window receives a [MessageEvent](https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent), the Parent model checks if:
- If the MessageEvent has an `origin` exactly matching `src`. 
    - If the message has _any other origin_ than `src`, it is completely ignored.
- If the `origin` matches `src`, the Parent model checks to ensure that the data passed in the `MessageEvent` matches the expected API (i.e., contains a `Signal`)
- If the `MessageEvent` contains a `Signal`, this `Signal` is then used to call a corresponding `Effect` on the IFrame model.
