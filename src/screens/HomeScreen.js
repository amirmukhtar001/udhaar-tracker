import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import LoanItem from "../components/LoanItem";
import { getLoans, deleteLoan, updateLoan } from "../storage/loanStorage";
import {
  cancelLoanReminder,
  scheduleLoanReminder
} from "../utils/notification";

export default function HomeScreen({ navigation }) {
  const [loans, setLoans] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const isOverdue = useCallback((loan) => {
    if (loan.isPaid || !loan.reminderDate) return false;
    const due = new Date(loan.reminderDate);
    if (Number.isNaN(due.getTime())) return false;
    return due < new Date();
  }, []);

  const loadLoans = useCallback(async () => {
    const data = await getLoans();
    setLoans(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLoans();
    }, [loadLoans])
  );

  const totalGiven = loans.reduce((sum, loan) => sum + Number(loan.amount || 0), 0);
  const totalPending = loans
    .filter((loan) => !loan.isPaid)
    .reduce((sum, loan) => sum + Number(loan.amount || 0), 0);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredLoans = loans.filter((loan) => {
    const name = String(loan.name || "").toLowerCase();
    const note = String(loan.note || "").toLowerCase();
    const amount = String(loan.amount || "").toLowerCase();
    const matchesSearch =
      !normalizedQuery ||
      name.includes(normalizedQuery) ||
      note.includes(normalizedQuery) ||
      amount.includes(normalizedQuery);

    if (!matchesSearch) return false;

    if (activeFilter === "UNPAID") return !loan.isPaid;
    if (activeFilter === "PAID") return loan.isPaid;
    if (activeFilter === "OVERDUE") return isOverdue(loan);

    return true;
  });

  const handleTogglePaid = async (loan) => {
    const nextPaid = !loan.isPaid;
    let notificationId = loan.notificationId || null;

    if (nextPaid) {
      await cancelLoanReminder(notificationId);
      notificationId = null;
    } else if (loan.reminderDate) {
      notificationId = await scheduleLoanReminder(loan);
    }

    const updated = await updateLoan(loan.id, { isPaid: nextPaid, notificationId });
    setLoans(updated);
  };

  const handleDelete = async (loan) => {
    Alert.alert("Delete Loan", `Delete ${loan.name}'s loan?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await cancelLoanReminder(loan.notificationId);
          const updated = await deleteLoan(loan.id);
          setLoans(updated);
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.summaryRow}>
        <View style={[styles.statCard, styles.givenCard]}>
          <Text style={styles.statLabel}>Total Given</Text>
          <Text style={styles.statValue}>Rs. {totalGiven}</Text>
        </View>
        <View style={[styles.statCard, styles.pendingCard]}>
          <Text style={styles.statLabel}>Total Pending</Text>
          <Text style={styles.statValue}>Rs. {totalPending}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate("AddLoan")}
      >
        <Text style={styles.addBtnText}>+ Add Loan</Text>
      </TouchableOpacity>

      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by name, note, amount"
        style={styles.searchInput}
      />

      <View style={styles.filtersRow}>
        {[
          { key: "ALL", label: "All" },
          { key: "UNPAID", label: "Unpaid" },
          { key: "PAID", label: "Paid" },
          { key: "OVERDUE", label: "Overdue" }
        ].map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              style={[styles.filterChip, isActive ? styles.filterChipActive : null]}
              onPress={() => setActiveFilter(filter.key)}
            >
              <Text style={[styles.filterChipText, isActive ? styles.filterChipTextActive : null]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredLoans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LoanItem
            loan={item}
            onPress={() => navigation.navigate("Detail", { loanId: item.id })}
            onTogglePaid={() => handleTogglePaid(item)}
            onDelete={() => handleDelete(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              {loans.length === 0
                ? "No loans yet. Add your first udhaar."
                : "No loans match your search/filter."}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 16
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12
  },
  statCard: {
    width: "48.5%",
    borderRadius: 12,
    padding: 14
  },
  givenCard: {
    backgroundColor: "#dbeafe"
  },
  pendingCard: {
    backgroundColor: "#fee2e2"
  },
  statLabel: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 6
  },
  statValue: {
    fontSize: 18,
    color: "#111827",
    fontWeight: "600",
    letterSpacing: 0.2
  },
  addBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 14
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16
  },
  searchInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10
  },
  filtersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10
  },
  filterChip: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: "#fff",
    marginRight: 8,
    marginBottom: 8
  },
  filterChipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb"
  },
  filterChipText: {
    color: "#374151",
    fontWeight: "600"
  },
  filterChipTextActive: {
    color: "#fff"
  },
  listContent: {
    paddingBottom: 30
  },
  emptyBox: {
    alignItems: "center",
    marginTop: 40
  },
  emptyText: {
    color: "#6b7280"
  }
});
