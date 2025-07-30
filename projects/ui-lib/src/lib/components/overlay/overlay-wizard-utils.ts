import {signal, WritableSignal} from "@angular/core";

export class OverlayWizardUtils {

  uiState = signal<OverlayWizard[]>([]);
  wizard = signal<OverlayWizard[]>([]);

  showBackButton(): boolean {
    return this.uiState().length > 1;
  }

  activeWizard(): OverlayWizard {
    return this.uiState()[this.uiState().length - 1];
  };

  constructor(wizard: WritableSignal<OverlayWizard[]>, uiState?: WritableSignal<OverlayWizard[]> | null) {
    this.wizard = wizard;
    if (uiState) {
      this.uiState = uiState;
    } else {
      let fistState = wizard()[0];
      if (fistState) {
        this.uiState.set([fistState]);
      }
    }
  }

  goBack() {
    if (this.uiState().length > 1) {
      this.uiState.update(prev => prev.slice(0, prev.length - 1));
    }
  }

  append(wizardKey: any) {
    let wizard = this.wizard().find(x => x.key == wizardKey);
    if (wizard) {
      this.uiState.update(prev => {
        return [...prev, wizard];
      });
    }
    console.log(wizard);
    console.log(this.uiState());
  }

  closeUntil(wizard: any) {
    const wizardList = this.wizard();
    for (let i = wizardList.length - 1; i >= 0; i--) {
      if (wizardList[i].key === wizard) {
        const updatedList = wizardList.slice(0, i + 1);
        this.uiState.set(updatedList);
        break;
      }
    }
  }
}

export interface OverlayWizard {
  title: string;
  key: any;
}
