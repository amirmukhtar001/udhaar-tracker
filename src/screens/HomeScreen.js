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
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

export default function HomeScreen({ navigation }) {
  const { t } = useLanguage();
  const { signOut } = useAuth();
  const [loans, setLoans] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [isSigningOut, setIsSigningOut] = useState(false);

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
    const createdA = new Date(a.createdAt || a.date || 0).getTime();
    const createdB = new Date(b.createdAt || b.date || 0).getTime();
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
    Alert.alert(t("home.deleteTitle"), t("home.deleteMessage", { name: loan.name }), [
      { text: t("home.cancel"), style: "cancel" },
      {
        text: t("home.delete"),
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

  const handleLogout = () => {
    Alert.alert(t("auth.logoutTitle"), t("auth.logoutMessage"), [
      { text: t("home.cancel"), style: "cancel" },
      {
        text: t("auth.logoutButton"),
        style: "destructive",
        onPress: async () => {
          setIsSigningOut(true);
          const { error } = await signOut();
          setIsSigningOut(false);

          if (error) {
            Alert.alert(t("common.error"), error.message || t("auth.logoutError"));
          }
        }
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.logoutBtn, isSigningOut ? styles.logoutBtnDisabled : null]}
          onPress={handleLogout}
          disabled={isSigningOut}
        >
          <Text style={styles.logoutBtnText}>
            {isSigningOut ? t("common.loading") : t("auth.logoutButton")}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.statCard, styles.givenCard]}>
          <Text style={styles.statLabel}>{t("home.totalGiven")}</Text>
          <Text style={styles.statValue}>Rs. {totalGiven}</Text>
        </View>
        <View style={[styles.statCard, styles.pendingCard]}>
          <Text style={styles.statLabel}>{t("home.totalPending")}</Text>
          <Text style={styles.statValue}>Rs. {totalPending}</Text>
        </View>
      </View>
      <View style={styles.recoveredBox}>
        <Text style={styles.recoveredText}>{t("home.recovered", { amount: `Rs. ${totalRecovered}` })}</Text>
      </View>

      <View style={styles.quickActionsRow}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.key}
            style={styles.quickActionBtn}
            onPress={() => navigation.navigate(action.key)}
          >
            <Text style={styles.quickActionText}>
              {action.key === "Dashboard" ? t("home.dashboard") : t("home.borrowers")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate("AddLoan")}
      >
        <Text style={styles.addBtnText}>{t("home.addLoan")}</Text>
      </TouchableOpacity>

      <TextInput
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={t("home.searchPlaceholder")}
        style={styles.searchInput}
      />

      <View style={styles.filtersRow}>
        {[
          { key: "ALL", label: t("home.filter.all") },
          { key: "UNPAID", label: t("home.filter.unpaid") },
          { key: "PAID", label: t("home.filter.paid") },
          { key: "OVERDUE", label: t("home.filter.overdue") }
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
                ? t("home.empty.noLoans")
                : t("home.empty.noMatch")}
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
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8
  },
  logoutBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  logoutBtnText: {
    color: "#b91c1c",
    fontWeight: "700",
    fontSize: 12
  },
  logoutBtnDisabled: {
    opacity: 0.6
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
