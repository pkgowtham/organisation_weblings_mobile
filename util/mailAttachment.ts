import { File, Directory, Paths } from 'expo-file-system';
import { formatFilename } from './util';

export type DownloadResult = {
  success: boolean;
  message: string;
  fileUri?: string;
  error?: string;
};

export const onAttachmentDownload = async (attachment: any): Promise<DownloadResult> => {
  try {
    const filename = formatFilename(attachment.filename);
    const fileUrl = attachment.fileUrl;

    if (!fileUrl) {
      return {
        success: false,
        message: 'Download failed',
        error: 'No file URL available for download'
      };
    }

    // Create destination directory in cache
    const downloadDir = new Directory(Paths.cache, 'downloads');
    downloadDir.create();

    // Check if file already exists
    const finalFile = new File(downloadDir, filename);
    if (finalFile.exists) {
      return {
        success: false,
        message: 'File already exists',
        error: `"${filename}" is already downloaded on your device`
      };
    }

    // Download the file
    const downloadedFile = await File.downloadFileAsync(fileUrl, downloadDir);
    
    // Rename the file to its original filename
    downloadedFile.move(finalFile);

    return {
      success: true,
      message: `${filename} downloaded successfully!`,
      fileUri: finalFile.uri
    };

  } catch (error: any) {
    console.error('Download error:', error);
    
    let errorMessage = 'Download failed. Please try again.';
    
    // Handle specific error cases
    if (error.message?.includes('network') || error.message?.includes('connect')) {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.message?.includes('permission')) {
      errorMessage = 'Storage permission denied. Please grant storage access.';
    } else if (error.message?.includes('quota')) {
      errorMessage = 'Storage space insufficient. Please free up some space.';
    }

    return {
      success: false,
      message: 'Download failed',
      error: errorMessage
    };
  }
};