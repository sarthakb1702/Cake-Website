export const img = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

export const heroSlides = [
  {
    name: "Velvet Bloom",
    note: "Red velvet layers, mascarpone cloud, freeze-dried raspberry dust.",
    price: "$34",
    image: img("1578985545062-69928b1d9587", 1100),
  },
  {
    name: "Pistachio Rosé",
    note: "Sicilian pistachio sponge with rose cream and candied petals.",
    price: "$38",
    image: img("1519915028121-7d3463d20b13", 1100),
  },
  {
    name: "Burnt Honey",
    note: "Caramelised honey crumb, brown butter frosting, sea salt.",
    price: "$29",
    image: img("1486427944299-d1955d23e34d", 1100),
  },
];

export const stats = [
  { label: "100% Fresh Ingredients", icon: "leaf" },
  { label: "500+ Cakes Baked Weekly", icon: "cake" },
  { label: "Same-Day Delivery", icon: "truck" },
  { label: "4.9 / 5 From 2.4k Reviews", icon: "star" },
];

export const bestsellers = [
  {
    name: "Strawberry Cloud",
    tag: "Bestseller",
    price: "$32",
    tone: "blush" as const,
    image: img("1563729784474-d77dbb933a9e", 700),
  },
  {
    name: "Midnight Cocoa",
    tag: "Rich & dark",
    price: "$36",
    tone: "chocolate" as const,
    image: img("1578985545062-69928b1d9587", 700),
  },
  {
    name: "Pistachio Whip",
    tag: "Nutty",
    price: "$34",
    tone: "pistachio" as const,
    image: img("1499636136210-6f4ee915583e", 700),
  },
  {
    name: "Golden Butter",
    tag: "Classic",
    price: "$28",
    tone: "butter" as const,
    image: img("1535141192574-5d4897c12636", 700),
  },
];

export const menuTabs = ["Cakes", "Cupcakes", "Pastries", "Custom"] as const;

export const menuItems: Record<
  (typeof menuTabs)[number],
  { name: string; tag: string; price: string; image: string }[]
> = {
  Cakes: [
    { name: "Velvet Bloom", tag: "Red velvet", price: "$34", image: img("1578985545062-69928b1d9587", 600) },
    { name: "Lemon Meringue", tag: "Citrus", price: "$31", image: img("1464349095431-e9a21285b5f3", 600) },
    { name: "Midnight Cocoa", tag: "70% cacao", price: "$36", image: img("1488477181946-6428a0291777", 600) },
    { name: "Rose Pistachio", tag: "Floral", price: "$38", image: img("1519915028121-7d3463d20b13", 600) },
  ],
  Cupcakes: [
    { name: "Berry Swirl", tag: "Six pack", price: "$18", image: img("1563729784474-d77dbb933a9e", 600) },
    { name: "Vanilla Bean", tag: "Six pack", price: "$16", image: img("1499636136210-6f4ee915583e", 600) },
    { name: "Salted Caramel", tag: "Four pack", price: "$14", image: img("1486427944299-d1955d23e34d", 600) },
    { name: "Matcha Cream", tag: "Six pack", price: "$19", image: img("1522767131594-6b7e96848fba", 600) },
  ],
  Pastries: [
    { name: "Almond Croissant", tag: "Baked 6am", price: "$6", image: img("1509440159596-0249088772ff", 600) },
    { name: "Cinnamon Knot", tag: "Warm spice", price: "$5", image: img("1587668178277-295251f900ce", 600) },
    { name: "Pistachio Danish", tag: "Flaky", price: "$7", image: img("1535141192574-5d4897c12636", 600) },
    { name: "Fig Galette", tag: "Seasonal", price: "$8", image: img("1464349095431-e9a21285b5f3", 600) },
  ],
  Custom: [
    { name: "Two-Tier Bloom", tag: "Serves 24", price: "$120", image: img("1517686469429-8bdb88b9f907", 600) },
    { name: "Birthday Confetti", tag: "Serves 12", price: "$74", image: img("1563729784474-d77dbb933a9e", 600) },
    { name: "Wedding Minimal", tag: "Serves 40", price: "$210", image: img("1519915028121-7d3463d20b13", 600) },
    { name: "Letter Cake", tag: "Serves 10", price: "$68", image: img("1488477181946-6428a0291777", 600) },
  ],
};

export const testimonials = [
  {
    quote:
      "The Velvet Bloom disappeared in eleven minutes. Eleven. My family has no manners and excellent taste.",
    name: "Amara Okafor",
    role: "Birthday order",
    avatar: img("1494790108377-be9c29b29330", 200),
    tone: "blush" as const,
  },
  {
    quote:
      "We ordered the two-tier for our engagement party. It looked like sculpture and tasted like a memory.",
    name: "Daniel Reyes",
    role: "Custom cake",
    avatar: img("1500648767791-00dcc994a43e", 200),
    tone: "butter" as const,
  },
  {
    quote:
      "Same-day delivery actually meant same day. The box arrived cold, perfect, tied with a ribbon.",
    name: "Sofia Lind",
    role: "Weekly regular",
    avatar: img("1534528741775-53994a69daeb", 200),
    tone: "pistachio" as const,
  },
  {
    quote:
      "I have opinions about pistachio. Crumb & Co. changed all of them. The rosé is unreal.",
    name: "Marcus Hale",
    role: "Pastry club",
    avatar: img("1507003211169-0a1dd7228f2d", 200),
    tone: "blush" as const,
  },
];

export const gallery = [
  img("1563729784474-d77dbb933a9e", 500),
  img("1578985545062-69928b1d9587", 500),
  img("1499636136210-6f4ee915583e", 500),
  img("1486427944299-d1955d23e34d", 500),
  img("1519915028121-7d3463d20b13", 500),
  img("1464349095431-e9a21285b5f3", 500),
  img("1535141192574-5d4897c12636", 500),
  img("1509440159596-0249088772ff", 500),
];
