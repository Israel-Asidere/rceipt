import { router } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Modal, StyleSheet, Text, View } from "react-native";
import HamburgerMenuContent from "../components/HamburgerMenuContent";
import ReceiptCard from "../components/ReceiptCard";
import TopAppBar from "../components/TopAppBar";
import { useReceipts } from "../contexts/ReceiptsContext";
import { globalStyles } from "../styles/global";

export default function Index() {
  const { receipts, isLoading } = useReceipts();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);

  // useMemo avoids re-filtering the full list on every unrelated re-render —
  // only recomputes when the query or the underlying data changes.
  const filteredReceipts = useMemo(() => {
    if (!searchQuery.trim()) return receipts;
    const q = searchQuery.trim().toLowerCase();
    return receipts.filter((r) => r.name.toLowerCase().includes(q));
  }, [searchQuery, receipts]);

  // Two different empty states: "you haven't created any receipts yet"
  // vs "none of your receipts match this search" — worth telling apart
  // so a new user isn't shown a message that reads like a search result.
  const emptyMessage = searchQuery.trim()
    ? `No receipts match "${searchQuery}"`
    : 'No receipts yet — create your first one to see it here.';

  return (
    <View style={styles.container}>
      <TopAppBar
        searchValue={searchQuery}
        onChangeSearch={setSearchQuery}
        onMenuPress={() => setMenuVisible(true)}
      />
      <View style={globalStyles.header} >
        <View style={styles.receiptContainer}>
         <FlatList
        data={filteredReceipts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}  
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Recent Receipts</Text>}
        ListEmptyComponent={
          isLoading ? null : <Text style={styles.emptyText}>{emptyMessage}</Text>
        }
        renderItem={({ item }) => (
          <ReceiptCard
            receipt={item}
            onPress={() => router.push(`/receipt/${item.id}`)}
          />
        )}
      />
        </View>
        </View>

      <Modal
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <HamburgerMenuContent onClose={() => setMenuVisible(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  receiptContainer: {
    paddingLeft: 5,
    paddingRight: 5
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#33502E',
    marginTop: 20,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
  },
});
