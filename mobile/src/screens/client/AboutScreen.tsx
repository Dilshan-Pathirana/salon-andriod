import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { businessInfoApi, reviewsApi } from '../../services';
import { Loading } from '../../components';
import { COLORS, FONTS, SPACING } from '../../constants';
import { BusinessInfo, ReviewStats } from '../../types';

export function AboutScreen() {
  const [aboutInfo, setAboutInfo] = useState<Record<string, string>>({});
  const [contactInfo, setContactInfo] = useState<Record<string, string>>({});
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [allInfo, stats] = await Promise.all([
        businessInfoApi.getAll(),
        reviewsApi.getStats().catch(() => null),
      ]);
      const aboutMap: Record<string, string> = {};
      const contactMap: Record<string, string> = {};
      allInfo.forEach((item: BusinessInfo) => {
        if (item.category === 'about') aboutMap[item.key] = item.value;
        else contactMap[item.key] = item.value;
      });
      setAboutInfo(aboutMap);
      setContactInfo(contactMap);
      setReviewStats(stats);
    } catch {
      // handled
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  const handleWhatsApp = (phone: string) => {
    Linking.openURL(`https://wa.me/${phone.replace('+', '')}`).catch(() => {});
  };

  if (isLoading) return <Loading message="Loading..." />;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.heroSection}>
        <View style={styles.logoContainer}>
          <Ionicons name="cut" size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.salonName}>{aboutInfo.salon_name || 'Premium Salon'}</Text>
        {reviewStats && (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color={COLORS.warning} />
            <Text style={styles.ratingText}>
              {reviewStats.averageRating} ({reviewStats.totalReviews} reviews)
            </Text>
          </View>
        )}
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Us</Text>
        {aboutInfo.salon_story && (
          <Text style={styles.storyText}>{aboutInfo.salon_story}</Text>
        )}
        {aboutInfo.mission && (
          <View style={styles.infoCard}>
            <Ionicons name="flag-outline" size={20} color={COLORS.primary} />
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardTitle}>Our Mission</Text>
              <Text style={styles.infoCardText}>{aboutInfo.mission}</Text>
            </View>
          </View>
        )}
        {aboutInfo.experience_years && (
          <View style={styles.infoCard}>
            <Ionicons name="trophy-outline" size={20} color={COLORS.primary} />
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardTitle}>Experience</Text>
              <Text style={styles.infoCardText}>{aboutInfo.experience_years}+ years of excellence</Text>
            </View>
          </View>
        )}
        {aboutInfo.opening_hours && (
          <View style={styles.infoCard}>
            <Ionicons name="time-outline" size={20} color={COLORS.primary} />
            <View style={styles.infoCardContent}>
              <Text style={styles.infoCardTitle}>Opening Hours</Text>
              <Text style={styles.infoCardText}>{aboutInfo.opening_hours}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Contact Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>

        {contactInfo.phone && (
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleCall(contactInfo.phone)}
          >
            <View style={styles.contactIcon}>
              <Ionicons name="call" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Phone</Text>
              <Text style={styles.contactValue}>{contactInfo.phone}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
          </TouchableOpacity>
        )}

        {contactInfo.whatsapp && (
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleWhatsApp(contactInfo.whatsapp)}
          >
            <View style={[styles.contactIcon, { backgroundColor: '#25D36615' }]}>
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>WhatsApp</Text>
              <Text style={styles.contactValue}>{contactInfo.whatsapp}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
          </TouchableOpacity>
        )}

        {contactInfo.email && (
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleLink(`mailto:${contactInfo.email}`)}
          >
            <View style={styles.contactIcon}>
              <Ionicons name="mail" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>{contactInfo.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
          </TouchableOpacity>
        )}

        {contactInfo.instagram && (
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleLink(contactInfo.instagram)}
          >
            <View style={[styles.contactIcon, { backgroundColor: '#E4405F15' }]}>
              <Ionicons name="logo-instagram" size={20} color="#E4405F" />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Instagram</Text>
              <Text style={styles.contactValue}>Follow us</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
          </TouchableOpacity>
        )}

        {contactInfo.facebook && (
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleLink(contactInfo.facebook)}
          >
            <View style={[styles.contactIcon, { backgroundColor: '#1877F215' }]}>
              <Ionicons name="logo-facebook" size={20} color="#1877F2" />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Facebook</Text>
              <Text style={styles.contactValue}>Like our page</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
          </TouchableOpacity>
        )}

        {contactInfo.google_maps && (
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => handleLink(contactInfo.google_maps)}
          >
            <View style={[styles.contactIcon, { backgroundColor: '#EA433515' }]}>
              <Ionicons name="location" size={20} color="#EA4335" />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactLabel}>Location</Text>
              <Text style={styles.contactValue}>{contactInfo.address || 'View on Maps'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  heroSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200,162,77,0.15)',
  },
  logoContainer: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(200,162,77,0.1)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: 'rgba(200,162,77,0.3)',
  },
  salonName: {
    fontSize: FONTS.sizes.xxl, fontWeight: '700', color: COLORS.text,
  },
  ratingRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: SPACING.sm,
  },
  ratingText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary },
  section: {
    backgroundColor: COLORS.surface,
    margin: SPACING.lg, marginBottom: 0,
    padding: SPACING.lg, borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  sectionTitle: {
    fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md,
  },
  storyText: {
    fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, lineHeight: 22, marginBottom: SPACING.md,
  },
  infoCard: {
    flexDirection: 'row', paddingVertical: SPACING.sm, gap: SPACING.md,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
  },
  infoCardContent: { flex: 1 },
  infoCardTitle: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.text },
  infoCardText: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, marginTop: 2 },
  contactItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  contactIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(200,162,77,0.1)',
    justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md,
  },
  contactContent: { flex: 1 },
  contactLabel: { fontSize: FONTS.sizes.xs, color: COLORS.textLight },
  contactValue: { fontSize: FONTS.sizes.sm, fontWeight: '500', color: COLORS.text },
  spacer: { height: SPACING.xxxl },
});
