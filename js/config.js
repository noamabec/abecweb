// Contact details used across the site. Fill these in before publishing.
export const CONTACT = {
  // international format without "+" or leading 0, e.g. 972501234567
  whatsapp: '972500000000',
  phoneDisplay: '050-000-0000',
  email: 'hello@abecweb.com',
  // leave an entry empty ('') to hide it
  social: {
    instagram: '',
    facebook: '',
    linkedin: '',
  },
};

export const waLink = (text = '') =>
  `https://wa.me/${CONTACT.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
