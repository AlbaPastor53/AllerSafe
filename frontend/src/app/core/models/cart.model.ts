import { Departure } from './departure.model';

export interface CartItem {
  _id: string;
  cart: string;
  departure: Departure;
  capacity: number;
  quantity: number;
  created_at?: string;
  updated_at?: string;
}

export interface Cart {
  _id: string;
  user: string;
  total_products: number;
  total_price: number;
  items?: CartItem[];
  created_at?: string;
  updated_at?: string;
}
