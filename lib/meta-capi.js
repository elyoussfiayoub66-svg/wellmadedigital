import crypto from 'crypto';

/**
 * Hashes data using SHA256 as required by Meta CAPI
 */
const hashData = (data) => {
  if (!data) return undefined;
  return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
};

/**
 * Sends an event to Meta Conversions API
 * @param {string} eventName The name of the event (e.g. 'Lead', 'Contacted')
 * @param {object} leadData The lead's data (email, phone, etc.)
 */
export const sendCapiEvent = async (eventName, leadData) => {
  const token = process.env.META_CAPI_TOKEN;
  const datasetId = '1405985668164595';
  
  if (!token) {
    console.warn('No META_CAPI_TOKEN found, skipping CAPI event.');
    return;
  }

  const unixTime = Math.floor(Date.now() / 1000);

  // Clean up phone number: remove non-numeric chars
  let phoneRaw = leadData.phone || leadData.whatsapp;
  let cleanPhone = phoneRaw ? phoneRaw.replace(/[^0-9]/g, '') : '';
  
  const user_data = {};

  if (leadData.email) user_data.em = [hashData(leadData.email)];
  if (cleanPhone) user_data.ph = [hashData(cleanPhone)];
  
  // If we have fbclid or Meta's lead_id, include it
  if (leadData.lead_id) user_data.lead_id = leadData.lead_id;

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: unixTime,
        action_source: 'system_generated',
        user_data: user_data,
        custom_data: {
          event_source: 'crm',
          lead_event_source: 'WellmadeDigital CRM'
        }
      }
    ]
  };

  try {
    const response = await fetch(`https://graph.facebook.com/v26.0/${datasetId}/events?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    console.log(`CAPI Response for [${eventName}]:`, result);
    return result;
  } catch (error) {
    console.error(`CAPI Error for [${eventName}]:`, error);
  }
};
