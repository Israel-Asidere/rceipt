import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import ReceiptCard from "../components/ReceiptCard";
import TopAppBar from "../components/TopAppBar";
import { globalStyles } from "../styles/global";

const MOCK_RECEIPTS = [
  { id: '1', name: 'Receipt Name', date: '12/06/2022', thumbnailUri: null },
  { id: '2', name: 'Receipt Name', date: '12/06/2022', thumbnailUri: null },
  { id: '3', name: 'Receipt Name', date: '12/06/2022', thumbnailUri: null },
  { id: '4', name: 'Receipt Name', date: '12/06/2022', thumbnailUri: null },
  { id: '5', name: 'Receipt Name', date: '12/06/2022', thumbnailUri: null },
  { id: '6', name: 'Receipt Name', date: '12/06/2022', thumbnailUri: null },
  { id: '7', name: 'Receipt Name', date: '12/06/2022', thumbnailUri: null },
  { id: '8', name: 'Receipt Name', date: '12/06/2022', thumbnailUri: null },
  { id: '9', name: 'Receipt Name', date: '12/06/2022', thumbnailUri: null },
  { id: '10', name: 'Receipt Name', date: '12/06/2022', thumbnailUri: null },
   {id: '11', name: 'Receipt Name', date: '12/06/2022', thumbnailUri: null },
  { id: '12', name: 'Receipt Name', date: '12/06/2022', thumbnailUri: null },
  { id: '13', name: 'Receipt Name', date: '12/06/2022', thumbnailUri: null },
  { id: '14', name: 'Receipt Name', date: '12/06/2022', thumbnailUri: null },
  { id: '15', name: 'Receipt Name', date: '12/06/2022', thumbnailUri: null },
  { id: '16', name: 'Receipt Name', date: '12/06/2022', thumbnailUri: null },
  { id: '17', name: 'Receipt Name', date: '12/06/2022', thumbnailUri: null },
  { id: '18', name: 'Receipt Name', date: '12/06/2022', thumbnailUri: null },
  { id: '19', name: 'Receipt Name', date: '12/06/2022', thumbnailUri: null },
  { id: '20', name: 'Receipt Name', date: '12/06/2022', thumbnailUri: null },
];
  
export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');

  // useMemo avoids re-filtering the full list on every unrelated re-render —
  // only recomputes when the query or the underlying data changes.
  const filteredReceipts = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_RECEIPTS;
    const q = searchQuery.trim().toLowerCase();
    return MOCK_RECEIPTS.filter((r) => r.name.toLowerCase().includes(q));
  }, [searchQuery]);

  
  return (
    <View style={styles.container}>
      <TopAppBar searchValue={searchQuery}
        onChangeSearch={setSearchQuery}
        onMenuPress={() => navigation?.openDrawer?.()}/>
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
          <Text style={styles.emptyText}>No receipts match "{searchQuery}"</Text>
        }
        renderItem={({ item }) => (
          <ReceiptCard
            receipt={item}
            onPress={() => navigation?.navigate?.('ReceiptDetail', { id: item.id })}
          />
        )}
      />
        </View>
        </View>
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
