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
import {
  getLoanStatus,
  getRemainingAmount,
  getTotalPaid,
  isLoanOverdue
} from "../utils/loanMath";

export default function HomeScreen({ navigation }) {
  const [loans, setLoans] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");

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
  const totalRecovered = loans.reduce((sum, loan) => sum + getTotalPaid(loan), 0);
  const totalPending = loans.reduce((sum, loan) => sum + getRemainingAmount(loan), 0);

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
    if (activeFilter === "OVERDUE") return isLoanOverdue(loan);

    return true;
  });

  const sortedLoans = [...filteredLoans].sort((a, b) => {
    const amountA = Number(a.amount || 0);
    const amountB = Number(b.amount || 0);
    const createdA = new Date(a.createdAt || a.date || 0).getTime();
    const createdB = new Date(b.createdAt || b.date || 0).getTime();
    const overdueA = isLoanOverdue(a);
    const overdueB = isLoanOverdue(b);
    const dueA = new Date(a.reminderDate || a.date || 0).getTime();
    const dueB = new Date(b.reminderDate || b.date || 0).getTime();

    if (sortBy === "OLDEST") return createdA - createdB;
    if (sortBy === "HIGHEST_AMOUNT") return amountB - amountA;
    if (sortBy === "OVERDUE_FIRST") {
      if (overdueA && !overdueB) return -1;
      if (!overdueA && overdueB) return 1;
      return dueA - dueB;
    }

    return createdB - createdA;
  });

  const getOverdueDays = useCallback((loan) => {
    if (!isLoanOverdue(loan)) return 0;
    const due = new Date(loan.reminderDate);
    const diffMs = Date.now() - due.getTime();
    return Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }, []);

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

  const quickActions = [
    { key: "Dashboard", label: "Dashboard" },
    { key: "Borrowers", label: "Borrowers" }
  ];

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
      <View style={styles.recoveredBox}>
        <Text style={styles.recoveredText}>Recovered: Rs. {totalRecovered}</Text>
      </View>

      <View style={styles.quickActionsRow}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.key}
            style={styles.quickActionBtn}
            onPress={() => navigation.navigate(action.key)}
          >
            <Text style={styles.quickActionText}>{action.label}</Text>
          </TouchableOpacity>
        ))}
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

      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort:</Text>
        {[
          { key: "NEWEST", label: "Newest" },
          { key: "OLDEST", label: "Oldest" },
          { key: "HIGHEST_AMOUNT", label: "Highest" },
          { key: "OVERDUE_FIRST", label: "Overdue" }
        ].map((option) => {
          const isActive = sortBy === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.sortChip, isActive ? styles.sortChipActive : null]}
              onPress={() => setSortBy(option.key)}
            >
              <Text style={[styles.sortChipText, isActive ? styles.sortChipTextActive : null]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={sortedLoans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LoanItem
            loan={item}
            isOverdue={isLoanOverdue(item)}
            overdueDays={getOverdueDays(item)}
            remainingAmount={getRemainingAmount(item)}
            statusText={getLoanStatus(item)}
            onPress={() => navigation.navigate("Detail", { loanId: item.id })}
            onAddPayment={() => navigation.navigate("AddPayment", { loanId: item.id })}
            onEdit={() => navigation.navigate("EditLoan", { loanId: item.id })}
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
  recoveredBox: {
    backgroundColor: "#dcfce7",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10
  },
  recoveredText: {
    color: "#166534",
    fontWeight: "700"
  },
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10
  },
  quickActionBtn: {
    width: "48.5%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center"
  },
  quickActionText: {
    color: "#1f2937",
    fontWeight: "700",
    fontSize: 13
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
    marginBottom: 10
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
  sortRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 8
  },
  sortLabel: {
    marginRight: 8,
    color: "#374151",
    fontWeight: "600",
    marginBottom: 8
  },
  sortChip: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#fff",
    marginRight: 8,
    marginBottom: 8
  },
  sortChipActive: {
    backgroundColor: "#111827",
    borderColor: "#111827"
  },
  sortChipText: {
    color: "#374151",
    fontWeight: "600",
    fontSize: 12
  },
  sortChipTextActive: {
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
