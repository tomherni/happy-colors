import { validateHsv } from '../../../utils/colors.js';

export function getComplementaryColorScheme(hsv) {
  const [h, s, v] = hsv;
  return [validateHsv(hsv), validateHsv([Math.abs((h + 180) % 360), s, v])];
}

export function getTriadicColorScheme(hsv) {
  const [h, s, v] = hsv;
  return [
    validateHsv(hsv),
    validateHsv([Math.abs((h + 120) % 360), s, v]),
    validateHsv([Math.abs((h + 240) % 360), s, v]),
  ];
}

export function getAnalogousColorScheme(hsv) {
  const [h, s, v] = hsv;
  return [
    validateHsv([Math.abs((h + 25) % 360), s, v]),
    validateHsv(hsv),
    validateHsv([(360 + (h - 25)) % 360, s, v]),
  ];
}

export function getMonochromaticColorScheme(hsv) {
  const [h] = hsv;
  const amount = 8;
  const result = [];

  for (let n = 1; n < amount + 1; n += 1) {
    result.push(
      validateHsv([
        h,
        100 - Math.abs((200 / (amount + 1)) * n - 100),
        (100 / (amount + 1)) * n,
      ])
    );
  }

  return [validateHsv([h, 100, 100]), result];
}
