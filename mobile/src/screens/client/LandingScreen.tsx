import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  ImageBackground,
  Easing,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components';
import { COLORS, FONTS, SPACING } from '../../constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LandingScreenProps {
  navigation: any;
}

export function LandingScreen({ navigation }: LandingScreenProps) {
  const fadeOverlay = useRef(new Animated.Value(0)).current;
  const fadeTitle = useRef(new Animated.Value(0)).current;
  const slideTitle = useRef(new Animated.Value(30)).current;
  const fadeGold = useRef(new Animated.Value(0)).current;
  const slideGold = useRef(new Animated.Value(20)).current;
  const fadeSubtitle = useRef(new Animated.Value(0)).current;
  const fadeRating = useRef(new Animated.Value(0)).current;
  const slideRating = useRef(new Animated.Value(15)).current;
  const fadeButton = useRef(new Animated.Value(0)).current;
  const slideButton = useRef(new Animated.Value(20)).current;
  const fadeInfo = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animations
    Animated.sequence([
      // First: overlay gradient fades in
      Animated.timing(fadeOverlay, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Then title slides up and fades in
      Animated.parallel([
        Animated.timing(fadeTitle, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideTitle, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // Gold text
      Animated.parallel([
        Animated.timing(fadeGold, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideGold, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // Subtitle
      Animated.timing(fadeSubtitle, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Rating badge
      Animated.parallel([
        Animated.timing(fadeRating, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideRating, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // CTA button
      Animated.parallel([
        Animated.timing(fadeButton, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideButton, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // Info cards
      Animated.timing(fadeInfo, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous shimmer effect on gold elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const goldGlow = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  return (
    <View style={styles.container}>
      {/* Hamburger menu button */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => navigation.toggleDrawer()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="menu" size={28} color={COLORS.text} />
      </TouchableOpacity>

      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=2000',
        }}
        style={styles.heroImage}
        resizeMode="cover"
      >
        {/* Gradient overlay */}
        <Animated.View style={[styles.gradientOverlay, { opacity: fadeOverlay }]}>
          {/* Content at bottom */}
          <View style={styles.heroContent}>
            {/* Title */}
            <Animated.View
              style={{
                opacity: fadeTitle,
                transform: [{ translateY: slideTitle }],
              }}
            >
              <Text style={styles.heroTitle}>Precision.</Text>
            </Animated.View>

            <Animated.View
              style={{
                opacity: fadeGold,
                transform: [{ translateY: slideGold }],
              }}
            >
              <Animated.Text style={[styles.heroTitleGold, { opacity: goldGlow }]}>
                Style.
              </Animated.Text>
            </Animated.View>

            <Animated.View
              style={{
                opacity: fadeSubtitle,
              }}
            >
              <Text style={styles.heroTitle}>Confidence.</Text>
            </Animated.View>

            {/* Rating badge */}
            <Animated.View
              style={[
                styles.ratingBadge,
                {
                  opacity: fadeRating,
                  transform: [{ translateY: slideRating }],
                },
              ]}
            >
              <View style={styles.ratingInner}>
                <Ionicons name="star" size={16} color={COLORS.gold} />
                <Text style={styles.ratingScore}>4.8</Text>
                <Text style={styles.ratingCount}>(1.2k reviews)</Text>
              </View>
            </Animated.View>

            {/* CTA Button */}
            <Animated.View
              style={[
                styles.ctaContainer,
                {
                  opacity: fadeButton,
                  transform: [{ translateY: slideButton }],
                },
              ]}
            >
              <Button
                title="Book Appointment"
                onPress={() => navigation.navigate('MainDrawer', { screen: 'Book' })}
                size="lg"
                icon="calendar-outline"
                style={styles.ctaButton}
              />
            </Animated.View>

            {/* Quick Info Cards */}
            <Animated.View style={[styles.infoRow, { opacity: fadeInfo }]}>
              <View style={styles.infoCard}>
                <Ionicons name="time-outline" size={22} color={COLORS.gold} />
                <Text style={styles.infoLabel}>Open Today</Text>
                <Text style={styles.infoValue}>9AM – 7PM</Text>
              </View>
              <View style={styles.infoCard}>
                <Ionicons name="people-outline" size={22} color={COLORS.gold} />
                <Text style={styles.infoLabel}>Live Queue</Text>
                <Text style={styles.infoValue}>Check Now</Text>
              </View>
            </Animated.View>
          </View>
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  menuButton: {
    position: 'absolute',
    top: 52,
    left: 20,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(28,28,28,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  gradientOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,15,15,0.55)',
    justifyContent: 'flex-end',
  },
  heroContent: {
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xxxl + 40,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroTitleGold: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.gold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  ratingBadge: {
    marginTop: SPACING.lg,
    alignSelf: 'flex-start',
  },
  ratingInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28,28,28,0.8)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  ratingScore: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  ctaContainer: {
    marginTop: SPACING.xl,
  },
  ctaButton: {
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  infoRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  infoCard: {
    flex: 1,
    backgroundColor: 'rgba(28,28,28,0.7)',
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  infoLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  infoValue: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
});
