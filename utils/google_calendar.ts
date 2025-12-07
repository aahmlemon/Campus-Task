import { supabase } from '@/lib/supabaseClient';

export async function fetchCalendarEvents() {
    const { data: { session } } = await supabase.auth.getSession();

    // LOGGING FOR DEBUGGING
    console.log("🔍 Checking Google Session...");

    const providerToken = session?.provider_token;

    if (!providerToken) {
        console.warn("No Google Provider Token found in session.");
        console.log("Suggestion: Sign Out and Sign In again to refresh the token.");
        return [];
    }

    console.log("Provider Token found! Fetching events...");

    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const response = await fetch(
            `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startOfDay.toISOString()}&timeMax=${endOfDay.toISOString()}&singleEvents=true&orderBy=startTime`,
            {
                headers: {
                    Authorization: `Bearer ${providerToken}`,
                },
            }
        );

        if (!response.ok) {
            // Try to parse the specific error message from Google
            const errorBody = await response.json().catch(() => null);
            console.error("Google API Error:", response.status, response.statusText, JSON.stringify(errorBody, null, 2));

            // Common 403 hints
            if (response.status === 403) {
                console.error("Hint: Did you add your email to 'Test Users' in Google Cloud Console?");
                console.error("Hint: Did you enable the 'Google Calendar API' in the Library?");
            }
            return [];
        }

        const data = await response.json();
        console.log(`Found ${data.items?.length || 0} events from Google.`);

        if (data.items) {
            return data.items.map((event: any) => ({
                title: event.summary || "(No Title)",
                start: new Date(event.start.dateTime || event.start.date),
                end: new Date(event.end.dateTime || event.end.date)
            }));
        }

        return [];

    } catch (error) {
        console.error("Error fetching Google Calendar:", error);
        return [];
    }
}