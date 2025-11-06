import { MidiData, PushController } from '../midi';
import { EASE_TYPE } from '../types/types';
import { Grid, GRID_METHOD } from '../grid';

export default class UserInterface {
  private pushController: PushController;

  constructor(pushController: PushController) {
    this.pushController = pushController;

    this.pushController.addEventListener('flash', (event: Event) => {
      const customEvent = event as CustomEvent;
      this.flashButton(customEvent.detail.buttonId);
    });

    this.pushController.addEventListener('knobChange', (e: Event) => {
      const event = e as CustomEvent;
      this.updateKnobDisplay(event.detail.knobIndex, event.detail.value);
    });

    this.pushController.addEventListener('gridMethodChange', (e: Event) => {
      const event = e as CustomEvent;
      this.updateGridMethodDisplay(event.detail.method);
    });

    // this.pushController.addEventListener('easeTypeChange', (e: Event) => {
    //   const event = e as CustomEvent;
    //   this.updateEaseTypeDisplay(event.detail.easeType);
    // });
  }

  private updateKnobDisplay(index: number, value: number) {
    const knobValue = document.getElementById(`knob${index}-value`);
    if (knobValue) {
      knobValue.textContent = value.toFixed(2);
    }
  }

  private updateGridMethodDisplay(grid: Grid) {
    const gridMethodValue = document.getElementById('grid-method-value');
    const methodNames = Object.values(GRID_METHOD).filter((ease) => typeof ease === 'string');
    if (gridMethodValue)
      gridMethodValue.textContent = methodNames[grid.getMethod()] || methodNames[GRID_METHOD.Uniform];

    const easeTypes = Object.values(EASE_TYPE).filter((ease) => typeof ease === 'string');
    const easeTypeElement = document.getElementById('ease-type-value');
    if (easeTypeElement) easeTypeElement.textContent = easeTypes[grid.getEaseType()] || easeTypes[EASE_TYPE.parabola];
  }

  flashButton = (buttonId: string): void => {
    const button = document.getElementById(buttonId);
    if (!button) return;

    button.classList.add('active');
    setTimeout(() => {
      button.classList.remove('active');
    }, 150);
  };
}
