import React, { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Pressable,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Video, ResizeMode } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useVideoStore } from "../src/store/videoStore";
import { VideoEntry } from "../src/types";
import LottieView from "lottie-react-native";

type LayoutMode = "grid" | "list";

const { width } = Dimensions.get("window");
const GRID_ITEM_WIDTH = (width - 48) / 2;

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

export default function MainScreen() {
  const router = useRouter();
  const { videos } = useVideoStore();
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("grid");
  const animation = useRef<LottieView>(null);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderGridItem = ({
    item,
    index,
  }: {
    item: VideoEntry;
    index: number;
  }) => {
    return (
      <AnimatedTouchableOpacity
        entering={FadeInDown.delay(index * 100).springify()}
        className="mb-4"
        style={{ width: GRID_ITEM_WIDTH }}
        onPress={() => router.push(`/details/${item.id}`)}
        activeOpacity={0.8}
      >
        <Animated.View className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-[#1e1b33]">
          <Video
            source={{ uri: item.uri }}
            style={{ width: "100%", height: "100%", borderRadius: 12 }}
            resizeMode={ResizeMode.COVER}
            shouldPlay={false}
            isLooping={false}
            isMuted={true}
          />
          {/* Gradient Overlay */}
          <View className="absolute bottom-0 left-0 right-0 h-[25%] bg-black/40" />

          {/* Duration Badge */}
          <View className="absolute top-2 right-2 bg-black/70 rounded-xl px-2 py-0.5">
            <Text className="text-white text-xs font-medium">
              {formatDuration(item.duration)}
            </Text>
          </View>

          {/* Video Info */}
          <View className="absolute bottom-0 left-0 right-0 p-3">
            <Text
              className="text-white text-sm font-bold mb-1 leading-[18px]"
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <Text className="text-white/80 text-xs font-normal">
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </Animated.View>
      </AnimatedTouchableOpacity>
    );
  };

  const renderListItem = ({
    item,
    index,
  }: {
    item: VideoEntry;
    index: number;
  }) => {
    return (
      <AnimatedTouchableOpacity
        entering={FadeInDown.delay(index * 150).springify()}
        className="flex-row bg-slate-600/20 rounded-2xl p-4 mb-3"
        onPress={() => router.push(`/details/${item.id}`)}
        activeOpacity={0.8}
      >
        <View className="mr-4">
          <Video
            source={{ uri: item.uri }}
            style={{ width: 80, height: 80, borderRadius: 12 }}
            resizeMode={ResizeMode.COVER}
            shouldPlay={false}
            isLooping={false}
            isMuted={true}
          />
        </View>
        <View className="flex-1 justify-between">
          <Text
            className="text-base font-semibold text-white mb-1"
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text
            className="text-sm text-slate-400 leading-[15px] mb-2"
            numberOfLines={2}
          >
            {item.description}
          </Text>
          <View className="flex-row justify-between items-center">
            <Text className="text-xs text-slate-400/80 font-medium">
              {formatDuration(item.duration)}
            </Text>
            <Text className="text-xs text-slate-400/80">
              {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
      </AnimatedTouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-[#141121]">
      {/* Top App Bar */}
      <Animated.View
        entering={FadeInUp.springify()}
        className="bg-[#141121]/90 pt-[60px] pb-4 border-b border-slate-400/10"
      >
        <View className="flex-row items-center px-4">
          <View className="w-12" />
          <Text className="flex-1 text-lg font-bold text-white text-center">
            My Diary
          </Text>
          <TouchableOpacity
            className="w-12 h-12 rounded-full items-center justify-center"
            onPress={() => router.push("/crop-modal")}
          >
            <Ionicons name="add" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Layout Toggle */}
      <Animated.View
        entering={FadeInDown.delay(200).springify()}
        className="px-4 py-3"
      >
        <View className="flex-row bg-slate-400/10 rounded-xl p-1 h-10">
          <Pressable
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              paddingHorizontal: 8,
              backgroundColor:
                layoutMode === "grid" ? "rgba(71, 85, 105, 1)" : "transparent",
            }}
            onPress={() => setLayoutMode("grid")}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: layoutMode === "grid" ? "600" : "500",
                color:
                  layoutMode === "grid" ? "#ffffff" : "rgba(148, 163, 184, 1)",
              }}
            >
              Grid
            </Text>
          </Pressable>
          <Pressable
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              paddingHorizontal: 8,
              backgroundColor:
                layoutMode === "list" ? "rgba(71, 85, 105, 1)" : "transparent",
            }}
            onPress={() => setLayoutMode("list")}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: layoutMode === "list" ? "600" : "500",
                color:
                  layoutMode === "list" ? "#ffffff" : "rgba(148, 163, 184, 1)",
              }}
            >
              List
            </Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* Content */}
      {videos.length === 0 ? (
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          className="flex-1 items-center justify-center px-8"
        >
          <LottieView
            autoPlay
            ref={animation}
            style={{
              width: 280,
              height: 280,
              backgroundColor: "transparent",
              marginBottom: 40,
            }}
            source={require("../assets/empty.json")}
          />
          <View className="items-center mb-10 max-w-[300px]">
            <Text className="text-xl font-bold text-white mb-3 text-center">
              No Entries Yet
            </Text>
            <Text className="text-base text-slate-400 text-center leading-6">
              Tap the '+' to add your first video memory.
            </Text>
          </View>
          <TouchableOpacity
            className="bg-[#1c6e5d] rounded-xl px-8 py-4 min-w-[180px] items-center shadow-lg"
            onPress={() => router.push("/crop-modal")}
          >
            <Text className="text-white text-base font-bold">
              Create First Entry
            </Text>
          </TouchableOpacity>
        </Animated.View>
      ) : layoutMode === "grid" ? (
        <FlatList
          key="grid"
          data={videos}
          renderItem={renderGridItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{
            paddingBottom: 100,
            paddingHorizontal: 16,
          }}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={{ justifyContent: "space-between" }}
        />
      ) : (
        <FlatList
          key="list"
          data={videos}
          renderItem={renderListItem}
          keyExtractor={(item) => item.id}
          numColumns={1}
          contentContainerStyle={{
            paddingBottom: 100,
            paddingHorizontal: 16,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
