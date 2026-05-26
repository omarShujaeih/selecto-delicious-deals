export type Offer = {
  id: string;
  name: string;
  restaurant: string;
  cuisine: string;
  category: string;
  originalPrice: number;
  discountedPrice: number;
  restaurantPrice?: number;
  rating: number;
  distanceKm: number;
  prepMinutes: string;
  pickupTime?: string;
  image: string;
  validUntil: string;
  description: string;
  city?: string;
  area?: string;
  address?: string;
};

const img = (q: string) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=800&q=80`;

export const offers: Offer[] = [
  {
    id: "mansaf-cup",
    name: "Arabic Mansaf Cup",
    restaurant: "Zamn Cafe",
    cuisine: "Levantine",
    category: "Bowls",
    originalPrice: 35.00,
    discountedPrice: 24.00,
    rating: 4.9,
    distanceKm: 0.8,
    prepMinutes: "20-25 min",
    pickupTime: "1:00 PM - 3:00 PM",
    image: img("photo-1541518763669-27fef04b14ea"),
    validUntil: "Today, 10:00 PM",
    description:
      "Authentic Jordanian/Palestinian Mansaf with high-quality local lamb, premium Jameed, and almond garnish in a convenient cup.",
  },
  {
    id: "manara-burger",
    name: "Manara Tower Double Beef",
    restaurant: "Rukab Street Burgers",
    cuisine: "Burgers & Grill",
    category: "Burgers",
    originalPrice: 45.00,
    discountedPrice: 32.00,
    rating: 4.8,
    distanceKm: 1.2,
    prepMinutes: "25-30 min",
    pickupTime: "6:00 PM - 8:00 PM",
    image: img("photo-1568901346375-23c9450c58cd"),
    validUntil: "Today, 11:30 PM",
    description:
      "Double premium beef patties, melted local cheddar cheese, custom burger sauce on a toasted sweet brioche bun.",
  },
  {
    id: "manara-pizza",
    name: "Special Margherita Pizza",
    restaurant: "Al-Manara Pizza",
    cuisine: "Italian",
    category: "Pizzas",
    originalPrice: 30.00,
    discountedPrice: 20.00,
    rating: 4.6,
    distanceKm: 0.5,
    prepMinutes: "15-20 min",
    pickupTime: "4:00 PM - 6:30 PM",
    image: img("photo-1604382354936-07c5d9983bd3"),
    validUntil: "Today, 10:30 PM",
    description:
      "Stone-baked crispy sourdough crust, rich local tomato sauce, fresh buffalo mozzarella, and aromatic basil leaves.",
  },
  {
    id: "mastic-ice-cream",
    name: "Arabic Mastic Ice Cream Tub",
    restaurant: "Rukab's Ice Cream",
    cuisine: "Desserts",
    category: "Bowls",
    originalPrice: 20.00,
    discountedPrice: 14.00,
    rating: 4.9,
    distanceKm: 1.1,
    prepMinutes: "5 min",
    pickupTime: "12:00 PM - 10:00 PM",
    image: img("photo-1563805042-7684c019e1cb"),
    validUntil: "Today, 11:00 PM",
    description:
      "Legendary Ramallah mastic ice cream with rich pistachios, stretchy texture, and authentic local flavor.",
  },
  {
    id: "shawarma-plate",
    name: "Double Shawarma Meal",
    restaurant: "Downtown Shawarma",
    cuisine: "Arabic",
    category: "Burgers",
    originalPrice: 28.00,
    discountedPrice: 20.00,
    rating: 4.7,
    distanceKm: 0.6,
    prepMinutes: "15-20 min",
    pickupTime: "3:00 PM - 5:30 PM",
    image: img("photo-1565557623262-b51c2513a641"),
    validUntil: "Today, 11:00 PM",
    description:
      "Tender sliced chicken shawarma wraps, toasted with local garlic toum, pickles, and crispy salted french fries.",
  },
  {
    id: "falafel-combo",
    name: "Falafel & Hummus Platter",
    restaurant: "Baladna Kitchen",
    cuisine: "Palestinian",
    category: "Bowls",
    originalPrice: 15.00,
    discountedPrice: 10.00,
    rating: 4.8,
    distanceKm: 0.9,
    prepMinutes: "10 min",
    pickupTime: "8:00 AM - 12:00 PM",
    image: img("photo-1547058886-af77d0cf0c0d"),
    validUntil: "Today, 9:00 PM",
    description:
      "Crispy freshly-fried sesame falafel balls, smooth creamy chickpea hummus, pickles, and freshly-baked local pita bread.",
  },
];

export const categories = [
  "All",
  "Burgers",
  "Pizzas",
  "Bowls",
  "Asian",
  "Sushi",
] as const;

export const discountPct = (o: Offer) =>
  Math.round(((o.originalPrice - o.discountedPrice) / o.originalPrice) * 100);

export const offerById = (id: string) => offers.find((o) => o.id === id);

// Restaurant panel sample
export const restaurantStats = {
  activeOffers: 2,
  orders: 3,
  sales: 76.0,
  commission: 15.2,
};

export const restaurantOffers = offers.slice(0, 2).map((o) => ({
  ...o,
  active: true,
}));

export const salesTrend = [
  { day: "May 14", sales: 120 },
  { day: "May 15", sales: 180 },
  { day: "May 16", sales: 220 },
  { day: "May 17", sales: 140 },
  { day: "May 18", sales: 240 },
  { day: "May 19", sales: 310 },
  { day: "May 20", sales: 380 },
];

// Admin sample
export const adminStats = {
  users: 145,
  restaurants: 8,
  offers: 16,
  revenue: 2540,
  commission: 508.0,
};

export const adminRestaurants = [
  { id: "1", name: "Zamn Cafe", cuisine: "Levantine", city: "Al-Masyoun, Ramallah", active: true, rating: 4.8 },
  { id: "2", name: "Rukab Street Burgers", cuisine: "Burgers & Grill", city: "Rukab Street, Ramallah", active: true, rating: 4.6 },
  { id: "3", name: "Al-Manara Pizza", cuisine: "Italian", city: "Al-Manara, Ramallah", active: true, rating: 4.6 },
  { id: "4", name: "Rukab's Ice Cream", cuisine: "Desserts", city: "Downtown Ramallah", active: true, rating: 4.9 },
];

export const reports = [
  { id: "1", title: "Daily Sales Report", date: "May 20, 2026" },
  { id: "2", title: "Top Performing Restaurants", date: "May 20, 2026" },
  { id: "3", title: "Best Selling Offers", date: "May 20, 2026" },
  { id: "4", title: "User Signup Analytics", date: "May 20, 2026" },
  { id: "5", title: "Platform Commission Statement", date: "May 20, 2026" },
];

