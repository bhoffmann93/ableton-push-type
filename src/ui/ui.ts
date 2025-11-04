import { PushController } from '../midi';
import { GRID_CONFIG } from '../config/grid.config';
import { EASE_TYPE, GRID_METHOD } from '../types/types';

export default class UserInterface {
  private pushController: PushController;

  constructor(pushController: PushController) {
    this.pushController = pushController;
    console.log('Initial midiData: ', pushController.getMidiData());
  }

  //!should be event based or update only on change
  public updateKnobs() {
    const midiData = this.pushController.getMidiData();

    //TOP ROW KNOBS
    for (let i = 1; i <= Object.keys(midiData).length; i++) {
      const knobKey = `knob${i}` as keyof typeof midiData;
      const knobAngle = midiData[knobKey] * 270 - 135; // Map 0-1 to -135° to 135°
      document.getElementById(`knob${i}`)?.style.setProperty('--rotation', `${knobAngle}deg`);
      const knobValue = document.getElementById(`knob${i}-value`);
      if (knobValue) knobValue.textContent = midiData[knobKey].toFixed(2);
    }

    // Update Grid Method display
    const gridMethodValue = document.getElementById('grid-method-value');
    const methodNames = Object.values(GRID_METHOD).filter((ease) => typeof ease === 'string');
    if (gridMethodValue)
      gridMethodValue.textContent = methodNames[GRID_CONFIG.gridMethod] || methodNames[GRID_METHOD.Uniform];

    const easeTypes = Object.values(EASE_TYPE).filter((ease) => typeof ease === 'string');
    const easeTypeElement = document.getElementById('ease-type-value');
    if (easeTypeElement) easeTypeElement.textContent = easeTypes[GRID_CONFIG.easeType] || easeTypes[EASE_TYPE.parabola];
  }
}
