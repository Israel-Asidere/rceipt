import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * ReceiptCard
 * -----------
 * One tile in the "Recent Receipts" grid. Kept as its own file (rather than
 * inlined in HomeScreen) because you'll almost certainly reuse this same
 * card shape on the "Receipt Summary" tab too — better to have one
 * component than copy-pasted JSX in two places that quietly drift apart.
 *
 * `receipt` shape expected:
 *   { id, name, date, thumbnailUri }
 * thumbnailUri can be a local require(...) or a remote { uri } object —
 * both work fine with <Image source={...} />.
 */
export default function ReceiptCard({ receipt, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.thumbnailWrapper}>
        {receipt.thumbnailUri ? (
          <Image source={receipt.thumbnailUri} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          // Fallback while a real scanned image isn't available yet —
          // keeps the grid from looking broken during early testing.
          <View style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
        )}
      </View>
      <Text style={styles.name} numberOfLines={1}>{receipt.name}</Text>
      <Text style={styles.date}>{receipt.date}</Text>
    </TouchableOpacity>
  );
}

const CARD_WIDTH = '48%'; // two columns with a small gutter between

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    marginBottom: 20,
  },
  thumbnailWrapper: {
    backgroundColor: '#d8d8d8',
    borderRadius: 6,
    overflow: 'hidden',
    aspectRatio: 0.78, // roughly matches the receipt-paper proportions in the mock
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    backgroundColor: '#cfcfcf',
  },
  name: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  date: {
    marginTop: 2,
    fontSize: 12,
    color: '#33502E',
  },
});