export type TabParamList = {
  Home: undefined;
  Search: { categoryId?: string; categoryName?: string } | undefined;
  Cart: undefined;
  Account: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;

  /* --- Evira onboarding + auth flow (kit screens 3-5, 11, 20-21, 23-26).
     Routes are added here only once their screen is registered in
     RootNavigator, so the param list never advertises a route that would
     crash on navigate. --- */
  Walkthrough: undefined;
  LetsYouIn: undefined;
  CreatePin: { intent: 'setup' | 'checkout' | 'topup' };
  SetFingerprint: undefined;
  ForgotPassword: undefined;
  VerifyOtp: { method: 'sms' | 'email'; destination: string };
  CreateNewPassword: undefined;
  Login: undefined;
  Register: undefined;
  ProductDetail: { slug: string };
  Checkout: undefined;
  Orders: undefined;
  OrderDetail: { id: string };
  Addresses: undefined;
  AddAddress: undefined;
  AiChat: { seedMessage?: string; mode?: 'discovery' | 'support'; orderId?: string } | undefined;
  Support: undefined;
  SupportTicket: { ticketId: string };
  Wishlist: undefined;
  RecentlyViewed: undefined;
  Settings: undefined;
  NewReturn: { orderId: string };
};

// Screen names are unique across the stack and tab navigators, so every
// `useNavigation()`/`useRoute()` call in the app can be typed against this
// one merged list via global augmentation below — no per-screen composite
// prop types needed.
export type AppParamList = RootStackParamList & TabParamList;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends AppParamList {}
  }
}
