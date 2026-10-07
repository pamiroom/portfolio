/**
 * Everything about Pami lives in this one file.
 * Edit the values below; the home page, /about and the SEO tags follow.
 * Empty lists (history entries, clients, links) are simply not shown.
 */
import type { Profile } from '../types/profile';
import portrait from '../assets/profile/portrait.png';

export const profile: Profile = {
  name: 'Pami',
  nameJa: 'パみ',
  role: 'Creator',
  location: 'Japan',
  tagline: 'Pami — Creator',
  intro: '肩書きよりも、つくるものから。デザインという枠にとらわれず、アイデアを形にするための方法を探しながら活動しています。',
  bioJa: ['肩書きよりも、つくるものから。', 'デザインという枠にとらわれず、アイデアを形にするための方法を探しながら活動しています。'],
  bioEn: ['Beyond titles, I create.', 'I explore beyond the boundaries of design, finding new ways to bring ideas to life.'],
  email: 'meioami.81@gmail.com',
  portrait,
  portraitAlt: 'Pami portrait',
  links: [{ label: 'Instagram', href: 'https://www.instagram.com/pami__chans/', handle: '@pami__chans' }],
  history: [
    {
      heading: 'Exhibition / Events',
      entries: [
        { date: '2025.05', text: 'handmedecollection @ 川越' },
        { date: '2025.10', text: 'EN SEN Culture Market' },
        { date: '2026.02', text: 'handmedecollectio @ 渋谷マルイ' },
        { date: '2026.03', text: 'amuamu Flea Market' },
        { date: '2026.05', text: 'EN SEN Culture Market' },
      ],
    },
  ],
  clients: [],
};
