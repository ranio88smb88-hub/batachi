
import { MenuItem, Testimonial, AppConfig } from './types';

export const INITIAL_CONFIG: AppConfig = {
  restaurantName: "Warung Batachi",
  tagline: "Masakan Rumahan • Rasa Juara • Bikin Nagih",
  logoUrl: "https://picsum.photos/seed/batachilogo/200/200",
  bannerImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1920",
  address: "Soi Sukhumvit 23, Khlong Toei Nuea, Bangkok 10110, Thailand",
  openingHours: "10.00 - 21.00",
  socials: {
    whatsapp: "6281234567890",
    instagram: "warungbatachi",
    telegram: "batachiresto",
    facebook: "warung.batachi"
  },
  gallery: [
    "https://picsum.photos/seed/g1/800/600",
    "https://picsum.photos/seed/g2/800/600",
    "https://picsum.photos/seed/g3/800/600",
    "https://picsum.photos/seed/g4/800/600",
  ]
};

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 1,
    name: "Ayam Goreng Lengkuas",
    price: 120,
    image: "https://picsum.photos/seed/ayam1/600/400",
    category: 'Makanan',
    labels: ['🔥 Best Seller'],
    isPO: false
  },
  {
    id: 2,
    name: "Sambal Cumi Asin (Pre-Order)",
    price: 150,
    image: "https://picsum.photos/seed/cumi/600/400",
    category: 'Makanan',
    labels: ['🌶️ Pedas', '📦 PO'],
    isPO: true
  },
  {
    id: 3,
    name: "Nasi Liwet Bangkok Edition",
    price: 180,
    image: "https://picsum.photos/seed/nasi/600/400",
    category: 'Makanan',
    labels: ['⭐ Favorit'],
    isPO: true
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Somchai",
    text: "Rasa masakan rumahannya otentik sekali. Sambalnya juara!",
    rating: 5
  },
  {
    id: 2,
    name: "Anisa",
    text: "Sistem PO-nya mudah, admin sangat responsif di Telegram.",
    rating: 5
  }
];
