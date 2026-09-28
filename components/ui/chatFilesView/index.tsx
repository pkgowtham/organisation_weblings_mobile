import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/components/ui/typography';
import { useTheme } from '@/context/CustomThemeContext';

const ChatFilesView = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.neutral.surface.main }]}>
      <Typography fontVariant="BM" color="colors.neutral.onSurface.dark">
        No files shared yet
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default ChatFilesView;
