export type Category = {
  id: string;
  name: string;
  color: string;
  order: number;
};

export type Link = {
  id: string;
  label: string;
  url: string;
  icon: string;
  color: string;
  categoryId: string;
  order: number;
};

export type SiteData = {
  profile: {
    name: string;
    tagline: string;
    bio: string;
    avatar: string;
    banner: string;
  };
  categories: Category[];
  links: Link[];
  settings: {
    bgImage: string;
    bgMusic: string;
    defaultTheme: 'dark' | 'light';
  };
};
