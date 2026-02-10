
export interface MenuItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: 'Makanan' | 'Minuman' | 'Cemilan';
  labels: string[];
  isPO?: boolean;
}

export interface SocialLinks {
  whatsapp: string;
  instagram: string;
  telegram: string;
  facebook: string;
}

export interface AppConfig {
  restaurantName: string;
  tagline: string;
  logoUrl: string;
  bannerImage: string;
  address: string;
  openingHours: string;
  socials: SocialLinks;
  gallery: string[];
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Testimonial {
  id: number;
  name: string;
  text: string;
  rating: number;
}
