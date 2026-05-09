export interface Product {
  id: number;
  sku: string;
  category: number;
  category_slug: string;
  name_en: string;
  name_he: string;
  description_en: string;
  description_he: string;
  ingredients_en: string;
  ingredients_he: string;
  price_cents: number;
  currency: string;
  stock: number;
  image_url: string;
  is_featured: boolean;
  is_active: boolean;
}
