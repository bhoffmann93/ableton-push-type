import { clamp } from '../utils/utils';
import { KnobConfig } from '../types/push.types';

export class Knob {
  private value: number;
  public config: KnobConfig;

  constructor(public readonly id: number, config: KnobConfig) {
    this.config = config;
    this.value = config.initialValue;
  }

  getValue(): number {
    return this.value;
  }

  increment(): void {
    this.setValue(this.value + this.config.increment);
  }

  decrement(): void {
    this.setValue(this.value - this.config.increment);
  }

  setValue(newValue: number): void {
    this.value = clamp(newValue, this.config.min, this.config.max);
  }

  getConfig(): KnobConfig {
    return this.config;
  }
}
