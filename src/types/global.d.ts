type Page = "Home" | "Search" | "Settings" | "Devotionals";

type User = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
};

interface Verse {
  verse_number: number;
  text: string;
}

interface FavoriteVerse {
  verse_number: number;
  text: string;
  book: string;
  chapter: number;
}

type Devotional = {
  devotional_id: number;
  user_id: number;
  devotional_date: string;
  reflection: string;
  created_at: Date;
  updated_at: Date;
};
