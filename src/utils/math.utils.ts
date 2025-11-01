export const clampUndefined = (num: number, min: number, max: number): number | undefined => {
  if (max < min) {
    [min, max] = [max, min];
  }
  return num < min || num > max ? undefined : num;
};

export const clamp = (num: number, min: number, max: number) => {
  if (max < min) {
    [min, max] = [max, min];
  }
  if (num < min) return min;
  else if (num > max) return max;
  return num;
};

export const lerp = (min: number, max: number, amount: number) => {
  return min + amount * (max - min);
};

//https://www.gamedev.net/articles/programming/general-and-gameplay-programming/inverse-lerp-a-super-useful-yet-often-overlooked-function-r5230/
//also called inverse lerp gives a number between 0 and 1, that represents the position of a number between min and max
export const normalize = (num: number, min: number, max: number) => {
  return (num - min) / (max - min);
};

export const map = (
  num: number,
  min1: number,
  max1: number,
  min2: number,
  max2: number,
  round = false,
  constrainMin = true,
  constrainMax = true
) => {
  if (constrainMin && num < min1) return min2;
  if (constrainMax && num > max1) return max2;

  const num1 = (num - min1) / (max1 - min1);
  const num2 = num1 * (max2 - min2) + min2;
  if (round) return Math.round(num2);
  return num2;
};

export const mod = (n: number, m: number) => {
  return ((n % m) + m) % m;
};

export const step = (edge: number, x: number) => {
  return x < edge ? 0 : 1;
};

export const calcNextPowerOfTwo = (n: number) => {
  let power = 1;
  while (power < n) {
    power *= 2;
  }
  return power;
};

// Three math utils:
// http://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/
//try small lamda 0.002
export const damp = (x: number, y: number, lambda: number, dt: number) => {
  return lerp(x, y, 1 - Math.exp(-lambda * dt));
};

// cubicPulse( 0.5, 0.2, x);
export const cubicPulse = (c: number, w: number, x: number) => {
  x = Math.abs(x - c);
  if (x > w) return 0.0;
  x /= w;
  return 1.0 - x * x * (3.0 - 2.0 * x);
};

//https://iquilezles.org/articles/functions/
//bigger k wieder parabola
export const parabola = (x: number, k: number) => {
  return Math.pow(4.0 * x * (1.0 - x), k);
};

//https://thebookofshaders.com/05/kynd.png
//https://www.shadertoy.com/view/3tsyWl
//p = 0.5-3.5
//ts = -1-1 like bell
//ts 0-1 like easing
export const shapingFunctions = {
  a: (ts: number, p: number) => 1.0 - Math.pow(Math.abs(ts), p),
  b: (ts: number, p: number) => Math.pow(Math.cos((Math.PI * ts) / 2.0), p),
  c: (ts: number, p: number) => 1.0 - Math.pow(Math.min(Math.abs(Math.sin((Math.PI * ts) / 2.0)), 1.0), p),
  d: (ts: number, p: number) => Math.pow(Math.min(Math.cos((Math.PI * ts) / 2.0), 1.0 - Math.abs(ts)), p),
  e: (ts: number, p: number) => 1.0 - Math.pow(Math.max(0.0, Math.abs(ts) * 2.0 - 1.0), p),
};
