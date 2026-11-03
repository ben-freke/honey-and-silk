import { getPermalink } from './utils/permalinks';

export const headerData = {
  links: [
    { text: 'Home', href: getPermalink('/') },
    { text: 'Services', href: getPermalink('/services') },
    { text: 'About Us', href: getPermalink('/about') },
    { text: 'Contact Us', href: getPermalink('/contact') },
  ],
  actions: [{ text: 'Book now', href: getPermalink('/contact'), variant: 'primary' as const }],
};

export const footerData = {
  links: [],
  secondaryLinks: [],
  socialLinks: [
    // TODO: add the salon's real social links.
    { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: '#' },
    { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: '#' },
  ],
  footNote: `© ${new Date().getFullYear()} Honey & Silk Hair. All rights reserved.`,
};
