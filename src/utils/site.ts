// Address, hours and opening date come from the salon's launch posts. Phone, email and prices are still placeholders.
export const BUSINESS = {
  name: 'Honey & Silk Hair',
  openingDate: 'Monday 30 November',
  email: 'hello@honeyandsilk.co.uk',
  phoneDisplay: '01234 567890',
  phoneHref: '+441234567890',
  address: ['4a Barton Street', 'Tewkesbury', 'Gloucestershire', 'GL20 5PP'],
  // Google Maps place "Honey and Silk", from https://maps.app.goo.gl/8WPkYLDG8uiwZLAZ7
  map: {
    link: 'https://maps.app.goo.gl/8WPkYLDG8uiwZLAZ7',
    embed:
      'https://www.google.com/maps/embed?origin=mfe&pb=!1m12!1m8!1m3!1d2456.7828394593444!2d-2.1571149!3d51.9926103!3m2!1i1024!2i768!4f13.1!2m1!1sHoney+and+Silk,+4a+Barton+Street,+Tewkesbury+GL20+5PP!6i17',
  },
  openingHours: [
    { days: 'Monday', hours: '9am to 5pm' },
    { days: 'Tuesday', hours: '11am to 8pm' },
    { days: 'Wednesday', hours: '9am to 5pm' },
    { days: 'Thursday', hours: '11am to 8pm' },
    { days: 'Friday', hours: '10am to 5pm' },
    { days: 'Saturday', hours: 'By appointment only' },
  ],
} as const;

// Google Analytics 4 measurement ID. PUBLIC_GA_MEASUREMENT_ID overrides it; set that to an empty string to turn
// analytics off. Analytics is only in production builds, and loads only after the visitor accepts analytics cookies.
export const GA_MEASUREMENT_ID = 'G-0JEDELNDEM';

export const SERVICES = [
  {
    title: 'Cuts and styling',
    description: 'Precision cuts and finishes for every hair type.',
    icon: 'tabler:scissors',
    items: [
      { name: "Women's cut and finish", price: 'From £45' },
      { name: "Men's cut", price: 'From £25' },
      { name: "Children's cut", price: 'From £18' },
      { name: 'Blow dry', price: 'From £28' },
    ],
  },
  {
    title: 'Colour',
    description: 'From soft glosses to full colour changes.',
    icon: 'tabler:palette',
    items: [
      { name: 'Root tint', price: 'From £55' },
      { name: 'Half head highlights', price: 'From £75' },
      { name: 'Full head highlights', price: 'From £95' },
      { name: 'Balayage', price: 'From £120' },
    ],
  },
  {
    title: 'Treatments',
    description: 'Restore shine, strength and softness.',
    icon: 'tabler:droplet',
    items: [
      { name: 'Deep conditioning treatment', price: 'From £20' },
      { name: 'Keratin smoothing', price: 'From £150' },
    ],
  },
  {
    title: 'Special occasions',
    description: 'Hair for weddings, parties and events.',
    icon: 'tabler:sparkles',
    items: [
      { name: 'Occasion styling', price: 'From £50' },
      { name: 'Bridal hair', price: 'On request' },
    ],
  },
] as const;
