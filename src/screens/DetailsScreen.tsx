import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useVideoStore } from '../store/videoStore';
import { RootStackParamList } from '../types';

type DetailsScreenRouteProp = RouteProp<RootStackParamList, 'Details'>;

const { width } = Dimensions.get('window');

export const DetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<DetailsScreenRouteProp>();
  const { videoId } = route.params;
  const { getVideo, removeVideo } = useVideoStore();

  const video = getVideo(videoId);

  const handleDelete = () => {
    Alert.alert(
      'Delete Video',
      'Are you sure you want to delete this video? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeVideo(videoId);
            navigation.goBack();
            Alert.alert('Success', 'Video deleted successfully!');
          },
        },
      ]
    );
  };

  if (!video) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.title}>Video Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Video not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.title}>Video Details</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.videoContainer}>
          <Video
            source={{ uri: video.uri }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
          />
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoSection}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{video.name}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.value}>{video.description || 'No description provided'}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{video.duration.toFixed(1)}s</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {new Date(video.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </Text>
              <Text style={styles.statLabel}>Created</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-outline" size={16} color="#ffffff" />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141121', // Dark background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60, // For status bar
    paddingBottom: 16,
    backgroundColor: 'rgba(20, 17, 33, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  spacer: {
    width: 40, // Same as back button for centering
  },
  content: {
    flex: 1,
  },
  videoContainer: {
    backgroundColor: '#000',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  video: {
    width: width - 40,
    height: (width - 40) * 0.5625, // 16:9 aspect ratio
  },
  infoContainer: {
    margin: 20,
  },
  infoSection: {
    backgroundColor: 'rgba(71, 85, 105, 0.2)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.3)',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(148, 163, 184, 1)',
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 24,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(71, 85, 105, 0.2)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.3)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    marginHorizontal: 20,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(148, 163, 184, 1)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#4f30e8',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#4f30e8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  shareButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141121',
  },
  errorText: {
    fontSize: 18,
    color: 'rgba(148, 163, 184, 1)',
  },
});