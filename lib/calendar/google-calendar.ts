import { google } from 'googleapis';

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    throw new Error('Google Calendar credentials not configured');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function isGoogleCalendarConfigured(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CALENDAR_ID
  );
}

export async function createCalendarEvent(params: {
  accessToken: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // "9:00 AM" format
  platform: string;
}): Promise<{ eventId: string; htmlLink: string }> {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: params.accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  // Parse time string (e.g., "9:00 AM") to 24h format
  const startDateTime = parsePublishDateTime(params.date, params.time);
  const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000); // 30 min duration

  const event = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: `[${params.platform}] ${params.title}`,
      description: params.description,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/Denver',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/Denver',
      },
      colorId: getPlatformColorId(params.platform),
    },
  });

  return {
    eventId: event.data.id || '',
    htmlLink: event.data.htmlLink || '',
  };
}

export async function updateCalendarEvent(params: {
  accessToken: string;
  eventId: string;
  title?: string;
  description?: string;
}): Promise<void> {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: params.accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  const updateBody: Record<string, string> = {};
  if (params.title) updateBody.summary = params.title;
  if (params.description) updateBody.description = params.description;

  await calendar.events.patch({
    calendarId,
    eventId: params.eventId,
    requestBody: updateBody,
  });
}

export async function deleteCalendarEvent(params: {
  accessToken: string;
  eventId: string;
}): Promise<void> {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ access_token: params.accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  await calendar.events.delete({
    calendarId,
    eventId: params.eventId,
  });
}

function parsePublishDateTime(dateStr: string, timeStr: string): Date {
  // Parse "9:00 AM" format
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    // Fallback: treat as 9:00 AM
    return new Date(`${dateStr}T09:00:00`);
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return new Date(`${dateStr}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`);
}

export async function createCalendarEventWithRefreshToken(params: {
  refreshToken: string;
  title: string;
  description: string;
  date: string;
  time: string;
  platform: string;
}): Promise<{ eventId: string; htmlLink: string }> {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: params.refreshToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  const startDateTime = parsePublishDateTime(params.date, params.time);
  const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000);

  const event = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: `[${params.platform}] ${params.title}`,
      description: params.description,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'America/Denver',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'America/Denver',
      },
      colorId: getPlatformColorId(params.platform),
    },
  });

  return {
    eventId: event.data.id || '',
    htmlLink: event.data.htmlLink || '',
  };
}

function getPlatformColorId(platform: string): string {
  // Google Calendar color IDs
  switch (platform) {
    case 'IGFB': return '7';     // Peacock (cyan)
    case 'LinkedIn': return '1'; // Lavender (blue)
    case 'Blog': return '9';     // Blueberry (indigo)
    case 'YouTube': return '11'; // Tomato (red)
    case 'X': return '8';        // Graphite (gray)
    default: return '0';
  }
}
