import { PushController } from '../midi';
import { EASE_TYPE } from '../types/types';
import { GRID_METHOD } from '../grid';

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

    this.pushController.addEventListener('easeTypeChange', (e: Event) => {
      const event = e as CustomEvent;
      this.updateEaseTypeDisplay(event.detail.easeType);
    });
  }

  private updateKnobDisplay = (index: number, value: number) => {
    const knobValue = document.getElementById(`knob${index}-value`);
    if (knobValue) {
      knobValue.textContent = value.toFixed(2);
    }
  };

  private updateGridMethodDisplay = (method: GRID_METHOD) => {
    const gridMethodValue = document.getElementById('grid-method-value');
    const methodNames = Object.values(GRID_METHOD).filter((ease) => typeof ease === 'string');
    if (gridMethodValue) gridMethodValue.textContent = methodNames[method] || methodNames[GRID_METHOD.Uniform];
  };

  private updateEaseTypeDisplay = (easeType: EASE_TYPE) => {
    const easeTypes = Object.values(EASE_TYPE).filter((ease) => typeof ease === 'string');
    const easeTypeElement = document.getElementById('ease-type-value');
    if (easeTypeElement) easeTypeElement.textContent = easeTypes[easeType] || easeTypes[EASE_TYPE.parabola];
  };

  private flashButton = (buttonId: string): void => {
    const button = document.getElementById(buttonId);
    if (!button) return;

    button.classList.add('active');
    setTimeout(() => {
      button.classList.remove('active');
    }, 150);
  };
}
