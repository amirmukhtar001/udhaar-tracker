import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert
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
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>Total Given: Rs. {totalGiven}</Text>
        <Text style={styles.summaryText}>Total Pending: Rs. {totalPending}</Text>
      </View>

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate("AddLoan")}
      >
        <Text style={styles.addBtnText}>+ Add Loan</Text>
      </TouchableOpacity>

      <FlatList
        data={loans}
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
            <Text style={styles.emptyText}>No loans yet. Add your first udhaar.</Text>
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
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12
  },
  summaryText: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "600",
    marginBottom: 4
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
