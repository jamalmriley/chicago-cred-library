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
  checkout_history: KioskItem[] | null;
  updated_at: Date;
}

export interface KioskItem {
  item: Item;
  checkout_date: Date;
  due_date: Date;
  return_date: Date | null;
  is_returned: boolean;
  extension_count: number;
  has_completed_book_report: boolean;
}
