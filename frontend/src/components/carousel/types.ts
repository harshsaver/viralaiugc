export type TextPosition = "top" | "center" | "bottom";

export type AspectRatio = "9:16" | "1:1" | "4:5" | "16:9";

export interface AspectRatioConfig {
  label: string;
  ratio: AspectRatio;
  width: number;
  height: number;
  description: string;
}

export interface TextElement {
  id: string;
  text: string;
  color: string;
  fontSize: number;
  fontFamily: string;
  position: TextPosition;
}

export interface StickerElement {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export type BackgroundType = "color" | "image" | "gradient" | "grid" | "grid-2x1" | "grid-1x2" | "grid-3x3";

export interface SlideData {
  id: string;
  backgroundType: BackgroundType;
  backgroundColor: string;
  backgroundImage: string;
  backgroundGradient?: string;
  gridImages?: string[];
  textElements: TextElement[];
  stickerElements: StickerElement[];
}
