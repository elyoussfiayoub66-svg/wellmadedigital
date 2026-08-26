// Meta Pixel Abstraction

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export const pageview = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  } else if (!META_PIXEL_ID) {
    console.log('[Meta Pixel Mock] PageView');
  }
};

// https://developers.facebook.com/docs/facebook-pixel/advanced/
export const event = (name, options = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    const isCustom = [
      'LandingPageView',
      'CTA_Click',
      'Form_Start',
      'Form_Step_1',
      'Form_Step_2',
      'Form_Step_3',
      'Form_Step_4',
      'Form_Step_5',
      'Form_Submit',
      'ThankYou_View',
      'Demo_Booked'
    ].includes(name);

    if (isCustom) {
      window.fbq('trackCustom', name, options);
    } else {
      window.fbq('track', name, options);
    }
  } else if (!META_PIXEL_ID) {
    console.log(`[Meta Pixel Mock] ${name}`, options);
  }
};
