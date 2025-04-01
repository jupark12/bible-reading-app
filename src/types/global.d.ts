type Page = "Home" | "Search" | "Settings";

type User = {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
};

type Devotional = {
  devotional_id: number;
  user_id: number;
  devotional_date: Date;
  reflection: string;
  created_at: Date;
  updated_at: Date;
};
