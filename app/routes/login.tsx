import { Form, ActionFunction, MetaFunction, json } from 'remix';
import { createUserSession, login } from '~/utils/session.server';

export const meta: MetaFunction = () => {
  return {
    title: 'Login',
    description: 'Login page',
  };
};

type ActionData = {
  formError?: string;
  fieldErrors?: {
    email?: string;
    password?: string;
    name?: string;
  };
  fields?: {
    email?: string;
    password?: string;
    name?: string;
  };
};

const validateEmail = (email: string) => {
  if (email.length < 3) {
    return 'Emails must be at least 3 characters long';
  }
};

const validatePassword = (password: string) => {
  if (password.length < 6) {
    return 'Passwords must be at least 6 characters long';
  }
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const email = form.get('email');
  const password = form.get('password');
  const name = form.get('name');

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    typeof name !== 'string'
  ) {
    return badRequest({ formError: 'Form not submitted correctly' });
  }

  const fieldErrors = {
    email: validateEmail(email),
    password: validatePassword(password),
    name: undefined,
  };
  const fields = { email, password, name };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  const { user, error } = await login({ email, password, name });
};

export default function Login() {
  return (
    <div>
      <h1>This is the Login route</h1>
      <Form method="post">
        <label htmlFor="email-input">Email</label>
        <input type="email" name="email" id="email-input" />
        <label htmlFor="name-input">First Name</label>
        <input type="text" name="name" id="name-input" />
        <label htmlFor="password-input">Password</label>
        <input type="text" name="password" id="password-input" />
        <button type="submit" className="button">
          Submit
        </button>
      </Form>
    </div>
  );
}
