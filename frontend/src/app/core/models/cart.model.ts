import { Product } from './product.model';

export interface CartStoredLine {
  productId: number;
  quantity: number;
}

export interface CartLine {
  product: Product;
  quantity: number;
  lineTotalCents: number;
}
