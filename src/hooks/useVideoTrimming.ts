import { useMutation } from '@tanstack/react-query';
import { trimVideo } from 'expo-trim-video';
import { CropData } from '../types';

interface TrimVideoParams {
  sourceUri: string;
  cropData: CropData;
}

const trimVideoAsync = async ({ sourceUri, cropData }: TrimVideoParams) => {
  try {
    const result = await trimVideo({
      uri: sourceUri,
      start: cropData.startTime,
      end: cropData.endTime
    });
    
    return {
      uri: result.uri,
      duration: cropData.duration,
    };
  } catch (error) {
    console.error('Error trimming video:', error);
    throw new Error('Video trimming failed');
  }
};

export const useVideoTrimming = () => {
  return useMutation({
    mutationFn: trimVideoAsync,
    onError: (error) => {
      console.error('Video trimming failed:', error);
    },
  });
};