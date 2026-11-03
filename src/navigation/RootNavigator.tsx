import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeProvider';
import { TabNavigator } from './TabNavigator';
import LoginScreen from '@/screens/LoginScreen';
import RegisterScreen from '@/screens/RegisterScreen';
import ProductDetailScreen from '@/screens/ProductDetailScreen';
import CheckoutScreen from '@/screens/CheckoutScreen';
import OrdersScreen from '@/screens/OrdersScreen';
import OrderDetailScreen from '@/screens/OrderDetailScreen';
import AddressesScreen from '@/screens/AddressesScreen';
import AddAddressScreen from '@/screens/AddAddressScreen';
import AiChatScreen from '@/screens/AiChatScreen';
import SupportScreen from '@/screens/SupportScreen';
import SupportTicketScreen from '@/screens/SupportTicketScreen';
import WishlistScreen from '@/screens/WishlistScreen';
import RecentlyViewedScreen from '@/screens/RecentlyViewedScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import NewReturnScreen from '@/screens/NewReturnScreen';
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
      <Stack.Screen name="Login" component={LoginScreen} options={{ presentation: 'modal', headerShown: true, title: 'Sign in' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ presentation: 'modal', headerShown: true, title: 'Create account' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: true, title: 'Checkout', presentation: 'modal' }} />
      <Stack.Screen name="Orders" component={OrdersScreen} options={{ headerShown: true, title: 'Orders' }} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ headerShown: true, title: 'Order details' }} />
      <Stack.Screen name="Addresses" component={AddressesScreen} options={{ headerShown: true, title: 'Addresses' }} />
      <Stack.Screen name="AddAddress" component={AddAddressScreen} options={{ headerShown: true, title: 'Add address', presentation: 'modal' }} />
      <Stack.Screen name="AiChat" component={AiChatScreen} options={{ headerShown: true, title: 'Sphere AI' }} />
      <Stack.Screen name="Support" component={SupportScreen} options={{ headerShown: true, title: 'Support' }} />
      <Stack.Screen name="SupportTicket" component={SupportTicketScreen} options={{ headerShown: true, title: 'Ticket' }} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} options={{ headerShown: true, title: 'Wishlist' }} />
      <Stack.Screen name="RecentlyViewed" component={RecentlyViewedScreen} options={{ headerShown: true, title: 'Recently viewed' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: 'Settings' }} />
      <Stack.Screen name="NewReturn" component={NewReturnScreen} options={{ headerShown: true, title: 'Request return', presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
