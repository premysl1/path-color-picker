export type Props = {
  frequency: number;
  selectFormat: React.RefObject<HTMLSelectElement | null>;
  canvas: React.RefObject<HTMLCanvasElement | null>;
  userImage: HTMLImageElement | null;
};

export interface Pixel {
  r: number;
  g: number;
  b: number;
  alpha: number;
}

export type Samples = {
  rgba: {
    r: number;
    g: number;
    b: number;
    alpha: number;
  };
  format: string;
  id: string;
}[];
