import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Dimensions, Alert, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useVideoStore } from '../../src/store/videoStore';

const { width } = Dimensions.get('window');

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function DetailsScreen() {
  const router = useRouter();
  const { videoId } = useLocalSearchParams<{ videoId: string }>();
  const { getVideo, removeVideo, updateVideo } = useVideoStore();

  const video = getVideo(videoId as string);

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(video?.name || '');
  const [editedDescription, setEditedDescription] = useState(video?.description || '');

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    updateVideo(videoId as string, {
      name: editedName.trim(),
      description: editedDescription.trim(),
    });

    setIsEditing(false);
    Alert.alert('Success', 'Video updated successfully!');
  };

  const handleCancel = () => {
    setEditedName(video?.name || '');
    setEditedDescription(video?.description || '');
    setIsEditing(false);
  };

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
            removeVideo(videoId as string);
            router.back();
            Alert.alert('Success', 'Video deleted successfully!');
          },
        },
      ]
    );
  };

  if (!video) {
    return (
      <SafeAreaView className="flex-1 bg-[#141121]">
        <View className="flex-row items-center px-5 pt-[60px] pb-4 bg-[#141121]/95 border-b border-slate-400/10">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-slate-400/10 items-center justify-center"
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text className="flex-1 text-lg font-bold text-white text-center mx-4">Video Details</Text>
        </View>
        <View className="flex-1 items-center justify-center bg-[#141121]">
          <Text className="text-lg text-slate-400">Video not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-[#141121]">
      <Animated.View
        entering={FadeInUp.springify()}
        className="flex-row items-center px-5 pt-[60px] pb-4 bg-[#141121]/95 border-b border-slate-400/10"
      >
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-slate-400/10 items-center justify-center"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#ffffff" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-bold text-white text-center mx-4">Video Details</Text>
        <View className="w-10" />
      </Animated.View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          className="bg-black mx-5 mt-5 rounded-2xl overflow-hidden shadow-2xl"
        >
          <Video
            source={{ uri: video.uri }}
            style={{ width: width - 40, height: (width - 40) * 0.5625 }}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()} className="m-5">
          <View className="bg-slate-600/20 rounded-2xl p-5 mb-4 border border-slate-600/30">
            <Text className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">Name</Text>
            {isEditing ? (
              <TextInput
                className="text-base text-white leading-6 font-medium border-b border-slate-400/50 pb-2"
                value={editedName}
                onChangeText={setEditedName}
                placeholder="Enter video name"
                placeholderTextColor="rgba(148, 163, 184, 0.6)"
                maxLength={100}
              />
            ) : (
              <Text className="text-base text-white leading-6 font-medium">{video.name}</Text>
            )}
          </View>

          <View className="bg-slate-600/20 rounded-2xl p-5 mb-4 border border-slate-600/30">
            <Text className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">Description</Text>
            {isEditing ? (
              <TextInput
                className="text-base text-white leading-6 font-medium border-b border-slate-400/50 pb-2"
                value={editedDescription}
                onChangeText={setEditedDescription}
                placeholder="Enter description (optional)"
                placeholderTextColor="rgba(148, 163, 184, 0.6)"
                multiline
                numberOfLines={3}
                maxLength={500}
                textAlignVertical="top"
              />
            ) : (
              <Text className="text-base text-white leading-6 font-medium">
                {video.description || 'No description provided'}
              </Text>
            )}
          </View>

          <View className="flex-row bg-slate-600/20 rounded-2xl p-5 mb-4 border border-slate-600/30">
            <View className="flex-1 items-center">
              <Text className="text-xl font-bold text-white mb-1">{video.duration.toFixed(1)}s</Text>
              <Text className="text-xs font-medium text-slate-400 uppercase tracking-wide">Duration</Text>
            </View>
            <View className="w-px bg-slate-400/20 mx-5" />
            <View className="flex-1 items-center">
              <Text className="text-xl font-bold text-white mb-1">
                {new Date(video.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
              <Text className="text-xs font-medium text-slate-400 uppercase tracking-wide">Created</Text>
            </View>
          </View>

          {isEditing ? (
            <View className="flex-row gap-3 mt-2">
              <AnimatedTouchableOpacity
                className="flex-1 bg-[#1c6e5d] rounded-2xl py-4 items-center justify-center flex-row gap-2 shadow-lg shadow-[#1c6e5d]/30"
                onPress={handleSave}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color="#ffffff" />
                <Text className="text-white text-base font-semibold tracking-wide">Save</Text>
              </AnimatedTouchableOpacity>
              <AnimatedTouchableOpacity
                className="flex-1 bg-slate-600/20 rounded-2xl py-4 items-center justify-center flex-row gap-2 border border-slate-600/30"
                onPress={handleCancel}
              >
                <Ionicons name="close-circle-outline" size={18} color="#94a3b8" />
                <Text className="text-slate-400 text-base font-semibold tracking-wide">Cancel</Text>
              </AnimatedTouchableOpacity>
            </View>
          ) : (
            <View className="flex-row gap-3 mt-2">
              <AnimatedTouchableOpacity
                className="flex-1 bg-[#4f30e8] rounded-2xl py-4 items-center justify-center flex-row gap-2 shadow-lg shadow-[#4f30e8]/30"
                onPress={handleEdit}
              >
                <Ionicons name="create-outline" size={18} color="#ffffff" />
                <Text className="text-white text-base font-semibold tracking-wide">Edit</Text>
              </AnimatedTouchableOpacity>
              <AnimatedTouchableOpacity
                className="flex-1 bg-red-500/20 rounded-2xl py-4 items-center justify-center flex-row gap-2 border border-red-500/30"
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
                <Text className="text-red-500 text-base font-semibold tracking-wide">Delete</Text>
              </AnimatedTouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}
