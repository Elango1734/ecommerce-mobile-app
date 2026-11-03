import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, TextInput, View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemedText, ThemedView } from '@/components/ui/Themed';
import { Button } from '@/components/ui/Button';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/states';
import { ProductCard } from '@/components/ProductCard';
import { useProducts } from '@/hooks/useCatalog';
import type { AppParamList } from '@/navigation/types';

type SortOption = { label: string; sort: string; order: 'asc' | 'desc' };
const SORT_OPTIONS: SortOption[] = [
  { label: 'Newest', sort: 'createdAt', order: 'desc' },
  { label: 'Price: low to high', sort: 'minPriceMinor', order: 'asc' },
  { label: 'Price: high to low', sort: 'minPriceMinor', order: 'desc' }
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, radii } = useTheme();
  const route = useRoute<RouteProp<AppParamList, 'Search'>>();
  const params = route.params;

  const [queryText, setQueryText] = useState('');
  const [debouncedText, setDebouncedText] = useState('');
  const [page, setPage] = useState(1);
  const [sortOption, setSortOption] = useState<SortOption>(SORT_OPTIONS[0]!);
  const [categoryId, setCategoryId] = useState<string | undefined>(params?.categoryId);

  // Debounce so every keystroke doesn't fire a request — product-requirements.md's search/filter UX.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedText(queryText), 350);
    return () => clearTimeout(timer);
  }, [queryText]);

  useEffect(() => {
    setPage(1);
  }, [debouncedText, categoryId, sortOption]);

  const query = useMemo(
    () => ({ page, pageSize: 20, q: debouncedText || undefined, categoryId, sort: sortOption.sort, order: sortOption.order }),
    [page, debouncedText, categoryId, sortOption]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useProducts(query);
  const totalPages = data?.meta.pagination.totalPages ?? 1;

  return (
    <ThemedView style={{ flex: 1, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: spacing[4], paddingTop: spacing[2] }}>
        <TextInput
          value={queryText}
          onChangeText={setQueryText}
          placeholder="Search products…"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Search products"
          style={{
            backgroundColor: colors.surfaceSunken,
            borderRadius: radii.md,
            paddingVertical: spacing[3],
            paddingHorizontal: spacing[4],
            color: colors.textPrimary,
            marginBottom: spacing[3]
          }}
        />

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[2] }}>
          {categoryId ? (
            <AnimatedPressable
              onPress={() => setCategoryId(undefined)}
              scaleTo={0.93}
              style={{ backgroundColor: colors.accent, borderRadius: radii.full, paddingVertical: spacing[1], paddingHorizontal: spacing[3] }}
            >
              <ThemedText variant="caption" style={{ color: colors.onAccent }}>
                {params?.categoryName ?? 'Category'} ✕
              </ThemedText>
            </AnimatedPressable>
          ) : null}
          {SORT_OPTIONS.map((option) => (
            <AnimatedPressable
              key={option.label}
              onPress={() => setSortOption(option)}
              scaleTo={0.93}
              style={{
                borderRadius: radii.full,
                paddingVertical: spacing[1],
                paddingHorizontal: spacing[3],
                backgroundColor: sortOption.label === option.label ? colors.textPrimary : colors.surfaceElevated,
                borderWidth: 1,
                borderColor: colors.borderSubtle
              }}
            >
              <ThemedText variant="caption" style={{ color: sortOption.label === option.label ? colors.textInverse : colors.textPrimary }}>
                {option.label}
              </ThemedText>
            </AnimatedPressable>
          ))}
        </View>
      </View>

      {isLoading ? (
        <LoadingState label="Searching…" variant="grid" />
      ) : isError ? (
        <ErrorState message={(error as Error).message} onRetry={() => refetch()} />
      ) : (data?.data.length ?? 0) === 0 ? (
        <EmptyState title="No results" message="Try a different search term or clear your filters." />
      ) : (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: spacing[4] }}
          renderItem={({ item, index }) => <ProductCard product={item} index={index} />}
          ListFooterComponent={
            totalPages > 1 ? (
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing[3], padding: spacing[4] }}>
                <Button label="Previous" variant="outline" size="sm" disabled={page <= 1} onPress={() => setPage((p) => p - 1)} />
                <ThemedText style={{ alignSelf: 'center' }}>
                  {page} / {totalPages}
                </ThemedText>
                <Button label="Next" variant="outline" size="sm" loading={isFetching} disabled={page >= totalPages} onPress={() => setPage((p) => p + 1)} />
              </View>
            ) : null
          }
        />
      )}
    </ThemedView>
  );
}
