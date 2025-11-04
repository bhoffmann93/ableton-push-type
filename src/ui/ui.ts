import { PushController } from '../midi';
import { GRID_CONFIG } from '../config/grid.config';
import { MidiData } from '../midi';
import { EASE_TYPE, METHOD } from '../types/types';

export default class UserInterface {
  private midiData: MidiData;

  constructor(pushController: PushController) {
    this.midiData = pushController.getMidiData();
    console.log('this.midiData: ', this.midiData);
  }

  //!should be event based or update only on change
  public updateKnobs() {
    //TOP ROW KNOBS
    for (let i = 1; i <= Object.keys(this.midiData).length; i++) {
      const knobKey = `knob${i}` as keyof typeof this.midiData;
      const knobAngle = this.midiData[knobKey] * 270 - 135; // Map 0-1 to -135° to 135°
      document.getElementById(`knob${i}`)?.style.setProperty('--rotation', `${knobAngle}deg`);
      const knobValue = document.getElementById(`knob${i}-value`);
      if (knobValue) knobValue.textContent = this.midiData[knobKey].toFixed(2);
    }

    // Update Grid Method display
    const gridMethodValue = document.getElementById('grid-method-value');
    const methodNames = Object.values(METHOD).filter((ease) => typeof ease === 'string');
    if (gridMethodValue) gridMethodValue.textContent = methodNames[GRID_CONFIG.gridMethod] || methodNames[METHOD.EQUAL];

    const easeTypes = Object.values(EASE_TYPE).filter((ease) => typeof ease === 'string');
    const easeTypeElement = document.getElementById('ease-type-value');
    if (easeTypeElement) easeTypeElement.textContent = easeTypes[GRID_CONFIG.easeType] || easeTypes[EASE_TYPE.parabola];
  }
}
