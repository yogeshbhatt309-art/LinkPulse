export interface Link {
  id: string;
  original_url: string;
  short_code: string;
  custom_alias: string | null;
  is_active: boolean;
  created_at: string;
  click_count?: number;
}

export interface Click {
  id: string;
  link_id: string;
  referrer: string | null;
  clicked_at: string;
}

export interface LinkStats {
  totalLinks: number;
  totalClicks: number;
}

export interface CreateLinkResult {
  success: boolean;
  link?: Link;
  error?: string;
}
