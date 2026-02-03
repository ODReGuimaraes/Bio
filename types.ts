import React from 'react';

export interface LinkItem {
  id: string;
  label: string;
  url: string;
  icon: React.ElementType;
  variant?: 'primary' | 'secondary' | 'accent';
}

export interface ButtonProps {
  item: LinkItem;
  index: number;
}