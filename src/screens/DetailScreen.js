import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { getLoans, deleteLoan, updateLoan } from "../storage/loanStorage";
import {
  cancelLoanReminder,
  scheduleLoanReminder
} from "../utils/notification";

function row(label, value) {
  return (
    <View style={styles.row} key={label}>
      <Text style={styles.key}>{label}</Text>
      <Text style={styles.value}>{value || "-"}</Text>
    </View>
  );
}

export default function DetailScreen({ route, navigation }) {
  const { loanId } = route.params;
  const [loan, setLoan] = useState(null);

  useEffect(() => {
    const load = async () => {
      const loans = await getLoans();
      const found = loans.find((item) => item.id === loanId);
      setLoan(found || null);
    };
    load();
  }, [loanId]);

  const toggleStatus = async () => {
    if (!loan) return;
    const nextPaid = !loan.isPaid;
    let notificationId = loan.notificationId || null;

    if (nextPaid) {
      await cancelLoanReminder(notificationId);
      notificationId = null;
    } else if (loan.reminderDate) {
      notificationId = await scheduleLoanReminder(loan);
    }

    await updateLoan(loan.id, { isPaid: nextPaid, notificationId });
    setLoan((prev) => ({ ...prev, isPaid: nextPaid, notificationId }));
  };

  const onDelete = () => {
    if (!loan) return;

    Alert.alert("Delete Loan", `Delete ${loan.name}'s loan?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await cancelLoanReminder(loan.notificationId);
          await deleteLoan(loan.id);
          navigation.goBack();
        }
      }
    ]);
  };

  if (!loan) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>Loan not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {row("Name", loan.name)}
        {row("Amount", `Rs. ${loan.amount}`)}
        {row("Note", loan.note || "-")}
        {row("Date", loan.date)}
        {row("Reminder", loan.reminderDate ? loan.reminderDate.split("T")[0] : "-")}
        {row("Status", loan.isPaid ? "Paid" : "Unpaid")}
      </View>

      <TouchableOpacity style={styles.toggleBtn} onPress={toggleStatus}>
        <Text style={styles.btnText}>
          Mark as {loan.isPaid ? "Unpaid" : "Paid"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
        <Text style={styles.btnText}>Delete Loan</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 16
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14
  },
  row: {
    marginBottom: 10
  },
  key: {
    color: "#6b7280",
    marginBottom: 2
  },
  value: {
    color: "#111827",
    fontWeight: "600"
  },
  toggleBtn: {
    marginTop: 18,
    backgroundColor: "#2563eb",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12
  },
  deleteBtn: {
    marginTop: 10,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 12
  },
  btnText: {
    color: "#fff",
    fontWeight: "700"
  },
  notFound: {
    color: "#6b7280"
  }
});
