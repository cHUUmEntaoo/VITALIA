
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
} from 'expo-router/ui';

import {
  StyleSheet,
  Text,
} from 'react-native';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.content} />

      <TabList style={styles.tabList}>
        <TabTrigger
          name="home"
          href="/"
          style={styles.tab}
        >
          <Text style={styles.tabText}>
            Inicio
          </Text>
        </TabTrigger>

        <TabTrigger
          name="explore"
          href="/explore"
          style={styles.tab}
        >
          <Text style={styles.tabText}>
            Explorar
          </Text>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },

  tabList: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F5ED',
    borderTopWidth: 1,
    borderTopColor: '#E7E1D5',
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },

  tabText: {
    color: '#173D32',
    fontSize: 14,
    fontWeight: '600',
  },
});
