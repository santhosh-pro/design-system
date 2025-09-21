import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { FormControl } from '@angular/forms';
import { AppSvgIcon } from '../../../../components/misc/app-svg-icon/app-svg-icon';
import { resolveTemplateWithObject } from '../../../../core/template-resolver';
import { DynamicRenderer } from '../dynamic-renderer';
import { StatusBadge } from '../../../../components/feedback/status-badge/status-badge';
import { ContextMenuButton, ContextMenuButtonAction } from '../../../../components/overlay/context-menu-button/context-menu-button';
import { BadgeConfigProperty, ColumnDef, ContextMenuActionConfig, TableActionEvent } from '../desktop-data-table/desktop-data-table';

@Component({
  selector: 'ui-table-cell-renderer',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DynamicRenderer,
    StatusBadge,
    ContextMenuButton,
    AppSvgIcon
  ],
templateUrl: './table-cell-renderer.html',
})
export class TableCellRenderer {
  column = input.required<ColumnDef>();
  rowData = input.required<any>();
  rowIndex = input.required<number>();
  isLastRow = input.required<boolean>();
  
  actionPerformed = output<TableActionEvent>();

  getPropertyValue(): any {
    const col = this.column();
    const data = this.rowData();
    
    if (col.displayTemplate) {
      return resolveTemplateWithObject(data, col.displayTemplate);
    }
    
    let value = '';
    if (col.key) {
      value = col.key.split('.').reduce((acc, part) => acc && acc[part], data);
    }
    
    return col.formatter?.(value) ?? col.objectFormatter?.(data) ?? value;
  }

  getBadgeProperty(): BadgeConfigProperty | null {
    const badgeConfigProperties = this.column().badgeConfig?.properties ?? [];
    let matchedBadgeConfigProperty: BadgeConfigProperty | null = null;
    const value = this.getPropertyValue();
    
    badgeConfigProperties.forEach(badgeConfigProperty => {
      if (value === badgeConfigProperty.data) {
        matchedBadgeConfigProperty = badgeConfigProperty;
      }
    });
    
    return matchedBadgeConfigProperty;
  }

  getContextMenuActions(actions: ContextMenuActionConfig[] | ((item: any) => ContextMenuActionConfig[]) | null | undefined, item: any): ContextMenuButtonAction[] {
    let actionConfigs: ContextMenuActionConfig[] = [];
    if (typeof actions === 'function') {
      actionConfigs = actions(item);
    } else if (actions) {
      actionConfigs = actions;
    }
    return actionConfigs.map(action => ({
      iconPath: action.iconPath,
      label: action.label,
      actionKey: action.actionKey
    }));
  }

  getFlexJustify(): string {
    switch (this.column().alignment) {
      case 'left': return 'justify-start';
      case 'center': return 'justify-center';
      case 'right': return 'justify-end';
      default: return 'justify-start';
    }
  }

  onActionClicked(actionKey: string, mouseEvent: MouseEvent | null) {
    if (mouseEvent) {
      mouseEvent.stopPropagation();
    }
    this.actionPerformed.emit({
      actionKey,
      item: this.rowData()
    });
  }
}