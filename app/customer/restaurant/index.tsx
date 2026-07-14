import AsyncStorage from '@react-native-async-storage/async-storage';
import { faChevronDown, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText as Text } from '@/components/AppText';
import { COLORS } from '@/constants/colors';

const RESTAURANT_IMAGES = [
  require('@/assets/images/restaurants/cuisineGreek.jpg'),
  require('@/assets/images/restaurants/cuisineJapanese.jpg'),
  require('@/assets/images/restaurants/cuisinePasta.jpg'),
  require('@/assets/images/restaurants/cuisinePizza.jpg'),
  require('@/assets/images/restaurants/cuisineSoutheast.jpg'),
  require('@/assets/images/restaurants/cuisineViet.jpg'),
];

function getRestaurantImage(id: number) {
  return RESTAURANT_IMAGES[id % RESTAURANT_IMAGES.length];
}

type Restaurant = {
  id: number;
  name: string;
  rating: number;
  price_range: number;
};

const RATING_OPTIONS = [1, 2, 3, 4, 5];
const PRICE_OPTIONS = [1, 2, 3];

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<number | null>(null);
  const [ratingMenuOpen, setRatingMenuOpen] = useState(false);
  const [priceMenuOpen, setPriceMenuOpen] = useState(false);

  useEffect(() => {
    const fetchRestaurants = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      const params = new URLSearchParams();
      if (rating !== null) params.set('rating', String(rating));
      if (priceRange !== null) params.set('price_range', String(priceRange));

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_URL}/api/restaurants?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await response.json();
      setRestaurants(json.data ?? []);
    };

    fetchRestaurants();
  }, [rating, priceRange]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Nearby Restaurants</Text>

      <View style={styles.filters}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Rating</Text>
          <Pressable
            style={styles.filterButton}
            onPress={() => {
              setRatingMenuOpen(!ratingMenuOpen);
              setPriceMenuOpen(false);
            }}>
            <Text style={styles.filterButtonText}>
              {rating === null ? '-- Select --' : '★'.repeat(rating)}
            </Text>
            <FontAwesomeIcon icon={faChevronDown} color={COLORS.white} size={12} />
          </Pressable>
          {ratingMenuOpen && (
            <View style={styles.dropdown}>
              <Pressable
                style={styles.dropdownOption}
                onPress={() => {
                  setRating(null);
                  setRatingMenuOpen(false);
                }}>
                <Text>-- Select --</Text>
              </Pressable>
              {RATING_OPTIONS.map((option) => (
                <Pressable
                  key={option}
                  style={styles.dropdownOption}
                  onPress={() => {
                    setRating(option);
                    setRatingMenuOpen(false);
                  }}>
                  <Text>{'★'.repeat(option)}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Price</Text>
          <Pressable
            style={styles.filterButton}
            onPress={() => {
              setPriceMenuOpen(!priceMenuOpen);
              setRatingMenuOpen(false);
            }}>
            <Text style={styles.filterButtonText}>
              {priceRange === null ? '-- Select --' : '$'.repeat(priceRange)}
            </Text>
            <FontAwesomeIcon icon={faChevronDown} color={COLORS.white} size={12} />
          </Pressable>
          {priceMenuOpen && (
            <View style={styles.dropdown}>
              <Pressable
                style={styles.dropdownOption}
                onPress={() => {
                  setPriceRange(null);
                  setPriceMenuOpen(false);
                }}>
                <Text>-- Select --</Text>
              </Pressable>
              {PRICE_OPTIONS.map((option) => (
                <Pressable
                  key={option}
                  style={styles.dropdownOption}
                  onPress={() => {
                    setPriceRange(option);
                    setPriceMenuOpen(false);
                  }}>
                  <Text>{'$'.repeat(option)}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Restaurants</Text>

      <View style={styles.grid}>
        {restaurants.map((restaurant) => (
          <Pressable
            key={restaurant.id}
            style={styles.card}
            onPress={() => router.push(`/customer/restaurant/${restaurant.id}`)}>
            <Image source={getRestaurantImage(restaurant.id)} style={styles.cardImage} />
            <Text style={styles.cardName}>
              {restaurant.name} ({'$'.repeat(restaurant.price_range)})
            </Text>
            <View style={styles.cardStars}>
              {Array.from({ length: restaurant.rating }).map((_, i) => (
                <FontAwesomeIcon key={i} icon={faStar} color={COLORS.warmYellow} size={14} />
              ))}
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Oswald_700Bold',
    color: COLORS.darkCharcoal,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  filters: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  filterGroup: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 13,
    color: COLORS.darkCharcoal,
    marginBottom: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.orangeRed,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  dropdown: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 4,
    marginTop: 4,
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47%',
  },
  cardImage: {
    width: '100%',
    height: 100,
    borderRadius: 4,
    marginBottom: 6,
  },
  cardName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.darkCharcoal,
    marginBottom: 4,
  },
  cardStars: {
    flexDirection: 'row',
    gap: 2,
  },
});
