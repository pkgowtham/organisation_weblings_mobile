import * as Sharing from "expo-sharing";
import * as Linking from "expo-linking";
import { Platform, Share } from "react-native";
import { router } from "expo-router";

export const generateDeepLink = (id: string, name: string) => {
  // Option 1: Using custom scheme (works in development)
  const customSchemeUrl = `myapp://(forum)/forum`;
  // router.push('/(forum)/forum')

  // Option 2: Using universal links (requires published app)
  const universalLink = `https://yourapp.com/discussion/${id}`;

  // For development, you can also use Expo's linking URL
  // const expoUrl = Linking.createURL(`${name}/(forum)/forum`);
  const expoUrl = Linking.createURL(
    `${
      name === "event"
        ? `/(dynamic)/event/${id}`
        : `/(offers)/view/?offerId:${id}`
    }`
  );

  return {
    customSchemeUrl,
    universalLink,
    // Use universal link for sharing, fallback to custom scheme
    shareUrl: __DEV__ ? expoUrl : universalLink,
  };
};

export const shareEvent = async (
  id: string,
  title: string,
  description: string,
  date: string,
  location: string,
  name: string
) => {
  try {
    const { shareUrl } = generateDeepLink(id, name);
    const tempUrl = 'www.tandemuniapp.com'

    const shareOptions = {
      message: `${title}\n  ${description}\n  ${date}\n  ${location}\n  Download Tandem App\n  ${tempUrl}`,
      url: shareUrl,
      title: title,
    };

    if (Platform.OS === "ios") {
      await Share.share({
        message: shareOptions.message,
        url: shareOptions.url,
        title: shareOptions.title,
      });
    } else {
      await Share.share({
        message: shareOptions.message,
        title: shareOptions.title,
      });
    }
  } catch (error) {
    console.error("Error sharing:", error);
  }
};
