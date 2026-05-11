export interface Participant {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  birthday: string;
  email: string;
  site: string;
  reading_level: string;
  notes: string | null;
  checkout_history: null;
  updated_at: string;
}
