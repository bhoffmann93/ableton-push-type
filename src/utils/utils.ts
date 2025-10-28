export const getDateAndTimeString = () => {
  const date = new Date();
  const dateTime =
    date.getFullYear() +
    ('0' + (date.getMonth() + 1)).slice(-2) +
    ('0' + date.getDate()).slice(-2) +
    ('0' + date.getHours()).slice(-2) +
    ('0' + date.getMinutes()).slice(-2) +
    ('0' + date.getSeconds()).slice(-2);
  return dateTime;
};

export const step = (edge: number, x: number) => {
  return x < edge ? 0 : 1;
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

export const parabola = (x: number, k: number) => {
  return Math.pow(4.0 * x * (1.0 - x), k);
};

export const sinc = (x: number, k: number) => {
  const a = Math.PI * (k * x - 1.0);
  return Math.sin(a) / a;
};

export const linearPeak = (t: number) => {
  if (t <= 0.5) {
    return 2 * t;
  } else {
    return 2 - 2 * t;
  }
};

//maps 0-1 to 0-1-0
export const peakify = (t: number, easing: (x: number) => number): number => {
  if (t <= 0.5) {
    const t1 = 2 * t;
    return easing(t1);
  } else {
    const t2 = 2 - 2 * t;
    return easing(t2);
  }
};

export const peakifyInverted = (t: number, easing: (x: number) => number): number => {
  if (t <= 0.5) {
    const t1 = 2 * t;
    return easing(1 - t1);
  } else {
    const t2 = 2 - 2 * t;
    return easing(1 - t2);
  }
};
