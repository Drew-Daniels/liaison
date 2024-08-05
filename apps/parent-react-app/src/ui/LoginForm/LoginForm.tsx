import { Button } from '@liaison/ui';

export interface FormElements extends HTMLFormControlsCollection {
  userEmail: HTMLInputElement;
  userPassword: HTMLInputElement;
}

export interface LoginFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export type LoginFormEvent = React.FormEvent<LoginFormElement>;

export function LoginForm({
  onSubmit,
}: React.FormHTMLAttributes<LoginFormElement>) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col border-2 rounded p-4 my-4 text-center w-full"
    >
      <h3>Login Form</h3>
      <p>
        This is a fake login form that, when submitted will send a{' '}
        <a
          href="https://developer.mozilla.org/en-US/docs/Web/API/MessageEvent"
          target="_blank"
          rel="noreferrer"
        >
          MessageEvent
        </a>
        {' '}
        to the embedded iframe with the email of the user that just "logged in".
      </p>
      <div className="flex flex-col text-left">
        <label htmlFor="userEmail">Email:</label>
        <input id="userEmail" type="email" className="border-2 rounded grow" />
        <label htmlFor="userPassword">Password:</label>
        <input id="userPassword" type="password" className="border-2 rounded" />
      </div>
      <Button type="submit" className="mt-4">
        Submit
      </Button>
    </form>
  );
}
