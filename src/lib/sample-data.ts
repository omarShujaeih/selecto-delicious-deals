export type Offer = {
  id: string;
  name: string;
  restaurant: string;
  cuisine: string;
  category: "Burgers" | "Pizzas" | "Bowls" | "Asian" | "Sushi";
  originalPrice: number;
  discountedPrice: number;
  rating: number;
  distanceKm: number;
  prepMinutes: string;
  image: string;
  validUntil: string;
  description: string;
};

const img = (q: string) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=800&q=80`;

export const offers: Offer[] = [
  {
    id: "teriyaki",
    name: "Teriyaki Chicken Bowl",
    restaurant: "Wok & Roll",
    cuisine: "Asian Cuisine",
    category: "Bowls",
    originalPrice: 13.49,
    discountedPrice: 7.49,
    rating: 4.6,
    distanceKm: 1.2,
    prepMinutes: "20-25 min",
    image: img("photo-1546069901-ba9599a7e63c"),
    validUntil: "Today, 10:00 PM",
    description:
      "Grilled chicken glazed with teriyaki sauce, served with steamed rice and fresh veggies.",
  },
  {
    id: "cheesy-burger",
    name: "Cheesy Chicken Burger",
    restaurant: "Burger Barn",
    cuisine: "American",
    category: "Burgers",
    originalPrice: 10.99,
    discountedPrice: 7.99,
    rating: 4.4,
    distanceKm: 1.8,
    prepMinutes: "25-30 min",
    image: img("photo-1568901346375-23c9450c58cd"),
    validUntil: "Today, 11:00 PM",
    description:
      "Juicy grilled chicken patty layered with melted cheddar, crisp lettuce, and house sauce.",
  },
  {
    id: "margherita",
    name: "Margherita Pizza",
    restaurant: "Pizza Palace",
    cuisine: "Italian",
    category: "Pizzas",
    originalPrice: 15.99,
    discountedPrice: 9.49,
    rating: 4.5,
    distanceKm: 2.1,
    prepMinutes: "30-35 min",
    image: img("photo-1604382354936-07c5d9983bd3"),
    validUntil: "Today, 10:30 PM",
    description:
      "Stone-baked sourdough crust with San Marzano tomato, fresh mozzarella, and basil.",
  },
  {
    id: "garlic-noodles",
    name: "Garlic Noodles",
    restaurant: "Wok & Roll",
    cuisine: "Asian",
    category: "Asian",
    originalPrice: 10.99,
    discountedPrice: 6.99,
    rating: 4.3,
    distanceKm: 1.2,
    prepMinutes: "15-20 min",
    image: img("photo-1552611052-33e04de081de"),
    validUntil: "Today, 9:00 PM",
    description:
      "Hand-pulled noodles tossed in garlic butter with scallions and chili crisp.",
  },
  {
    id: "ramen",
    name: "Spicy Ramen Bowl",
    restaurant: "Sushi Zen",
    cuisine: "Japanese",
    category: "Asian",
    originalPrice: 14.99,
    discountedPrice: 8.49,
    rating: 4.7,
    distanceKm: 3.1,
    prepMinutes: "20-25 min",
    image: img("photo-1623341214825-9f4f963727da"),
    validUntil: "Today, 11:00 PM",
    description:
      "Tonkotsu broth with chashu pork, soft egg, scallions, and chili oil.",
  },
  {
    id: "sushi-platter",
    name: "Sushi Mix Platter",
    restaurant: "Sushi Zen",
    cuisine: "Japanese",
    category: "Sushi",
    originalPrice: 22.0,
    discountedPrice: 14.99,
    rating: 4.7,
    distanceKm: 3.1,
    prepMinutes: "25-30 min",
    image: img("photo-1579871494447-9811cf80d66c"),
    validUntil: "Today, 10:00 PM",
    description: "Chef's selection of nigiri and rolls with soy and wasabi.",
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
  activeOffers: 12,
  orders: 36,
  sales: 325.5,
  commission: 45.57,
};

export const restaurantOffers = offers.slice(0, 5).map((o) => ({
  ...o,
  active: true,
}));

export const salesTrend = [
  { day: "May 5", sales: 180 },
  { day: "May 6", sales: 220 },
  { day: "May 7", sales: 260 },
  { day: "May 8", sales: 240 },
  { day: "May 9", sales: 310 },
  { day: "May 10", sales: 360 },
  { day: "May 11", sales: 420 },
];

// Admin sample
export const adminStats = {
  users: 12568,
  restaurants: 1248,
  offers: 2356,
  revenue: 25430,
  commission: 4325.6,
};

export const adminRestaurants = [
  { id: "1", name: "Wok & Roll", cuisine: "Asian Cuisine", city: "New York", active: true, rating: 4.6 },
  { id: "2", name: "Pizza Palace", cuisine: "Italian", city: "New York", active: true, rating: 4.5 },
  { id: "3", name: "Burger Barn", cuisine: "American", city: "New York", active: false, rating: 4.4 },
  { id: "4", name: "Sushi Zen", cuisine: "Japanese", city: "New York", active: true, rating: 4.7 },
];

export const reports = [
  { id: "1", title: "Sales Report", date: "May 11, 2026" },
  { id: "2", title: "Top Restaurants", date: "May 11, 2026" },
  { id: "3", title: "Top Offers", date: "May 11, 2026" },
  { id: "4", title: "User Growth", date: "May 11, 2026" },
  { id: "5", title: "Commission Report", date: "May 11, 2026" },
];
