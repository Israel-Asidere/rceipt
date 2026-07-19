import { Feather } from '@expo/vector-icons';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../styles/global';


export default function TopAppBar({ searchValue, onChangeSearch, onMenuPress }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onMenuPress}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityLabel="Open menu"
        accessibilityRole="button"
      >
        <Feather name="menu" size={26} color="#fff" />
      </TouchableOpacity>

      <View style={styles.searchBar}>
        <Feather name="search" size={18} color="#8a8a8a" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#8a8a8a"
          value={searchValue}
          onChangeText={onChangeSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 80, // clears the notch/status bar; adjust or use SafeAreaView
    paddingBottom: 35,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 38,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    padding: 0,
  },
});