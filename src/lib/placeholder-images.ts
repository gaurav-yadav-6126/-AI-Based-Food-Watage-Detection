export interface PlaceHolderImage {
  id: string;
  imageUrl: string;
  description: string;
  imageHint: string;
}

export const PlaceHolderImages: PlaceHolderImage[] = [
  {
    id: 'hero-image',
    imageUrl: 'https://images.bizbuysell.com/shared/listings/239/2394485/96610ccc-499c-4653-ab07-62a038a9fb8a-W768.png',
    description: 'A group of friends sharing food at a restaurant table.',
    imageHint: 'People dining together at a rustic wooden table, sharing various dishes in a warm, inviting restaurant atmosphere.',
  },
  {
    id: 'feature-1',
    imageUrl: 'https://logmeal.com/static/image/LogMeal-food-detection-recognition-main-home.jpg',
    description: 'AI analyzing a plate of food waste.',
    imageHint: 'A close-up of a smartphone screen showing a photo of a half-eaten plate of pasta. Digital bounding boxes and labels identify the food types.',
  },
  {
    id: 'feature-2',
    imageUrl: 'https://lens.usercontent.google.com/banana?agsi=CmdnbG9iYWw6OjAwMDA1NWNmZWM3MDAyNmQ6MDAwMDAwZWI6MTo3Y2EwMDMxOTI5YzUyNzM0OjAwMDA1NWNmZWM3MDAyNmQ6MDAwMDAxOTBiZjIwMzM2ODowMDA2NGY2ZTkyYWI1ODBmEAIYAQ==',
    description: 'A dashboard showing waste trends.',
    imageHint: 'A clean, modern web dashboard with colorful bar charts and pie charts showing food waste statistics over time.',
  },
  {
    id: 'feature-3',
    imageUrl: 'https://images.unsplash.com/photo-1466633310193-cbbda831f182?q=80&w=800&h=600&auto=format&fit=crop',
    description: 'Actionable tips for waste reduction.',
    imageHint: 'A list of clear, actionable tips on a screen, like "Reduce potato portion by 10%" or "Check fridge temperature settings".',
  },
  {
    id: 'how-it-works-1',
    imageUrl: 'https://images.unsplash.com/photo-1511317558624-34dfd9957475?q=80&w=800&h=600&auto=format&fit=crop',
    description: 'Taking a photo of food waste.',
    imageHint: 'A person holding a smartphone and taking a photo of a bin containing food scraps in a kitchen.',
  },
  {
    id: 'how-it-works-2',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&h=600&auto=format&fit=crop',
    description: 'AI processing the image.',
    imageHint: 'A conceptual image of a circuit board with a glowing brain icon, representing AI processing food waste data.',
  },
  {
    id: 'how-it-works-3',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&h=600&auto=format&fit=crop',
    description: 'Implementing a waste reduction plan.',
    imageHint: 'A chef looking at a tablet in a kitchen, smiling as they see their waste reduction progress.',
  },
];
