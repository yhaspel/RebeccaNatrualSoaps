export interface OrderItem {
  id: number;
  product: number | null;
  product_sku_snapshot: string;
  product_name_en_snapshot: string;
  product_name_he_snapshot: string;
  product_image_snapshot: string;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
}

export type OrderStatus = 'pending_payment' | 'paid' | 'fulfilled' | 'canceled';

export interface Order {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  shipping_line1: string;
  shipping_line2: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
  currency: string;
  status: OrderStatus;
  grow_process_id: string;
  created_at: string;
  items: OrderItem[];
}

export interface CheckoutResponse {
  order_id: number;
  payment_page_link: string;
  is_mock: boolean;
  total_cents: number;
  currency: string;
}
