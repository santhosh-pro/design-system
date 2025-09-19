export interface SideMenuItem {
  id: string;
  iconPath?: string;
  link?: string;
  externalLink?: string;
  label?: string;
  isEnabled: boolean;
  isSeparator?: boolean;
  groupHeading?: string;
}