import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { SimpleVideoSlider } from "../components/SimpleVideoSlider";
import { useVideoTrimming } from "../hooks/useVideoTrimming";
import { useVideoStore } from "../store/videoStore";
import { CropData, VideoEntry } from "../types";
import { downloadAndProcessVideo } from "../utils/videoUtils";

interface SelectedVideo {
  uri: string;
  duration: number;
  name: string;
}

export const CropModalScreen = () => {
  const navigation = useNavigation();
  const { addVideo } = useVideoStore();
  const trimMutation = useVideoTrimming();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedVideo, setSelectedVideo] = useState<SelectedVideo | null>(
    null
  );
  const [cropData, setCropData] = useState<CropData>({
    startTime: 0,
    endTime: 5,
    duration: 5,
  });
  const [videoName, setVideoName] = useState("");
  const [videoDescription, setVideoDescription] = useState("");

  const handleVideoSelection = useCallback(async () => {
    try {
      console.log("Starting video selection...");

      // Request gallery permissions
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log("Permission status:", status);

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant gallery permissions to select videos."
        );
        return;
      }

      console.log("Launching image library...");

      // Launch gallery with video selection - force local copy
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 0.8,
        // Force download from iCloud if needed
        allowsMultipleSelection: false,
        exif: false,
        base64: false,
      });

      console.log("ImagePicker result:", result);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        console.log("Selected asset details:", {
          uri: asset.uri,
          duration: asset.duration,
          fileName: asset.fileName,
          type: asset.type,
          fileSize: asset.fileSize,
        });

        // Check if this is likely an iCloud video
        const isCloudVideo =
          asset.uri.includes("ph://") ||
          !asset.uri.startsWith("file://") ||
          asset.fileSize === undefined;

        if (isCloudVideo) {
          Alert.alert(
            "Processing Video",
            "Processing video from iCloud... This may take a moment.",
            [{ text: "OK" }]
          );
        }

        // First, try with ImagePicker asset directly
        try {
          const videoDuration = asset.duration ? asset.duration / 1000 : 30;

          const videoData: SelectedVideo = {
            uri: asset.uri,
            duration: videoDuration,
            name: asset.fileName || `Video ${new Date().toLocaleTimeString()}`,
          };

          setSelectedVideo(videoData);
          setCropData({
            startTime: 0,
            endTime: Math.min(5, videoDuration),
            duration: Math.min(5, videoDuration),
          });
          setStep(2);

          console.log(
            "Video selected successfully with ImagePicker:",
            videoData
          );
        } catch (processingError) {
          console.log(
            "ImagePicker asset failed, trying MediaLibrary fallback..."
          );

          // If ImagePicker fails, try MediaLibrary approach for iCloud videos
          try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status === "granted") {
              // Get the most recent videos and try to match
              const mediaAssets = await MediaLibrary.getAssetsAsync({
                mediaType: MediaLibrary.MediaType.video,
                first: 20,
                sortBy: MediaLibrary.SortBy.creationTime,
              });

              // Try to find a matching video by filename
              const matchingAsset = mediaAssets.assets.find(
                (a) => a.filename === asset.fileName
              );

              if (matchingAsset) {
                console.log("Found matching MediaLibrary asset, processing...");
                const processedVideo = await downloadAndProcessVideo(
                  matchingAsset
                );

                if (processedVideo) {
                  const videoData: SelectedVideo = {
                    uri: processedVideo.uri,
                    duration: processedVideo.duration,
                    name: processedVideo.name,
                  };

                  setSelectedVideo(videoData);
                  setCropData({
                    startTime: 0,
                    endTime: Math.min(5, processedVideo.duration),
                    duration: Math.min(5, processedVideo.duration),
                  });
                  setStep(2);

                  console.log(
                    "Video processed successfully with MediaLibrary:",
                    videoData
                  );
                  return;
                }
              }
            }

            throw new Error("Could not process video");
          } catch (fallbackError) {
            throw fallbackError;
          }
        }
      } else {
        console.log("Video selection was cancelled");
      }
    } catch (error) {
      console.error("Video selection error:", error);

      // More specific error handling for iCloud issues
      const errorMessage = error instanceof Error ? error.message : "";

      if (errorMessage.includes("3164") || errorMessage.includes("PHPhotos")) {
        Alert.alert(
          "iCloud Video Error",
          "This video appears to be stored in iCloud and needs to be downloaded first. Please:\n\n1. Go to Photos app\n2. Tap the video to download it\n3. Try selecting it again",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Error",
          "Failed to select video from gallery. Please try again."
        );
      }
    }
  }, []);

  const handleCropDataChange = useCallback((newCropData: CropData) => {
    setCropData(newCropData);
  }, []);

  const handleNext = useCallback(() => {
    if (step === 2) {
      setStep(3);
    }
  }, [step]);

  const handleSave = useCallback(async () => {
    if (!selectedVideo || !videoName.trim()) {
      Alert.alert("Error", "Please provide a name for your video.");
      return;
    }

    try {
      const trimResult = await trimMutation.mutateAsync({
        sourceUri: selectedVideo.uri,
        cropData,
      });

      const newVideo: VideoEntry = {
        id: Date.now().toString(),
        name: videoName.trim(),
        description: videoDescription.trim(),
        uri: trimResult.uri,
        duration: trimResult.duration,
        createdAt: new Date().toISOString(),
      };

      addVideo(newVideo);
      navigation.goBack();

      Alert.alert("Success", "Video saved successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to save video. Please try again.");
      console.error("Video save error:", error);
    }
  }, [
    selectedVideo,
    cropData,
    videoName,
    videoDescription,
    trimMutation,
    addVideo,
    navigation,
  ]);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select a Video</Text>
      <Text style={styles.stepDescription}>
        Choose a video from your gallery to crop a 5-second segment.
      </Text>

      <TouchableOpacity
        style={styles.selectButton}
        onPress={handleVideoSelection}
      >
        <Ionicons name="videocam" size={20} color="#ffffff" />
        <Text style={styles.selectButtonText}>Select from Gallery</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Crop Video</Text>

      {selectedVideo && (
        <SimpleVideoSlider
          videoUri={selectedVideo.uri}
          videoDuration={selectedVideo.duration}
          onCropDataChange={handleCropDataChange}
          initialCropData={cropData}
        />
      )}

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next: Add Details</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Add Details</Text>
      <Text style={styles.stepDescription}>
        Provide a name and description for your video.
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Name *</Text>
        <TextInput
          style={styles.textInput}
          value={videoName}
          onChangeText={setVideoName}
          placeholder="Enter video name"
          placeholderTextColor="rgba(148, 163, 184, 0.6)"
          maxLength={100}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={[styles.textInput, styles.descriptionInput]}
          value={videoDescription}
          onChangeText={setVideoDescription}
          placeholder="Enter video description (optional)"
          placeholderTextColor="rgba(148, 163, 184, 0.6)"
          multiline
          numberOfLines={4}
          maxLength={500}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        style={[
          styles.saveButton,
          trimMutation.isPending && styles.disabledButton,
        ]}
        onPress={handleSave}
        disabled={trimMutation.isPending || !videoName.trim()}
      >
        {trimMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Video</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="formSheet"
      transparent={false}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={18} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>Step {step} of 3</Text>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141121", // Dark background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: "rgba(20, 17, 33, 0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148, 163, 184, 0.1)",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(148, 163, 184, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  stepIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#4f30e8", // Primary color
    borderRadius: 12,
  },
  stepText: {
    fontSize: 12,
    color: "#ffffff",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: 24,
    alignItems: "center",
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#ffffff",
    marginBottom: 12,
    textAlign: "center",
  },
  stepDescription: {
    fontSize: 16,
    color: "rgba(148, 163, 184, 1)",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
    maxWidth: 300,
  },
  selectButton: {
    backgroundColor: "#4f30e8", // Primary color
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
    minWidth: 200,
    shadowColor: "#4f30e8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  selectButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  nextButton: {
    backgroundColor: "#4f30e8",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 32,
    minWidth: 180,
    shadowColor: "#4f30e8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  nextButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: "rgba(71, 85, 105, 0.5)",
    borderRadius: 12,
    padding: 18,
    fontSize: 16,
    backgroundColor: "rgba(71, 85, 105, 0.1)",
    color: "#ffffff",
  },
  descriptionInput: {
    height: 120,
    textAlignVertical: "top",
    paddingTop: 18,
  },
  saveButton: {
    backgroundColor: "#10b981", // Green color
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 24,
    width: "100%",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: "rgba(71, 85, 105, 0.4)",
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
