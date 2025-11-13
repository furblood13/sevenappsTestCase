import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
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
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          style={styles.video}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
        />
      </View>

      <View style={styles.scrubberContainer}>
        {/* Selected Time Display */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {formatTime(startTime)} - {formatTime(endTime)}
          </Text>
          <Text style={styles.durationText}>5 Second Clip</Text>
        </View>

        {/* Visual Timeline */}
        <View style={styles.timelineContainer}>
          <View style={styles.timeline}>
            {/* Full video timeline */}
            <View style={styles.fullTimeline} />

            {/* Selected 5-second range */}
            <View
              style={[
                styles.selectedRange,
                {
                  left: `${selectedStartPercent}%`,
                  width: `${selectedWidthPercent}%`,
                },
              ]}
            />

            {/* Current playback position */}
            <View
              style={[styles.currentPosition, { left: `${progressPercent}%` }]}
            />
          </View>
        </View>

        {/* Slider - moves the 5-second window */}
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>Move 5-second window:</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={Math.max(0, videoDuration - FIXED_DURATION)}
            value={startTime}
            onValueChange={handleRangeChange}
            onSlidingComplete={playSelectedSegment}
            minimumTrackTintColor="#4f30e8"
            maximumTrackTintColor="rgba(71, 85, 105, 0.5)"
            thumbTintColor="#4f30e8"
          />
        </View>

        {/* Time Labels */}
        <View style={styles.timeLabels}>
          <Text style={styles.timeLabelText}>0:00</Text>
          <Text style={styles.timeLabelText}>{formatTime(videoDuration)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 8,
  },
  videoContainer: {
    width: SCRUBBER_WIDTH,
    height: SCRUBBER_WIDTH * 0.5625,
    backgroundColor: "#000",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  video: {
    flex: 1,
  },
  scrubberContainer: {
    width: "100%",
    alignItems: "center",
  },
  label: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 20,
    textAlign: "center",
  },
  timeContainer: {
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "rgba(71, 85, 105, 0.2)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(71, 85, 105, 0.3)",
  },
  timeText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 4,
  },
  durationText: {
    fontSize: 12,
    color: "rgba(148, 163, 184, 1)",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Timeline Visual
  timelineContainer: {
    width: SCRUBBER_WIDTH,
    marginBottom: 20,
  },
  timeline: {
    height: 8,
    position: "relative",
    borderRadius: 4,
    overflow: "hidden",
  },
  fullTimeline: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: "rgba(71, 85, 105, 0.4)",
    borderRadius: 4,
  },
  selectedRange: {
    position: "absolute",
    top: 0,
    height: 8,
    backgroundColor: "#4f30e8",
    borderRadius: 4,
    shadowColor: "#4f30e8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 2,
  },
  currentPosition: {
    position: "absolute",
    top: -2,
    width: 3,
    height: 12,
    backgroundColor: "#10b981",
    borderRadius: 1.5,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.6,
    shadowRadius: 2,
    elevation: 3,
  },

  // Slider
  sliderContainer: {
    width: SCRUBBER_WIDTH,
    backgroundColor: "rgba(71, 85, 105, 0.2)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(71, 85, 105, 0.3)",
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(148, 163, 184, 1)",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  timeLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: SCRUBBER_WIDTH,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  timeLabelText: {
    fontSize: 12,
    color: "rgba(148, 163, 184, 1)",
    fontWeight: "500",
  },
});
