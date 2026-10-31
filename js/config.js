// Contact details used across the site. Fill these in before publishing.
export const CONTACT = {
  // international format without "+" or leading 0, e.g. 972501234567
  whatsapp: '972523231983',
  phoneDisplay: '052-3231983',
  email: 'noamab7@gmail.com',
  // leave an entry empty ('') to hide it
  social: {
    instagram: '',
    facebook: '',
    linkedin: '',
  },
};

export const waLink = (text = '') =>
  `https://wa.me/${CONTACT.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
