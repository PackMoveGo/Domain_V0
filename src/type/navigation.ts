export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  children?: NavItem[];
}

export interface NavItems extends Array<NavItem> {} 