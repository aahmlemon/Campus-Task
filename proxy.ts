import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    // 1. Create an initial unmodified response
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    // 2. Create the Supabase client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    // If the supabase client updates the cookie, we must update the request AND response
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    // 3. Check the Session
    // This refreshes the session if needed (magic of the new library)
    const { data: { session } } = await supabase.auth.getSession();

    // -------------------------------------------------------------
    // YOUR CUSTOM REDIRECT LOGIC
    // -------------------------------------------------------------

    // A. Guard Protected Routes: If NOT logged in -> Go to Login
    if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // B. Guard Auth Routes: If ALREADY logged in -> Go to Dashboard
    if (session && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return response;
}