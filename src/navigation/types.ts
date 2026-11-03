export type TabParamList = {
  Home: undefined;
  Search: { categoryId?: string; categoryName?: string } | undefined;
  Cart: undefined;
  Account: undefined;
};

export type RootStackParamList = {
  Tabs: undefined;
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
