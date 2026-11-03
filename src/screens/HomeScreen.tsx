import React from 'react';
import { FlatList, RefreshControl, ScrollView, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { shadow } from '@/theme/shadow';
import { ThemedText, ThemedView } from '@/components/ui/Themed';
import { LoadingState, ErrorState } from '@/components/ui/states';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { FadeSlideIn } from '@/components/ui/FadeSlideIn';
import { SearchGlyph } from '@/components/ui/icons';
import { ProductCard } from '@/components/ProductCard';
import { useCategories, useProducts } from '@/hooks/useCatalog';
import { useRecentlyViewed } from '@/hooks/useDiscovery';
import { useAuthStore } from '@/stores/authStore';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colors, spacing, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const displayName = useAuthStore((s) => s.user?.displayName);

  const categories = useCategories();
  const newArrivals = useProducts({ page: 1, pageSize: 10, sort: 'createdAt', order: 'desc' });
  const recentlyViewed = useRecentlyViewed();

  if (newArrivals.isLoading) return <LoadingState label="Loading ShopSphere…" variant="grid" />;
  if (newArrivals.isError) return <ErrorState message={(newArrivals.error as Error).message} onRetry={() => newArrivals.refetch()} />;

  return (
    <ThemedView style={{ flex: 1, paddingTop: insets.top }}>
      <FlatList
        data={newArrivals.data?.data ?? []}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: spacing[4] }}
        refreshControl={<RefreshControl tintColor={colors.accent} refreshing={newArrivals.isFetching} onRefresh={() => newArrivals.refetch()} />}
        renderItem={({ item, index }) => <ProductCard product={item} index={index} />}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: spacing[4], marginBottom: spacing[4] }}>
            <FadeSlideIn>
              <ThemedText variant="title" style={{ marginBottom: spacing[1] }}>
                {displayName ? `Hi, ${displayName.split(' ')[0]}` : 'Discover Better. Shop Smarter.'}
              </ThemedText>
            </FadeSlideIn>

            <FadeSlideIn delay={60}>
              <AnimatedPressable
                accessibilityRole="search"
                onPress={() => navigation.navigate('Search')}
                scaleTo={0.98}
                style={{
                  backgroundColor: colors.surfaceSunken,
                  borderRadius: radii.md,
                  paddingVertical: spacing[3],
                  paddingHorizontal: spacing[4],
                  marginTop: spacing[3],
                  marginBottom: spacing[5],
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing[2]
                }}
              >
                <SearchGlyph size={16} color={colors.textMuted} />
                <ThemedText color="muted">Search products…</ThemedText>
              </AnimatedPressable>
            </FadeSlideIn>

            {categories.data && categories.data.length > 0 ? (
              <FadeSlideIn delay={110}>
                <ThemedText variant="heading" style={{ marginBottom: spacing[2] }}>
                  Shop by category
                </ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing[5] }}>
                  {categories.data.map((category) => (
                    <AnimatedPressable
                      key={category.id}
                      onPress={() => navigation.navigate('Search', { categoryId: category.id, categoryName: category.name })}
                      scaleTo={0.93}
                      style={{
                        backgroundColor: colors.surfaceElevated,
                        borderRadius: radii.full,
                        paddingVertical: spacing[2],
                        paddingHorizontal: spacing[4],
                        marginRight: spacing[2],
                        borderWidth: 1,
                        borderColor: colors.borderSubtle
                      }}
                    >
                      <ThemedText variant="bodySmall" weight="medium">
                        {category.name}
                      </ThemedText>
                    </AnimatedPressable>
                  ))}
                </ScrollView>
              </FadeSlideIn>
            ) : null}

            <FadeSlideIn delay={160}>
              <AnimatedPressable
                onPress={() => navigation.navigate('AiChat')}
                scaleTo={0.97}
                style={{
                  backgroundColor: colors.accent,
                  borderRadius: radii.lg,
                  padding: spacing[4],
                  marginBottom: spacing[5],
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  ...shadow('md', colors.accent)
                }}
              >
                <View>
                  <ThemedText weight="bold" style={{ color: colors.onAccent }}>
                    Ask Sphere AI
                  </ThemedText>
                  <ThemedText variant="bodySmall" style={{ color: colors.onAccent }}>
                    Describe what you're looking for
                  </ThemedText>
                </View>
                <ThemedText variant="title" style={{ color: colors.onAccent }}>
                  →
                </ThemedText>
              </AnimatedPressable>
            </FadeSlideIn>

            {recentlyViewed.data && recentlyViewed.data.length > 0 ? (
              <FadeSlideIn delay={200}>
                <View style={{ marginBottom: spacing[2] }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <ThemedText variant="heading">Recently viewed</ThemedText>
                    <AnimatedPressable onPress={() => navigation.navigate('RecentlyViewed')} scaleTo={0.94}>
                      <ThemedText variant="bodySmall" color="accent">
                        See all
                      </ThemedText>
                    </AnimatedPressable>
                  </View>
                </View>
              </FadeSlideIn>
            ) : null}

            <FadeSlideIn delay={230}>
              <ThemedText variant="heading" style={{ marginBottom: spacing[2] }}>
                New arrivals
              </ThemedText>
            </FadeSlideIn>
          </View>
        }
      />
    </ThemedView>
  );
}
