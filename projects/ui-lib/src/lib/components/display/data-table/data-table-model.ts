import { Type } from "@angular/core";
import { PaginationEvent } from "../pagination/pagination";
import { TableSortEvent } from "./sortable-table";

// Types & Interfaces
export type ColumnNode = ColumnDef | ColumnGroup;

export interface ColumnGroup {
  title: string;
  children: ColumnNode[];
  alignment?: 'left' | 'center' | 'right';
}

export interface HeaderCell {
  title: string;
  colspan: number;
  rowspan: number;
  node: ColumnNode;
  sortKey?: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface ColumnDef {
  title: string;
  key?: string;
  displayTemplate?: string;
  sortKey?: string;
  alignment?: 'left' | 'center' | 'right';
  type: 'text' | 'date' | 'badge' | 'custom' | 'actions' | 'checkbox';
  visible?: boolean | null;
  component?: Type<any>;
  textConfig?: TextConfig;
  dateConfig?: DateConfig;
  badgeConfig?: BadgeConfig;
  customConfig?: CustomRendererConfig;
  actionsConfig?: ActionConfig;
  formatter?: (value: any) => any;
  objectFormatter?: (item: any) => any;
  propertyStyle?: (value: any) => any;
}

export interface TextConfig {
  textColorClass?: string;
}

export interface DateConfig {
  dateFormat?: string;
  showIcon?: boolean;
}

export interface BadgeConfig {
  properties: BadgeConfigProperty[];
}

export interface BadgeConfigProperty {
  data: string;
  displayText: string;
  backgroundColorClass?: string;
  borderColorClass?: string;
  textColorClass?: string;
  indicatorColorClass?: string;
}

export interface CustomRendererConfig {
  data?: any;
}

export interface ActionConfig {
  iconActions?: IconAction[];
  threeDotMenuActions?: ContextMenuActionConfig[] | ((item: any) => ContextMenuActionConfig[]) | null;
  textMenuActions?: ContextMenuActionConfig[] | null;
  components?: Type<any>[];
}

export interface IconAction {
  iconPath: string;
  actionKey: string;
  label?: string;
}

export interface ContextMenuActionConfig {
  iconPath?: string;
  actionKey: string;
  label: string;
}

export interface TableActionEvent {
  actionKey: string;
  item: any;
  data?: any;
}

export interface TableStateEvent {
  searchText?: string;
  paginationEvent?: PaginationEvent;
  tableSortEvent?: TableSortEvent;
}