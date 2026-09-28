import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { UploadableFileInfo } from '@sendbird/chat/message';

type FileInfo = {
  uri: string;
  name: string;
  type: string;
};

type FileCompat = {
  uri: string;
  name: string;
  type: string;
  size?: number;
};

export const prepareFileForUpload = async (fileInfo: FileInfo): Promise<UploadableFileInfo> => {
  if (Platform.OS === 'web') {
    // Web implementation
    const response = await fetch(fileInfo.uri);
    const blob = await response.blob();
    return {
      file: blob,
      fileName: fileInfo.name,
      mimeType: fileInfo.type,
      fileSize: blob.size,
    };
  } else {
    // Mobile implementation
    try {
      const fileInfoResult = await FileSystem.getInfoAsync(fileInfo.uri, { size: true });
      
      if (!fileInfoResult.exists) {
        throw new Error('File does not exist');
      }

      const fileSize = fileInfoResult.size || 0;
      
      const fileCompat: FileCompat = {
        uri: fileInfo.uri,
        name: fileInfo.name,
        type: fileInfo.type,
        size: fileSize,
      };

      return {
        file: fileCompat,
        fileName: fileInfo.name,
        mimeType: fileInfo.type,
        fileSize,
      };
    } catch (error) {
      console.error('Error preparing file for upload:', error);
      return {
        file: {
          uri: fileInfo.uri,
          name: fileInfo.name,
          type: fileInfo.type,
        },
        fileName: fileInfo.name,
        mimeType: fileInfo.type,
      };
    }
  }
};