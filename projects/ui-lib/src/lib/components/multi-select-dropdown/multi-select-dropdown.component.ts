import {
    AfterContentInit, ChangeDetectorRef,
    Component,
    ElementRef, HostListener,
    inject,
    input,
    output, Renderer2,
    signal,
    viewChild,
    ViewChild
} from '@angular/core';
import {FormControl, FormsModule, NgControl} from "@angular/forms";
import {CdkConnectedOverlay, Overlay} from "@angular/cdk/overlay";
import {NgClass} from "@angular/common";
import {resolveTemplateWithObject} from "../../core/template-resolver";
import {deepEqual} from "../../core/base-input-utils";
import {CheckboxComponent} from "../checkbox/checkbox.component";
import { State } from '@shared/core/base-state';
import { BaseInputComponent } from '@shared/core/base-input/base-input.component';
import { HumanizeFormMessagesPipe } from '@shared/core/humanize-form-messages.pipe';
import { BaseControlValueAccessor } from '../../core/base-control-value-accessor';

@Component({
    selector: 'app-multi-select-dropdown',
    standalone: true,
    imports: [
        BaseInputComponent,
        NgClass,
        HumanizeFormMessagesPipe,
        CdkConnectedOverlay,
        CheckboxComponent,
        FormsModule
    ],
    templateUrl: './multi-select-dropdown.component.html',
    styleUrl: './multi-select-dropdown.component.scss'
})
export class MultiSelectDropdownComponent<T> extends BaseControlValueAccessor implements AfterContentInit {

    cdr = inject(ChangeDetectorRef);
    renderer = inject(Renderer2);
    overlay = inject(Overlay);

    title = input<string | null>();
    items = input<T[]>([]);
    placeholder = input<string>('Select');
    display = input<string | null>();
    displayTemplate = input<string | null>();
    value = input<string>('');
    identifier = input<string>('id');
    searchKeyMatch = input<string | null>();
    noDataMessage = input<string>();
    state = input<State<any>>();
    fullWidth = input<boolean>(false);
    showErrorSpace = input<boolean>(false);
    enableSearch = input<boolean>(false);
    addActionText = input<string | null>();
    minimumPopupWidth = input(250);
    appearance = input<MultiSelectDropdownAppearance>(MultiSelectDropdownAppearance.standard);

    valueChanged = output<T[]>();
    addActionClicked = output<void>();

    isOpen = signal(false);
    highlightedIndex = signal(-1);
    dropUp = signal(false);
    dropdownWidth = signal(300);
    selectedItems = signal<T[]>([]);
    filteredList = signal<T[]>([]);
    errorMessages = signal<{ [key: string]: string }>({});

    @ViewChild('dropdownButton', {static: true}) dropdownButton!: ElementRef;
    @ViewChild('dropdownListContainer', {static: false}) dropdownListContainer!: ElementRef;
    @ViewChild('dropdownList', {static: false}) dropdownList!: ElementRef;
    private searchField = viewChild<ElementRef<HTMLInputElement>>('searchField');

    scrollStrategy = this.overlay.scrollStrategies.block();

    ngControl = inject(NgControl, {optional: true, self: true});

    MultiSelectDropdownAppearance = MultiSelectDropdownAppearance;

    constructor() {
        super();
        if (this.ngControl) {
            this.ngControl!.valueAccessor = this;
        }
    }

    override onWriteValue(value: any): void {

    }

    ngAfterContentInit(): void {
        let formControl = this.ngControl?.control as FormControl;
        if (formControl) {
            this.formControl = this.ngControl?.control as FormControl;
            if (this.formControl.value == null) {
                this.formControl.setValue([]);
            }
            if (!Array.isArray(this.formControl.value)) {
                this.formControl.setValue([]);
            }
        }
    }

    getValue(item: T): any {
        if (!this.value()) {
            return item;
        }
        let object = item as any;
        return this.value()!.split('.').reduce((acc, part) => acc && acc[part], object);
    }

    getAllValues(): any[] {
        let items = this.selectedItems() ?? [];
        let values = items.map((item: T) => this.getValue(item));
        return values;
    }

    getObjectUsingValue(selectedItem: T): any {
        if (this.value() == null || this.value() == '') {
            return selectedItem;
        }

        let valuePath = this.value()!;
        return this.items().find(item => {
            const propertyValue = valuePath.split('.').reduce((acc, part) => acc && acc[part], item as any);
            return propertyValue === this.getValue(selectedItem);
        });
    }

    getObjectUsingIdentifier(selectedItem: T): T | undefined {
        if (this.identifier() == null || this.identifier() == '') {
            return selectedItem;
        }
        let identifierPath = this.identifier()!;
        return this.items().find(item => {
            const propertyValue = identifierPath.split('.').reduce((acc, part) => acc && acc[part], item as any);
            return propertyValue === this.getIdentifier(selectedItem);
        });
    }

    getIdentifier(item: T): any {
        if (!this.identifier()) {
            return item;
        }
        let object = item as any;
        let identifier = this.identifier()!.split('.').reduce((acc, part) => acc && acc[part], object);
        return identifier;
    }

    isItemExistInFormControl(item: T) {
        const controlValue = (this.formControl.value as T[]) ?? [];
        let identifierPath = this.identifier() ?? '';
        let value = this.getIdentifier(item);


        let anyMatch = controlValue.some(x => x == value);
        if (anyMatch) {
            return true;
        }

        if (identifierPath == null || identifierPath == '') {
            return controlValue.some(x => deepEqual(x, item));
        }
        let isEqual = controlValue.find(x => {
            const propertyValue = identifierPath.split('.').reduce((acc, part) => acc && acc[part], x as any);
            return propertyValue === this.getIdentifier(item);
        });
        return isEqual;
    }

    isItemExistInNormalSelectionList(item: T) {
        const controlValue = (this.selectedItems()) ?? [];
        let identifierPath = this.identifier()!;
        if (identifierPath == null || identifierPath == '') {
            return controlValue.some(x => deepEqual(x, item));
        }
        let isEqual = controlValue.find(x => {
            const propertyValue = identifierPath.split('.').reduce((acc, part) => acc && acc[part], x as any);
            return propertyValue === this.getIdentifier(item);
        });
        return isEqual;
    }

    onItemClicked(item: T) {
        this.markAsTouched();

        const controlValue = (this.formControl.value as T[]) ?? [];
        const valueExistInFormControl = this.isItemExistInFormControl(item);
        const valueExistInSelections = this.isItemExistInNormalSelectionList(item);


        if (valueExistInFormControl || valueExistInSelections) {
            const index = controlValue.indexOf(item);
            controlValue.splice(index, 1);
            this.selectedItems.update(prev => {
                let index = prev.findIndex(x => deepEqual(x, item));
                prev.splice(index, 1);
                return prev;
            });
            let value = this.getAllValues();
            this.valueChanged.emit(value);
            this.onChange(controlValue);
        } else {
            controlValue.push(item);
            this.selectedItems.update(prev => {
                prev.push(item);
                return prev;
            });
            let value = this.getAllValues();
            this.valueChanged.emit(value);
            this.onChange(controlValue);
        }
    }

    getDisplayString(item: T | null): any {

        let object = item as any;
        if (object == null) {
            return null;
        }

        if (this.display() != null && this.display() != '') {
            return this.display()!.split('.').reduce((acc, part) => acc && acc[part], object);
        }

        if (this.displayTemplate() != null && this.displayTemplate() != '') {
            return resolveTemplateWithObject(object, this.displayTemplate()!);
        }

        return item;

    }

    filterList(event: Event) {
        const searchKeyword = (event.target as HTMLInputElement)?.value;

        if (this.enableSearch()) {
            this.updateFilteredList(searchKeyword);
        } else {
            const firstMatchingItem = this.findFirstMatch(searchKeyword);
            let index = this.filteredList().findIndex(item => item == firstMatchingItem);
            this.highlightedIndex.set(index);
        }
    }

    updateFilteredList(searchKeyword?: string) {

        if (!searchKeyword || searchKeyword.trim() === '') {
            return;
        }

        const filterResult = this.items().filter((item) => {
            const displayString = this.getDisplayString(item);
            if (typeof displayString === 'string') {
                return displayString.toLowerCase().includes(searchKeyword.toLowerCase());
            }
            return false;
        });

        this.filteredList.set(filterResult);
        this.updateHighlightedIndex();
    }

    findFirstMatch(searchKeyword?: string): T | null {
        if (!searchKeyword || searchKeyword.trim() === '') {
            return null;
        }
        return this.filteredList().find((item) => {
            const displayString = this.getDisplayString(item);
            if (typeof displayString === 'string') {
                return displayString.toLowerCase().includes(searchKeyword.toLowerCase());
            }
            return false;
        }) || null;
    }

    updateHighlightedIndex() {
        // TODO
        // let index = this.filteredList().findIndex(item => item == this.selectedItem());
        this.highlightedIndex.set(0);
    }

    setPopupWidth() {
        const buttonWidth = this.dropdownButton.nativeElement.offsetWidth;
        if (buttonWidth < this.minimumPopupWidth()) {
            this.dropdownWidth.set(this.minimumPopupWidth());
            return;
        }

        this.dropdownWidth.set(this.dropdownButton.nativeElement.offsetWidth);
    }

    onClickOutside() {
        this.isOpen.set(false);
    }

    toggleDropdown(): void {
        this.isOpen.update(prev => !prev);
        if (this.isOpen()) {
            this.filteredList.set(this.items());
            this.updateHighlightedIndex();
            this.adjustDropdownPosition();
            this.setPopupWidth();
            this.cdr.detectChanges();
            this.setDropdownMaxHeight();
            this.scrollToHighlightedItem();
            this.searchField()?.nativeElement.focus();
        }
    }

    setDropdownMaxHeight() {
        const buttonRect = this.dropdownButton.nativeElement.getBoundingClientRect();
        const spaceBelow = window.innerHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;

        let maxHeight;
        if (this.dropUp()) {
            maxHeight = spaceAbove - 36;
        } else {
            maxHeight = spaceBelow - 36;
        }

        if (this.dropdownListContainer) {
            this.renderer.setStyle(this.dropdownListContainer.nativeElement, 'max-height', `${maxHeight}px`);
        }
    }

    adjustDropdownPosition() {
        const buttonRect = this.dropdownButton.nativeElement.getBoundingClientRect();
        const spaceBelow = window.innerHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;
        this.dropUp.set(spaceAbove > spaceBelow && spaceBelow < 200);
    }

    scrollToHighlightedItem() {
        if (this.dropdownList && this.dropdownList.nativeElement.children[this.highlightedIndex()]) {
            const highlightedItem = this.dropdownList.nativeElement.children[this.highlightedIndex()];
            highlightedItem.scrollIntoView({block: 'nearest'});
        }
    }

    @HostListener('window:resize')
    onResize() {
        if (this.isOpen()) {
            this.adjustDropdownPosition();
        }
    }

    handleKeydown(event: KeyboardEvent) {
        if (!this.isOpen()) {
            return;
        }
        switch (event.key) {
            case 'ArrowDown':
                if (this.highlightedIndex() < this.filteredList().length - 1) {
                    this.highlightedIndex.update(prev => prev + 1);
                }
                this.scrollToHighlightedItem();
                event.preventDefault();
                break;
            case 'ArrowUp':
                if (this.highlightedIndex() > 0) {
                    this.highlightedIndex.update(prev => prev - 1);
                }
                this.scrollToHighlightedItem();
                event.preventDefault();
                break;
            case 'Enter':
                this.onItemClicked(this.filteredList()[this.highlightedIndex()]);
                event.preventDefault();
                break;
            case 'Escape':
                this.isOpen.set(false);
                event.preventDefault();
                break;
        }


        if (!this.enableSearch()) {
            let key = event.key;
            if (key.length === 1 && /^[a-zA-Z]$/.test(key)) {
                const matchingIndex = this.filteredList().findIndex(item => {
                        let resolvedText = '';
                        if (this.searchKeyMatch() != null && this.searchKeyMatch() != '') {
                            resolvedText = resolveTemplateWithObject(item as any, `$${this.searchKeyMatch()}`);
                        } else {
                            resolvedText = this.getDisplayString(item);
                        }
                        return resolvedText.toLowerCase().startsWith(key);
                    }
                );

                if (matchingIndex !== -1) {
                    this.highlightedIndex.set(matchingIndex);
                    this.scrollToHighlightedItem()
                }
            }
        }
    }

    onClearSearchClicked() {
        if (this.searchField()) {
            this.searchField()!.nativeElement.value = '';
            this.filteredList.set(this.items());
            this.highlightedIndex.set(0);
            this.scrollToHighlightedItem();
            this.searchField()!.nativeElement.focus();
        }
    }

    onSelectAllClicked() {
        this.formControl.setValue(this.items());
        this.selectedItems.set(this.items());
        this.valueChanged.emit(this.items());
    }

    onClearSelectionClicked() {
        this.formControl.setValue([]);
        this.selectedItems.set([]);
        this.valueChanged.emit([]);
    }

    getCsv(): string | null {
        let selectedItems = this.items().filter(x => {
            return this.isItemExistInFormControl(x) || this.isItemExistInNormalSelectionList(x);
        });

        let csv = selectedItems.map(item => {
            const displayString = this.getDisplayString(item);
            if (typeof displayString === 'string') {
                return displayString;
            }
            return '';
        }).join(', ');

        if (csv == '') {
            return null;
        }
        return csv;
    }

    onAddActionClicked() {
        this.addActionClicked.emit();
    }

}

export enum MultiSelectDropdownAppearance {
    standard,
    csv,
    chips
}
