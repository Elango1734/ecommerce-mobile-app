import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeProvider';
import { TabNavigator } from './TabNavigator';
import LoginScreen from '@/screens/LoginScreen';
import RegisterScreen from '@/screens/RegisterScreen';
import SearchScreen from '@/screens/SearchScreen';
import ProductDetailScreen from '@/screens/ProductDetailScreen';
import CheckoutScreen from '@/screens/CheckoutScreen';
import OrdersScreen from '@/screens/OrdersScreen';
import OrderDetailScreen from '@/screens/OrderDetailScreen';
import AddressesScreen from '@/screens/AddressesScreen';
import AddAddressScreen from '@/screens/AddAddressScreen';
import AiChatScreen from '@/screens/AiChatScreen';
import SupportScreen from '@/screens/SupportScreen';
import SupportTicketScreen from '@/screens/SupportTicketScreen';
import SpecialOffersScreen from '@/screens/SpecialOffersScreen';
import NotificationsScreen from '@/screens/NotificationsScreen';
import WishlistScreen from '@/screens/WishlistScreen';
import RecentlyViewedScreen from '@/screens/RecentlyViewedScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import NewReturnScreen from '@/screens/NewReturnScreen';
import WalkthroughScreen from '@/screens/evira/WalkthroughScreen';
import LetsYouInScreen from '@/screens/evira/LetsYouInScreen';
import ForgotPasswordScreen from '@/screens/evira/ForgotPasswordScreen';
import VerifyOtpScreen from '@/screens/evira/VerifyOtpScreen';
import CreateNewPasswordScreen from '@/screens/evira/CreateNewPasswordScreen';
import CreatePinScreen from '@/screens/evira/CreatePinScreen';
import SetFingerprintScreen from '@/screens/evira/SetFingerprintScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        contentStyle: { backgroundColor: colors.background }
      }}
    >
      <Stack.Screen name="Tabs" component={TabNavigator} />

      {/* Evira onboarding + auth flow. These carry their own in-screen
          headers (EviraHeader), so the stack header stays hidden. */}
      <Stack.Screen name="Walkthrough" component={WalkthroughScreen} />
      <Stack.Screen name="LetsYouIn" component={LetsYouInScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
      <Stack.Screen name="CreateNewPassword" component={CreateNewPasswordScreen} />
      <Stack.Screen name="CreatePin" component={CreatePinScreen} />
      <Stack.Screen name="SetFingerprint" component={SetFingerprintScreen} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ presentation: 'modal', headerShown: true, title: 'Sign in' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ presentation: 'modal', headerShown: true, title: 'Create account' }} />
      {/* These screens render their own EviraHeader (or, for ProductDetail,
          a custom overlay back button) with a complete back control, so the
          native stack header would just double up as a second back button
          sitting above it -- keep it hidden here. */}
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="Addresses" component={AddressesScreen} />
      <Stack.Screen name="AddAddress" component={AddAddressScreen} options={{ headerShown: true, title: 'Add address', presentation: 'modal' }} />
      <Stack.Screen name="AiChat" component={AiChatScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="SupportTicket" component={SupportTicketScreen} />
      <Stack.Screen name="SpecialOffers" component={SpecialOffersScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
      <Stack.Screen name="RecentlyViewed" component={RecentlyViewedScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="NewReturn" component={NewReturnScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
