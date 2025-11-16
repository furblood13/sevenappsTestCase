import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import * as MediaLibrary from "expo-media-library";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated";
import { SimpleVideoSlider } from "../src/components/SimpleVideoSlider";
import { useVideoTrimming } from "../src/hooks/useVideoTrimming";
import { useVideoStore } from "../src/store/videoStore";
import { CropData, VideoEntry } from "../src/types";
import { downloadAndProcessVideo } from "../src/utils/videoUtils";
import LottieView from "lottie-react-native";

interface SelectedVideo {
  uri: string;
  duration: number;
  name: string;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function CropModalScreen() {
  const router = useRouter();
  const { addVideo } = useVideoStore();
  const trimMutation = useVideoTrimming();
  const animation = useRef<LottieView>(null);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedVideo, setSelectedVideo] = useState<SelectedVideo | null>(null);
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

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log("Permission status:", status);

      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant gallery permissions to select videos."
        );
        return;
      }

      console.log("Launching image library...");

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 0.8,
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

          console.log("Video selected successfully with ImagePicker:", videoData);
        } catch (processingError) {
          console.log("ImagePicker asset failed, trying MediaLibrary fallback...");

          try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status === "granted") {
              const mediaAssets = await MediaLibrary.getAssetsAsync({
                mediaType: MediaLibrary.MediaType.video,
                first: 20,
                sortBy: MediaLibrary.SortBy.creationTime,
              });

              const matchingAsset = mediaAssets.assets.find(
                (a) => a.filename === asset.fileName
              );

              if (matchingAsset) {
                console.log("Found matching MediaLibrary asset, processing...");
                const processedVideo = await downloadAndProcessVideo(matchingAsset);

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

                  console.log("Video processed successfully with MediaLibrary:", videoData);
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
      router.back();

      Alert.alert("Success", "Video saved successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to save video. Please try again.");
      console.error("Video save error:", error);
    }
  }, [selectedVideo, cropData, videoName, videoDescription, trimMutation, addVideo, router]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const renderStep1 = () => (
    <Animated.View
      entering={SlideInRight.springify()}
      exiting={SlideOutLeft.springify()}
      className="p-6 items-center"
    >
      <Text className="text-3xl font-extrabold text-white mb-3 text-center">
        Select a Video
      </Text>
      <Text className="text-base text-[#94a3b8] text-center mb-10 leading-6 max-w-[300px]">
        Choose a video from your gallery to crop a 5-second segment.
      </Text>
      <LottieView
        autoPlay
        ref={animation}
        style={{
          width: 300,
          height: 300,
          backgroundColor: "transparent",
          marginTop: 20,
        }}
        source={require("../assets/Gallery.json")}
      />
      <AnimatedTouchableOpacity
        className="bg-[#1c6e5d] px-10 py-4 rounded-2xl items-center justify-center flex-row gap-3 min-w-[200px] shadow-lg shadow-white/30 mt-5"
        onPress={handleVideoSelection}
      >
        <Ionicons name="videocam" size={30} color="#ffffff" />
        <Text className="text-white text-base font-bold tracking-wide">
          Select from Gallery
        </Text>
      </AnimatedTouchableOpacity>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View
      entering={SlideInRight.springify()}
      exiting={SlideOutLeft.springify()}
      className="p-6 items-center"
    >
      <Text className="text-3xl font-extrabold text-white mb-3 text-center">
        Crop Video
      </Text>

      {selectedVideo && (
        <SimpleVideoSlider
          videoUri={selectedVideo.uri}
          videoDuration={selectedVideo.duration}
          onCropDataChange={handleCropDataChange}
          initialCropData={cropData}
        />
      )}

      <AnimatedTouchableOpacity
        className="bg-[#1c6e5d] px-8 py-4 rounded-2xl items-center mt-8 min-w-[180px] shadow-md shadow-white/20"
        onPress={handleNext}
      >
        <Text className="text-white text-base font-semibold">Next: Add Details</Text>
      </AnimatedTouchableOpacity>
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View
      entering={SlideInRight.springify()}
      exiting={SlideOutLeft.springify()}
      className="p-6 items-center"
    >
      <Text className="text-3xl font-extrabold text-white mb-3 text-center">
        Add Details
      </Text>
      <Text className="text-base text-[#94a3b8] text-center mb-10 leading-6 max-w-[300px]">
        Provide a name and description for your video.
      </Text>

      <View className="w-full mb-6">
        <Text className="text-base font-semibold text-white mb-3 tracking-wide">
          Name *
        </Text>
        <TextInput
          className="border-[1.5px] border-slate-600/50 rounded-xl p-4 text-base bg-slate-600/10 text-white"
          value={videoName}
          onChangeText={setVideoName}
          placeholder="Enter video name"
          placeholderTextColor="rgba(148, 163, 184, 0.6)"
          maxLength={100}
        />
      </View>

      <View className="w-full mb-6">
        <Text className="text-base font-semibold text-white mb-3 tracking-wide">
          Description
        </Text>
        <TextInput
          className="border-[1.5px] border-slate-600/50 rounded-xl p-4 pt-4 text-base bg-slate-600/10 text-white h-[120px]"
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

      <AnimatedTouchableOpacity
        className={`px-8 py-5 rounded-2xl items-center mt-6 w-full shadow-lg ${
          trimMutation.isPending || !videoName.trim()
            ? "bg-slate-600/40"
            : "bg-[#1c6e5d] shadow-white/30"
        }`}
        onPress={handleSave}
        disabled={trimMutation.isPending || !videoName.trim()}
      >
        {trimMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-base font-bold tracking-wide">
            Save Video
          </Text>
        )}
      </AnimatedTouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#141121]">
      <View className="flex-row items-center justify-between px-5 pt-4 pb-4 bg-[#141121]/95 border-b border-slate-400/10">
        <TouchableOpacity
          className="w-9 h-9 rounded-full bg-slate-400/10 items-center justify-center"
          onPress={handleClose}
        >
          <Ionicons name="close" size={18} color="#ffffff" />
        </TouchableOpacity>
        <View className="px-3 py-1.5 bg-[#1c6e5d] rounded-xl">
          <Text className="text-xs text-white font-semibold">
            Step {step} of 3
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>
    </SafeAreaView>
  );
}
