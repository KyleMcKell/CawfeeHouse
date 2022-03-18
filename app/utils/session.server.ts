import { ApiError, User } from '@supabase/supabase-js';
import { createCookieSessionStorage, redirect } from 'remix';
import { supabase } from './db.server';

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set!');
}

const { commitSession, destroySession, getSession } =
  createCookieSessionStorage({
    cookie: {
      name: 'sb:token',
      httpOnly: true,
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      path: '/',
      sameSite: 'lax',
      secrets: [sessionSecret],
      secure: true,
    },
  });

export const register = async ({ email, password, name }: LoginForm) => {
  const { user, error } = await supabase.auth.signUp({
    email,
    password,
  });
};

type LoginForm = { email: string; name: string; password: string };

type LoginReturn = Promise<{ user: User | null; error: ApiError | null }>;

export const login = async ({ email, password }: LoginForm): LoginReturn => {
  const { user, error, session } = await supabase.auth.signIn({
    email,
    password,
  });

  if (error) return { user: null, error };
  if (!session)
    return {
      user: null,
      error: { message: `Session not created, we don't know why`, status: 500 },
    };

  createUserSession(session.access_token);

  return { user, error: null };
};

export const logout = async (request: Request) => {
  const session = await getUserSession(request);
  return redirect('/login', {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  });
};

export const createUserSession = async (
  token: string,
  redirectTo: string = '/',
) => {
  const session = await getSession();
  session.set('access_token', token);

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
};

export const getUserSession = (request: Request) => {
  return getSession(request.headers.get('Cookie'));
};

export const getLoggedInUser = async (request: Request) => {
  const token = await getToken(request);
  if (!token) return null;

  const { user } = await supabase.auth.api.getUser(token);
  return user;
};

export const getToken = async (request: Request) => {
  const session = await getUserSession(request);

  const accessToken = session.get('access_token');
  if (!accessToken || typeof accessToken !== 'string') return null;

  return accessToken;
};

export const syncAuth = async (request: Request) => {
  const session = await getSession(request.headers.get('Cookie'));
  if (!session.has('access_token')) throw Error('No Session');
  supabase.auth.setAuth(session.get('access_token'));
};
