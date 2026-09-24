import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ReceiptPrintPreview from '../components/ReceiptPrintPreview';
import { useReceipts } from '../contexts/ReceiptsContext';
import { colors, globalStyles } from '../styles/global';
import { formatCurrency } from '../utils/formatCurrency';

const HEADER_GREEN = colors.headerSecondary; // same as the header background on Home, for a consistent look
const EDIT_GREEN = '#6FAE5A';
const SHARE_BLUE = '#3B6FA0';
const DELETE_RED = '#D9534F';

/**
 * ReceiptDetailScreen
 * --------------------
 * Route: app/receipt/[id].tsx, reached by tapping a card on Home.
 *
 * Rebuilt around the same ReceiptPrintPreview + Edit/Share/Delete row as
 * receipt-created — the only real difference between the two screens is
 * that this one has no "just created!" badge or X close, since it's a
 * normal look-back rather than a one-time confirmation.
 *
 * Looks the receipt up from the shared context by id (not passed as a
 * param) so it always reflects current data.
 */
export default function ReceiptDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { receipts, deleteReceipt } = useReceipts();
  const receipt = receipts.find((r) => r.id === id);

  if (!receipt) {
    return (
      <View style={styles.container}>
        <View style={globalStyles.backRowHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
            <Text style={styles.backText}>Back Home</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.body}>
          <Text style={styles.notFoundTitle}>Receipt Not Found</Text>
          <Text style={styles.notFoundText}>This receipt may have already been deleted.</Text>
        </View>
      </View>
    );
  }

  const formattedDate = new Date(receipt.date).toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Receipt for ${receipt.name} — Total: ₦${formatCurrency(receipt.total)}`,
        // TODO: once receipts can render to an actual image/PDF, share
        // that file instead of just a text summary.
      });
    } catch (error) {
      console.error('Failed to share receipt:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete receipt?',
      `This permanently deletes the receipt for ${receipt.name}. This can't be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteReceipt(receipt.id);
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push({ pathname: '/create-receipt', params: { editId: receipt.id } });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
          <Text style={styles.backText}>Back Home</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <View style={styles.previewFrame}>
          <ReceiptPrintPreview receipt={receipt} />
        </View>

        <View style={styles.footerRow}>
          <View>
            <Text style={styles.receiptName} numberOfLines={1}>{receipt.name}</Text>
            <Text style={styles.receiptDate}>{formattedDate}</Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: EDIT_GREEN }]}
              onPress={handleEdit}
              accessibilityLabel="Edit receipt"
            >
              <Ionicons name="pencil" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: SHARE_BLUE }]}
              onPress={handleShare}
              accessibilityLabel="Share receipt"
            >
              <Ionicons name="share-social" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: DELETE_RED }]}
              onPress={handleDelete}
              accessibilityLabel="Delete receipt"
            >
              <Ionicons name="trash" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.headerSecondary },
  content: { paddingBottom: 40 },

  header: { backgroundColor: HEADER_GREEN, paddingTop: 75, paddingHorizontal: 16, paddingBottom: 18 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  backText: { fontSize: 16, color: '#fff' },

  body: { padding: 16 },
  notFoundTitle: { fontSize: 24, fontWeight: '700', color: colors.primary },
  notFoundText: { fontSize: 14, color: colors.text, marginTop: 8 },

  previewFrame: {
    backgroundColor: '#d9d9d9',
    borderRadius: 8,
    padding: 14,
  },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
  },
  receiptName: { fontSize: 16, fontWeight: '700', color: colors.text, maxWidth: 180 },
  receiptDate: { fontSize: 13, color: colors.primary, marginTop: 2 },

  actionsRow: { flexDirection: 'row', gap: 10 },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
