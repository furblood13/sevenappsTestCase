export interface VideoEntry {
  id: string;
  name: string;
  description: string;
  uri: string;
  thumbnail?: string;
  duration: number;
  createdAt: string;
}

export interface CropData {
  startTime: number;
  endTime: number;
  duration: number;
}

export type RootStackParamList = {
  Main: undefined;
  Details: { videoId: string };
  CropModal: undefined;
};