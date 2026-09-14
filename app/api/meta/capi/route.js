import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { eventName, eventData, userData, eventId } = body;

    const PIXEL_ID = '720698980383477'; // Dataset_ID from instructions
    const ACCESS_TOKEN = process.env.META_CAPI_TOKEN;

    if (!ACCESS_TOKEN) {
      console.log('[Meta CAPI Mock] Server-side event ignored (missing token):', eventName);
      return NextResponse.json({ success: true, mocked: true });
    }

    const crypto = require('crypto');
    const hash = (val) => {
      if (!val) return undefined;
      return crypto.createHash('sha256').update(val.trim().toLowerCase()).digest('hex');
    };

    const hashedUserData = {};
    const hashedEm = userData.email ? hash(userData.email) : null;
    const hashedPh = userData.phone ? hash(userData.phone) : null;
    
    if (hashedEm) hashedUserData.em = [hashedEm];
    if (hashedPh) hashedUserData.ph = [hashedPh];

    // Pass lead_id if it's available (it's recommended by Meta)
    if (userData.lead_id) {
      hashedUserData.lead_id = userData.lead_id;
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);

    const payload = {
      data: [
        {
          action_source: "system_generated",
          custom_data: {
            event_source: "crm",
            lead_event_source: "Wellmade CRM",
            ...eventData
          },
          event_name: eventName,
          event_time: currentTimestamp,
          event_id: eventId,
          user_data: hashedUserData
        }
      ]
    };

    const response = await fetch(`https://graph.facebook.com/v26.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Meta CAPI Error:', result);
      return NextResponse.json({ success: false, error: result }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error sending event to Meta CAPI:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
