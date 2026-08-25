export type TicketStatus = 'queued' | 'prep' | 'ready' | 'completed';
export type TicketPriority = 'normal' | 'rush';
export type StationId = 'all' | 'grill' | 'fryer' | 'bar' | 'expo';

export interface KDSTicketItem {
  id: string;
  name: string;
  qty: number;
  modifiers?: string[];
  station: 'grill' | 'fryer' | 'bar' | 'expo';
  done?: boolean;
}

export interface KDSTicket {
  id: string;
  ticketNumber: number;
  orderSource: 'Dine-In' | 'Takeout' | 'QR Table' | 'Bar Tab';
  locationLabel: string; // e.g. "Table 4", "Bar 2", "Pickup #12"
  serverName: string;
  createdAt: number;
  status: TicketStatus;
  priority: TicketPriority;
  items: KDSTicketItem[];
  specialInstructions?: string;
  bumpedAt?: number;
}

export const INITIAL_KDS_TICKETS: KDSTicket[] = [
  {
    id: "kds-101",
    ticketNumber: 101,
    orderSource: "Dine-In",
    locationLabel: "Table 4",
    serverName: "Maya S.",
    createdAt: Date.now() - 1000 * 60 * 12, // 12 mins ago (Amber)
    status: "prep",
    priority: "normal",
    items: [
      {
        id: "item-1",
        name: "Double Smash Burger",
        qty: 2,
        modifiers: ["Medium Rare", "Extra Cheddar", "No Pickles"],
        station: "grill",
        done: true,
      },
      {
        id: "item-2",
        name: "Truffle Parmesan Fries",
        qty: 1,
        modifiers: ["Extra Crispy", "Aioli on Side"],
        station: "fryer",
        done: false,
      },
      {
        id: "item-3",
        name: "Local Craft Hazy IPA",
        qty: 2,
        modifiers: ["Chilled Pint Glass"],
        station: "bar",
        done: true,
      },
    ],
    specialInstructions: "Guest at seat 1 has a severe sesame seed allergy.",
  },
  {
    id: "kds-102",
    ticketNumber: 102,
    orderSource: "QR Table",
    locationLabel: "Table 8",
    serverName: "Contactless QR Order",
    createdAt: Date.now() - 1000 * 60 * 6, // 6 mins ago (Green)
    status: "prep",
    priority: "normal",
    items: [
      {
        id: "item-4",
        name: "Grilled Salmon Bowl",
        qty: 1,
        modifiers: ["Garlic Butter Sauce", "Brown Rice"],
        station: "grill",
        done: false,
      },
      {
        id: "item-5",
        name: "House Citrus Lemonade",
        qty: 1,
        modifiers: ["Light Ice"],
        station: "bar",
        done: true,
      },
    ],
  },
  {
    id: "kds-103",
    ticketNumber: 103,
    orderSource: "Bar Tab",
    locationLabel: "Bar Seat 3",
    serverName: "Marcus K.",
    createdAt: Date.now() - 1000 * 60 * 18, // 18 mins ago (Red / Urgent!)
    status: "prep",
    priority: "rush",
    items: [
      {
        id: "item-6",
        name: "Smash Burger & Fries Combo",
        qty: 1,
        modifiers: ["Gluten-Free Lettuce Wrap"],
        station: "grill",
        done: false,
      },
      {
        id: "item-7",
        name: "Old Fashioned Cocktail",
        qty: 1,
        modifiers: ["Bourbon", "Orange Peel"],
        station: "bar",
        done: true,
      },
    ],
    specialInstructions: "RUSH — Bar guest has been waiting 18 mins.",
  },
  {
    id: "kds-104",
    ticketNumber: 104,
    orderSource: "Takeout",
    locationLabel: "Pickup #44 (Online)",
    serverName: "Web Ordering",
    createdAt: Date.now() - 1000 * 60 * 2, // 2 mins ago
    status: "queued",
    priority: "normal",
    items: [
      {
        id: "item-8",
        name: "Avocado Sourdough Toast",
        qty: 2,
        modifiers: ["Poached Eggs on Top", "Chili Flakes"],
        station: "grill",
        done: false,
      },
      {
        id: "item-9",
        name: "Cold Brew Coffee",
        qty: 2,
        modifiers: ["Oat Milk"],
        station: "bar",
        done: false,
      },
    ],
    specialInstructions: "Box for takeout, add 2 sets of cutlery.",
  },
  {
    id: "kds-100",
    ticketNumber: 100,
    orderSource: "Dine-In",
    locationLabel: "Table 2",
    serverName: "Maya S.",
    createdAt: Date.now() - 1000 * 60 * 22,
    status: "ready",
    priority: "normal",
    items: [
      {
        id: "item-10",
        name: "Truffle Fries (Appetizer)",
        qty: 1,
        station: "fryer",
        done: true,
      },
    ],
    specialInstructions: "Ready on Pass — Expo please run to Table 2.",
  },
];
