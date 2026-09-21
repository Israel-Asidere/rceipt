import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ReceiptPrintPreview from '../components/ReceiptPrintPreview';
import { useReceipts } from '../contexts/ReceiptsContext';
import { colors } from '../styles/global';
import { formatCurrency } from '../utils/formatCurrency';

const HEADER_GREEN = colors.headerSecondary;
const SUCCESS_GREEN = '#6FAE5A';
const EDIT_GREEN = '#6FAE5A';
const SHARE_BLUE = '#3B6FA0';
const DELETE_RED = '#D9534F';

/**
 * ReceiptCreatedScreen
 * ---------------------
 * Route: app/receipt-created/[id].tsx. create-receipt navigates here
 * (router.replace) right after a successful save, instead of going
 * straight back to Home — matches the confirmation-screen pattern from
 * the mock rather than silently dropping the user back on the grid.
 *
 * Both the X and "Back Home" behave the same way here (dismiss to
 * Home) — this screen is a one-time confirmation, not something you'd
 * navigate "back" from into some prior form state.
 */
export default function ReceiptCreatedScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { receipts, deleteReceipt } = useReceipts();
  const receipt = receipts.find((r) => r.id === id);

  // Shouldn't normally happen (this screen is only reached right after
  // creating the receipt), but guards against a bad/stale id rather than
  // crashing on receipt.name below.
  if (!receipt) {
    router.replace('/');
    return null;
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
    // TODO: no edit flow exists yet — reusing create-receipt's form for
    // editing (pre-filled, with a create/update mode) is its own piece
    // of work, not yet built.
    Alert.alert('Coming soon', "Editing a receipt isn't built yet.");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/')} style={styles.backRow}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
          <Text style={styles.backText}>Back Home</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <View style={styles.previewFrame}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.replace('/')}
            accessibilityLabel="Close"
          >
            <Ionicons name="close" size={16} color="#fff" />
          </TouchableOpacity>

          <View style={styles.successBadge}>
            <Ionicons name="checkmark-circle" size={16} color={SUCCESS_GREEN} />
            <Text style={styles.successText}>Receipt Created!</Text>
          </View>

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

  previewFrame: {
    backgroundColor: '#d9d9d9',
    borderRadius: 8,
    paddingTop: 28,
    paddingHorizontal: 14,
    paddingBottom: 14,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#D9534F',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  successBadge: {
    position: 'absolute',
    top: -14,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    zIndex: 2,
  },
  successText: { fontSize: 13, fontWeight: '700', color: '#333' },

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
