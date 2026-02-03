import React from 'react';

export type ItemType = 'link' | 'nav' | 'file';

export interface ContentItem {
  id: string;
  type: ItemType;
  label: string;
  url?: string; // For 'link' and 'file'
  targetPageId?: string; // For 'nav'
  iconName?: string; // String name of the Lucide icon
}

export type PageItem = ContentItem | { id: string; type: 'separator' };

export interface Page {
  id: string; // 'home', 'valores', etc.
  title?: string; // Page title (e.g., "Valores")
  iconName?: string; // Icon for the page header
  items: PageItem[];
}

export interface AppContent {
  pages: Page[];
}

export interface ButtonProps {
  item: ContentItem;
  index: number;
  onClick?: () => void;
}
