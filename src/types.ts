export type Hue = number;

export type Hsv = [Hue, number, number];

export type Rgb = [number, number, number];

export type Hsl = [Hue, number, number];

export type Hex = string;

/**
 * A specific color represented in different color models.
 */
export interface Colors {
  hsv: Hsv;
  rgb: Rgb;
  hsl: Hsl;
  hex: Hex;
}

export type SavedSchemeValue = Hex | null;

export type SavedScheme = SavedSchemeValue[];
