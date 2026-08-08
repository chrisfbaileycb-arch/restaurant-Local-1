// Demo menu used by the POS terminal demo and the onboarding wizard preview.
// Single source of truth — do not duplicate these items elsewhere.

export interface MenuItem {
  id: string;
  name: string;
  price: number; // cents
  category: string;
  mods?: string[];
}

export const MENU_CATEGORIES = ['Popular', 'Food', 'Coffee', 'Cold Bar', 'Sweets', 'Beer & Wine'];

export const DEMO_MENU: MenuItem[] = [
  { id: 'm1', name: 'Breakfast Burrito', price: 1050, category: 'Popular', mods: ['Add avocado +$1.50', 'No cheese', 'Extra salsa'] },
  { id: 'm2', name: 'Smash Burger', price: 1195, category: 'Popular', mods: ['Add bacon +$2.00', 'Sub side salad'] },
  { id: 'm3', name: 'Latte 16oz', price: 545, category: 'Popular', mods: ['Oat milk +$0.75', 'Extra shot +$1.00', 'Half caff'] },
  { id: 'm4', name: 'Warm Chocolate Chip Cookie', price: 375, category: 'Popular', mods: ['Warm it up', 'Box of 6 +$16.00'] },
  { id: 'm5', name: 'Chicken Sandwich', price: 1275, category: 'Food', mods: ['Spicy', 'Add pickles'] },
  { id: 'm6', name: 'Loaded Fries', price: 795, category: 'Food', mods: ['Add queso +$1.25'] },
  { id: 'm7', name: 'Street Tacos (3)', price: 995, category: 'Food', mods: ['Corn or flour', 'Extra lime'] },
  { id: 'm8', name: 'House Salad', price: 850, category: 'Food' },
  { id: 'm9', name: 'Drip Coffee', price: 295, category: 'Coffee', mods: ['Room for cream'] },
  { id: 'm10', name: 'Cappuccino', price: 495, category: 'Coffee', mods: ['Oat milk +$0.75'] },
  { id: 'm11', name: 'Cold Brew', price: 525, category: 'Coffee', mods: ['Sweet cream +$0.75'] },
  { id: 'm12', name: 'Espresso Double', price: 350, category: 'Coffee' },
  { id: 'm13', name: 'Mango Smoothie', price: 725, category: 'Cold Bar', mods: ['Protein boost +$1.50', 'No banana'] },
  { id: 'm14', name: 'Green Machine', price: 795, category: 'Cold Bar', mods: ['Add ginger +$0.75'] },
  { id: 'm15', name: 'Vanilla Soft Serve', price: 450, category: 'Cold Bar', mods: ['Dipped +$0.75', 'Sprinkles'] },
  { id: 'm16', name: 'Lemonade', price: 325, category: 'Cold Bar' },
  { id: 'm17', name: 'Cinnamon Roll', price: 495, category: 'Sweets' },
  { id: 'm18', name: 'Brownie', price: 395, category: 'Sweets' },
  { id: 'm19', name: 'Cake Slice', price: 650, category: 'Sweets', mods: ['Add candle'] },
  { id: 'm20', name: 'Sugar Cookie', price: 325, category: 'Sweets' },
  { id: 'm21', name: 'Draft IPA 16oz', price: 700, category: 'Beer & Wine' },
  { id: 'm22', name: 'Lager Can', price: 600, category: 'Beer & Wine' },
  { id: 'm23', name: 'House Red', price: 900, category: 'Beer & Wine' },
  { id: 'm24', name: 'Ranch Water', price: 850, category: 'Beer & Wine', mods: ['Extra lime'] },
];

// What the parser "finds" during the onboarding upload simulation.
export const PARSED_PREVIEW = [
  { category: 'Popular', items: 4 },
  { category: 'Food', items: 4 },
  { category: 'Coffee', items: 4 },
  { category: 'Cold Bar', items: 4 },
  { category: 'Sweets', items: 4 },
  { category: 'Beer & Wine', items: 4 },
];
