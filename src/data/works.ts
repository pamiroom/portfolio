/**
 * Works shown in the centre column of the home page, top to bottom.
 *
 * To add a work:
 *   1. Put the image in src/assets/works/ (square or 4:5, ~400px is plenty).
 *   2. Import it below and add an entry to the array.
 * Give `url` to link out directly; otherwise /works/[slug] is generated.
 */
import type { Work } from '../types/work';

import roomNotes01 from '../assets/works/room-notes-01.png';
import pForPami from '../assets/works/p-for-pami.png';
import pForPamiB from '../assets/works/p-for-pami--b.png';
import smallWeather from '../assets/works/small-weather.png';
import pamiNight00 from '../assets/works/pami-night-00.png';
import faceSticker from '../assets/works/face-sticker.png';
import faceStickerB from '../assets/works/face-sticker--b.png';
import stripesForAWall from '../assets/works/stripes-for-a-wall.png';
import ringTone from '../assets/works/ring-tone.png';
import tinyAlphabet from '../assets/works/tiny-alphabet.png';
import pixelGarden from '../assets/works/pixel-garden.png';
import betweenThings from '../assets/works/between-things.png';
import receiptPoem from '../assets/works/receipt-poem.png';
import checkerCloth from '../assets/works/checker-cloth.png';
import openLate from '../assets/works/open-late.png';
import seven from '../assets/works/seven.png';
import dotsOnBlue from '../assets/works/dots-on-blue.png';
import pamiNight01 from '../assets/works/pami-night-01.png';
import pamiNight01B from '../assets/works/pami-night-01--b.png';
import softNoise from '../assets/works/soft-noise.png';
import questionMark from '../assets/works/question-mark.png';
import brownPaper from '../assets/works/brown-paper.png';
import roundTrip from '../assets/works/round-trip.png';
import wink from '../assets/works/wink.png';
import quietHours from '../assets/works/quiet-hours.png';
import starIndex from '../assets/works/star-index.png';
import lastTrain from '../assets/works/last-train.png';

export const works: Work[] = [
  { slug: 'pami-night-01', title: 'PAMI NIGHT #01', year: 2026, category: 'Poster', image: pamiNight01, altImage: pamiNight01B, description: 'Poster for the first numbered night. Two colourways, printed in risograph.' },
  { slug: 'p-for-pami', title: 'p for Pami', year: 2026, category: 'Identity', image: pForPami, altImage: pForPamiB, alt: 'A lowercase p in yellow on blue', description: 'A letter that changes case when nobody is looking.' },
  { slug: 'room-notes-01', title: 'ROOM NOTES 01', year: 2025, category: 'Zine', image: roomNotes01, description: 'Twenty-four pages of notes about rooms that were borrowed for one night.' },
  { slug: 'small-weather', title: 'Small Weather', year: 2025, category: 'Print', image: smallWeather, alt: 'Blue dots of uneven sizes on white' },
  { slug: 'face-sticker', title: 'Face', year: 2026, category: 'Sticker', image: faceSticker, altImage: faceStickerB, alt: 'A pixel smiley in black on yellow' },
  { slug: 'pami-night-00', title: 'PAMI NIGHT #00', year: 2024, category: 'Poster', image: pamiNight00 },
  { slug: 'stripes-for-a-wall', title: 'Stripes for a Wall', year: 2025, category: 'Installation', image: stripesForAWall },
  { slug: 'ring-tone', title: 'Ring Tone', year: 2025, category: 'Print', image: ringTone, alt: 'Navy concentric rings on pink' },
  { slug: 'tiny-alphabet', title: 'Tiny Alphabet', year: 2025, category: 'Type', image: tinyAlphabet, alt: 'The hiragana あ in white on black' },
  { slug: 'pixel-garden', title: 'Pixel Garden', year: 2024, category: 'Textile', image: pixelGarden },
  { slug: 'between-things', title: 'Between', year: 2024, category: 'Sign', image: betweenThings },
  { slug: 'receipt-poem', title: 'Receipt Poem', year: 2025, category: 'Zine', image: receiptPoem },
  { slug: 'checker-cloth', title: 'Checker Cloth', year: 2024, category: 'Object', image: checkerCloth },
  { slug: 'open-late', title: 'OPEN LATE', year: 2025, category: 'Sticker', image: openLate },
  { slug: 'seven', title: '7', year: 2024, category: 'Type', image: seven, alt: 'A red numeral 7 on grey' },
  { slug: 'dots-on-blue', title: 'Dots on Blue', year: 2026, category: 'Print', image: dotsOnBlue },
  { slug: 'soft-noise', title: 'Soft Noise', year: 2025, category: 'Textile', image: softNoise },
  { slug: 'question-mark', title: '?', year: 2024, category: 'Sign', image: questionMark, alt: 'A white question mark on orange' },
  { slug: 'brown-paper', title: 'Brown Paper', year: 2025, category: 'Zine', image: brownPaper },
  { slug: 'round-trip', title: 'Round Trip', year: 2026, category: 'Print', image: roundTrip },
  { slug: 'wink', title: 'Wink', year: 2026, category: 'Sticker', image: wink, alt: 'A winking pixel face in blue on pink' },
  { slug: 'quiet-hours', title: 'Quiet Hours', year: 2025, category: 'Photograph', image: quietHours, alt: 'A dark navy field with one small yellow window' },
  { slug: 'star-index', title: 'Star Index', year: 2026, category: 'Identity', image: starIndex, alt: 'A blue four-point star on yellow' },
  { slug: 'last-train', title: 'LAST', year: 2024, category: 'Sign', image: lastTrain },
];
