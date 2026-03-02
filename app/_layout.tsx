/**
 * Root layout - Délègue à RootNavigator (ThemeProvider, Auth, Business, Stack)
 */
import RootNavigator from '@/src/navigation/RootNavigator';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return <RootNavigator />;
}
