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
  // Add the salon's social links here when the accounts exist, for example:
  // { ariaLabel: 'Instagram', icon: 'tabler:brand-instagram', href: 'https://www.instagram.com/<account>/' },
  socialLinks: [] as Array<{ ariaLabel: string; icon: string; href: string }>,
  footNote: `© ${new Date().getFullYear()} Honey & Silk Hair. All rights reserved.`,
};
