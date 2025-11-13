import React, { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Dimensions,
  ScrollView,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Video, ResizeMode } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { useVideoStore } from "../store/videoStore";
import { RootStackParamList, VideoEntry } from "../types";
import LottieView from "lottie-react-native";

type MainScreenNavigationProp = StackNavigationProp<RootStackParamList, "Main">;
type LayoutMode = "grid" | "list";

const { width } = Dimensions.get("window");
const GRID_ITEM_WIDTH = (width - 48) / 2; // 2 columns with padding

export const MainScreen = () => {
  const navigation = useNavigation<MainScreenNavigationProp>();
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

  const renderGridItem = ({ item }: { item: VideoEntry }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => navigation.navigate("Details", { videoId: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.gridThumbnail}>
        <Video
          source={{ uri: item.uri }}
          style={styles.gridThumbnailImage}
          resizeMode={ResizeMode.COVER}
          shouldPlay={false}
          isLooping={false}
          isMuted={true}
        />
        {/* Gradient Overlay */}
        <View style={styles.gradientOverlay} />

        {/* Duration Badge */}
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>
            {formatDuration(item.duration)}
          </Text>
        </View>

        {/* Video Info */}
        <View style={styles.gridVideoInfo}>
          <Text style={styles.gridVideoName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.gridVideoDate}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }: { item: VideoEntry }) => (
    <TouchableOpacity
      style={styles.listItem}
      onPress={() => navigation.navigate("Details", { videoId: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.listThumbnail}>
        <Video
          source={{ uri: item.uri }}
          style={styles.listThumbnailImage}
          resizeMode={ResizeMode.COVER}
          shouldPlay={false}
          isLooping={false}
          isMuted={true}
        />
      </View>
      <View style={styles.listVideoInfo}>
        <Text style={styles.listVideoName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.listVideoDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.listVideoMeta}>
          <Text style={styles.listVideoDuration}>
            {formatDuration(item.duration)}
          </Text>
          <Text style={styles.listVideoDate}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Top App Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarContent}>
          <View style={styles.spacer} />
          <Text style={styles.title}>My Diary</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("CropModal")}
          >
            <Ionicons name="add" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Layout Toggle */}
      <View style={styles.layoutToggleContainer}>
        <View style={styles.layoutToggle}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              layoutMode === "grid" && styles.toggleButtonActive,
            ]}
            onPress={() => setLayoutMode("grid")}
          >
            <Text
              style={[
                styles.toggleButtonText,
                layoutMode === "grid" && styles.toggleButtonTextActive,
              ]}
            >
              Grid
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              layoutMode === "list" && styles.toggleButtonActive,
            ]}
            onPress={() => setLayoutMode("list")}
          >
            <Text
              style={[
                styles.toggleButtonText,
                layoutMode === "list" && styles.toggleButtonTextActive,
              ]}
            >
              List
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {videos.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyStateIcon}>
            <LottieView
              autoPlay
              ref={animation}
              style={{
                width: 200,
                height: 200,
                backgroundColor: "transparent",
              }}
              // Find more Lottie files at https://lottiefiles.com/featured
              source={require("../../assets/UFO 404.json")}
            />
          </View>
          <View style={styles.emptyStateContent}>
            <Text style={styles.emptyStateTitle}>No Entries Yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Tap the '+' to add your first video memory.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={() => navigation.navigate("CropModal")}
          >
            <Text style={styles.emptyStateButtonText}>Create First Entry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={videos}
          renderItem={layoutMode === "grid" ? renderGridItem : renderListItem}
          keyExtractor={(item) => item.id}
          numColumns={layoutMode === "grid" ? 2 : 1}
          key={layoutMode} // Force re-render when layout changes
          contentContainerStyle={[
            styles.listContainer,
            layoutMode === "grid"
              ? styles.gridContainer
              : styles.listContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={
            layoutMode === "grid" ? styles.gridRow : undefined
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#141121", // Dark background
  },

  // Top Bar Styles
  topBar: {
    backgroundColor: "rgba(20, 17, 33, 0.9)",
    paddingTop: 60, // For status bar
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148, 163, 184, 0.1)",
  },
  topBarContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  spacer: {
    width: 48, // Same as add button width for centering
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "center",
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },

  // Layout Toggle Styles
  layoutToggleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  layoutToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(148, 163, 184, 0.1)",
    borderRadius: 12,
    padding: 4,
    height: 40,
  },
  toggleButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  toggleButtonActive: {
    backgroundColor: "rgba(71, 85, 105, 1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(148, 163, 184, 1)",
  },
  toggleButtonTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },

  // Grid Layout Styles
  listContainer: {
    paddingBottom: 100, // For bottom padding
  },
  gridContainer: {
    paddingHorizontal: 16,
  },
  gridRow: {
    justifyContent: "space-between",
  },
  gridItem: {
    width: GRID_ITEM_WIDTH,
    marginBottom: 16,
  },
  gridThumbnail: {
    position: "relative",
    width: "100%",
    aspectRatio: 3 / 4, // 3:4 aspect ratio like in HTML
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#1e1b33",
  },
  gridThumbnailImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "60%",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  durationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  durationText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
  gridVideoInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  gridVideoName: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
    lineHeight: 18,
  },
  gridVideoDate: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    fontWeight: "400",
  },

  // List Layout Styles
  listContainerStyle: {
    paddingHorizontal: 16,
  },
  listItem: {
    flexDirection: "row",
    backgroundColor: "rgba(71, 85, 105, 0.2)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  listThumbnail: {
    marginRight: 16,
  },
  listThumbnailImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  listVideoInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  listVideoName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 4,
  },
  listVideoDescription: {
    fontSize: 14,
    color: "rgba(148, 163, 184, 1)",
    lineHeight: 20,
    marginBottom: 8,
  },
  listVideoMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listVideoDuration: {
    fontSize: 12,
    color: "rgba(148, 163, 184, 0.8)",
    fontWeight: "500",
  },
  listVideoDate: {
    fontSize: 12,
    color: "rgba(148, 163, 184, 0.8)",
  },

  // Empty State Styles
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  emptyStateIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(148, 163, 184, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyStateContent: {
    alignItems: "center",
    marginBottom: 24,
    maxWidth: 300,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "rgba(148, 163, 184, 1)",
    textAlign: "center",
    lineHeight: 20,
  },
  emptyStateButton: {
    backgroundColor: "#4f30e8", // Primary color
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 160,
    alignItems: "center",
  },
  emptyStateButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});
