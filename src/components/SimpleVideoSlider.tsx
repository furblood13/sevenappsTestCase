import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Video, ResizeMode } from "expo-av";
import Slider from "@react-native-community/slider";
import { CropData } from "../types";

interface SimpleVideoSliderProps {
  videoUri: string;
  videoDuration: number;
  onCropDataChange: (cropData: CropData) => void;
  initialCropData?: CropData;
}

const SCRUBBER_WIDTH = 300;
const FIXED_DURATION = 5; // Sabit 5 saniye

export const SimpleVideoSlider: React.FC<SimpleVideoSliderProps> = ({
  videoUri,
  videoDuration,
  onCropDataChange,
  initialCropData,
}) => {
  const videoRef = useRef<Video>(null);
  const [startTime, setStartTime] = useState(initialCropData?.startTime || 0);
  const [currentPosition, setCurrentPosition] = useState(0);

  // Sabit 5 saniyelik segment
  const endTime = startTime + FIXED_DURATION;

  useEffect(() => {
    onCropDataChange({
      startTime,
      endTime,
      duration: FIXED_DURATION,
    });
  }, [startTime, onCropDataChange]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (videoRef.current) {
        const status = await videoRef.current.getStatusAsync();
        if (status.isLoaded && status.positionMillis !== undefined) {
          setCurrentPosition(status.positionMillis / 1000);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleRangeChange = (value: number) => {
    // 5 saniyelik pencereyi kaydır
    const maxStart = Math.max(0, videoDuration - FIXED_DURATION);
    const newStartTime = Math.max(0, Math.min(value, maxStart));
    setStartTime(newStartTime);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleSeekTo = async (position: number) => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(position * 1000);
    }
  };

  const playSelectedSegment = async () => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(startTime * 1000);
      await videoRef.current.playAsync();

      setTimeout(async () => {
        if (videoRef.current) {
          await videoRef.current.pauseAsync();
        }
      }, FIXED_DURATION * 1000);
    }
  };

  // Progress bar calculation
  const progressPercent =
    videoDuration > 0 ? (currentPosition / videoDuration) * 100 : 0;
  const selectedStartPercent =
    videoDuration > 0 ? (startTime / videoDuration) * 100 : 0;
  const selectedWidthPercent =
    videoDuration > 0 ? (FIXED_DURATION / videoDuration) * 100 : 0;

  return (
    <View className="items-center py-2">
      <View
        className="bg-black rounded-2xl overflow-hidden mb-8 shadow-lg"
        style={{ width: SCRUBBER_WIDTH, height: SCRUBBER_WIDTH * 0.5625 }}
      >
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          style={{ flex: 1 }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
        />
      </View>

      <View className="w-full items-center">
        {/* Selected Time Display */}
        <View className="items-center mb-5 bg-slate-600/20 rounded-xl p-4 border border-slate-600/30">
          <Text className="text-xl font-bold text-white mb-1">
            {formatTime(startTime)} - {formatTime(endTime)}
          </Text>
          <Text className="text-xs text-slate-400 font-medium uppercase tracking-wide">
            5 Second Clip
          </Text>
        </View>

        {/* Visual Timeline */}
        <View className="mb-5" style={{ width: SCRUBBER_WIDTH }}>
          <View className="h-2 relative rounded overflow-hidden">
            {/* Full video timeline */}
            <View className="absolute top-0 left-0 right-0 h-2 bg-slate-600/40 rounded" />

            {/* Selected 5-second range */}
            <View
              className="absolute top-0 h-2 bg-[#735de4] rounded shadow-md shadow-[#735de4]/40"
              style={{
                left: `${selectedStartPercent}%`,
                width: `${selectedWidthPercent}%`,
              }}
            />

            {/* Current playback position */}
            <View
              className="absolute -top-0.5 w-0.5 h-3 bg-emerald-500 rounded-sm shadow-sm shadow-emerald-500/60"
              style={{ left: `${progressPercent}%` }}
            />
          </View>
        </View>

        {/* Slider - moves the 5-second window */}
        <View
          className="bg-slate-600/20 rounded-xl p-4 mb-3 border border-slate-600/30"
          style={{ width: SCRUBBER_WIDTH }}
        >
          <Text className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">
            Move 5-second window:
          </Text>
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0}
            maximumValue={Math.max(0, videoDuration - FIXED_DURATION)}
            value={startTime}
            onValueChange={handleRangeChange}
            onSlidingComplete={playSelectedSegment}
            minimumTrackTintColor="#735de4ff"
            maximumTrackTintColor="rgba(71, 85, 105, 0.5)"
            thumbTintColor="#735de4ff"
          />
        </View>

        {/* Time Labels */}
        <View
          className="flex-row justify-between px-4 mb-6"
          style={{ width: SCRUBBER_WIDTH }}
        >
          <Text className="text-xs text-slate-400 font-medium">0:00</Text>
          <Text className="text-xs text-slate-400 font-medium">{formatTime(videoDuration)}</Text>
        </View>
      </View>
    </View>
  );
};
