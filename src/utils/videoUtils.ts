import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

export interface ProcessedVideo {
  uri: string;
  duration: number;
  name: string;
  localUri?: string;
  isFromCloud: boolean;
}

export const downloadAndProcessVideo = async (
  asset: MediaLibrary.Asset
): Promise<ProcessedVideo | null> => {
  try {
    console.log('Processing video asset:', asset.id);
    
    // Get detailed asset info
    const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
    console.log('Asset info:', assetInfo);

    let finalUri = assetInfo.localUri || assetInfo.uri;
    let isFromCloud = false;

    // Check if video needs to be downloaded from iCloud
    if (!assetInfo.localUri && assetInfo.uri.startsWith('ph://')) {
      console.log('Video is in iCloud, attempting to get local copy...');
      isFromCloud = true;

      // Try to get a local URI
      // This might trigger automatic download on iOS
      try {
        const localAssetInfo = await MediaLibrary.getAssetInfoAsync(asset);
        if (localAssetInfo.localUri) {
          finalUri = localAssetInfo.localUri;
          console.log('Got local URI:', finalUri);
        } else {
          console.log('No local URI available, using original');
          finalUri = assetInfo.uri;
        }
      } catch (downloadError) {
        console.log('Could not get local copy:', downloadError);
        throw new Error('This video needs to be downloaded from iCloud first');
      }
    }

    // Verify the file exists and is accessible
    if (finalUri.startsWith('file://')) {
      const fileInfo = await FileSystem.getInfoAsync(finalUri);
      if (!fileInfo.exists) {
        throw new Error('Video file not found locally');
      }
      console.log('Video file verified locally:', fileInfo.size);
    }

    return {
      uri: finalUri,
      duration: assetInfo.duration || 30,
      name: asset.filename || `Video ${new Date().toLocaleTimeString()}`,
      localUri: assetInfo.localUri,
      isFromCloud,
    };
  } catch (error) {
    console.error('Error processing video:', error);
    
    if (error instanceof Error && error.message.includes('iCloud')) {
      Alert.alert(
        'iCloud Video',
        'This video is stored in iCloud and needs to be downloaded first. Please open Photos app, tap the video to download it, then try again.',
        [{ text: 'OK' }]
      );
    }
    
    return null;
  }
};

export const checkVideoAvailability = async (uri: string): Promise<boolean> => {
  try {
    if (uri.startsWith('file://')) {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      return fileInfo.exists;
    }
    return true; // Assume other URIs are available
  } catch {
    return false;
  }
};