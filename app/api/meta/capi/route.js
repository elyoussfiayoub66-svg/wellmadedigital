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

    const hashedUserData = {
      client_ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '0.0.0.0',
      client_user_agent: request.headers.get('user-agent') || '',
    };
    
    const hashedEm = userData.email ? hash(userData.email) : null;
    const hashedPh = userData.phone ? hash(userData.phone) : null;
    
    if (hashedEm) hashedUserData.em = [hashedEm];
    if (hashedPh) hashedUserData.ph = [hashedPh];

    if (userData.lead_id) {
      hashedUserData.lead_id = userData.lead_id;
    }

    // Capture fbp and fbc from cookies if sent by frontend
    if (userData.fbp) hashedUserData.fbp = userData.fbp;
    if (userData.fbc) hashedUserData.fbc = userData.fbc;
    if (userData.external_id) hashedUserData.external_id = userData.external_id;

    const currentTimestamp = Math.floor(Date.now() / 1000);

    const payload = {
      data: [
        {
          action_source: userData.action_source || "website",
          custom_data: {
            event_source: "crm",
            lead_event_source: "Wellmade CRM",
            ...eventData
          },
          event_name: eventName,
          event_time: currentTimestamp,
          event_id: eventId, // Important for deduplication with pixel
          user_data: hashedUserData
        }
      ]
    };

    const response = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
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
