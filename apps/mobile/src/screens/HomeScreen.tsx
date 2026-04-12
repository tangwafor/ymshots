import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

const ACCENT = '#E0943A';

export function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>YmShotS</Text>
          <Text style={styles.tagline}>your moments. your shots.</Text>
        </View>

        {/* Quick actions */}
        <View style={styles.actions}>
          <ActionCard title="Import" subtitle="Camera roll" icon="📷" onPress={() => {}} />
          <ActionCard title="Gallery" subtitle="Client delivery" icon="🖼" onPress={() => {}} />
          <ActionCard title="ShotTalk" subtitle="Messages" icon="💬" onPress={() => {}} />
          <ActionCard title="Academy" subtitle="Learn" icon="⭐" onPress={() => {}} />
        </View>

        {/* Recent shoots */}
        <Text style={styles.sectionTitle}>Recent Shoots</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No shoots yet</Text>
          <Text style={styles.emptyHint}>Import photos from your camera roll to start</Text>
        </View>

        {/* SignatureAI status */}
        <View style={styles.aiCard}>
          <Text style={styles.aiTitle}>SignatureAI</Text>
          <Text style={styles.aiStatus}>Your style is being noticed.</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '0%' }]} />
          </View>
          <Text style={styles.aiPairs}>0 / 10 edit pairs</Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Built by ta-tech</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionCard({ title, subtitle, icon, onPress }: {
  title: string; subtitle: string; icon: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.cardIcon}>{icon}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { padding: 20 },
  header: { alignItems: 'center', paddingVertical: 24 },
  logo: { fontSize: 28, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  tagline: { fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4, letterSpacing: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginVertical: 20 },
  card: {
    width: '47%', padding: 16, borderRadius: 10,
    backgroundColor: '#111', borderWidth: 1, borderColor: '#1a1a1a',
  },
  cardIcon: { fontSize: 24, marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#fff' },
  cardSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginBottom: 8 },
  emptyState: { padding: 32, alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#1a1a1a', borderStyle: 'dashed' },
  emptyText: { fontSize: 14, color: 'rgba(255,255,255,0.3)' },
  emptyHint: { fontSize: 11, color: 'rgba(255,255,255,0.15)', marginTop: 4 },
  aiCard: {
    marginTop: 20, padding: 16, borderRadius: 10,
    backgroundColor: '#111', borderWidth: 1, borderColor: '#1a1a1a',
  },
  aiTitle: { fontSize: 12, fontWeight: '600', color: ACCENT },
  aiStatus: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 },
  progressBar: { height: 3, borderRadius: 2, backgroundColor: '#222', marginTop: 12 },
  progressFill: { height: '100%', borderRadius: 2, backgroundColor: ACCENT },
  aiPairs: { fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 6 },
  footer: { textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.15)', marginTop: 32, paddingBottom: 20 },
});
