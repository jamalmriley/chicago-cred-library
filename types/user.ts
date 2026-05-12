import { Item } from "./books";

export interface Participant {
  id: string;
  created_at: Date;
  first_name: string;
  last_name: string;
  birthday: string;
  email: string;
  site: string;
  reading_level: string;
  notes: string | null;
  checkout_history: CheckoutItem[] | null;
  updated_at: Date;
}

export interface CheckoutItem {
  item: Item;
  checkout_date: Date;
  due_date: Date;
  return_date: Date | null;
  is_returned: boolean;
  extension_count: number;
}
