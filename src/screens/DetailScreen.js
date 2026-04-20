import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getLoans, deleteLoan, updateLoan } from "../storage/loanStorage";
import {
  cancelLoanReminder,
  scheduleLoanReminder
} from "../utils/notification";
import { getLoanStatus, getRemainingAmount, getTotalPaid } from "../utils/loanMath";

function row(label, value) {
  return (
    <View style={styles.row} key={label}>
      <Text style={styles.key}>{label}</Text>
      <Text style={styles.value}>{value || "-"}</Text>
    </View>
  );
}

function formatShortDate(dateInput) {
  if (!dateInput) return "-";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toISOString().split("T")[0];
}

export default function DetailScreen({ route, navigation }) {
  const { loanId } = route.params;
  const [loan, setLoan] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const loans = await getLoans();
        const found = loans.find((item) => item.id === loanId);
        setLoan(found || null);
      };
      load();
    }, [loanId])
  );

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

  const totalPaid = getTotalPaid(loan);
  const remainingAmount = getRemainingAmount(loan);
  const statusText = getLoanStatus(loan);
  const payments = Array.isArray(loan.payments) ? [...loan.payments].reverse() : [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {row("Name", loan.name)}
        {row("Amount", `Rs. ${loan.amount}`)}
        {row("Paid", `Rs. ${totalPaid}`)}
        {row("Remaining", `Rs. ${remainingAmount}`)}
        {row("Note", loan.note || "-")}
        {row("Date", loan.date)}
        {row("Reminder", loan.reminderDate ? loan.reminderDate.split("T")[0] : "-")}
        {row("Status", statusText)}
      </View>

      <TouchableOpacity style={styles.toggleBtn} onPress={toggleStatus}>
        <Text style={styles.btnText}>
          Mark as {loan.isPaid ? "Unpaid" : "Paid"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.payBtn}
        onPress={() => navigation.navigate("AddPayment", { loanId: loan.id })}
      >
        <Text style={styles.btnText}>Add Payment</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => navigation.navigate("EditLoan", { loanId: loan.id })}
      >
        <Text style={styles.btnText}>Edit Loan</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
        <Text style={styles.btnText}>Delete Loan</Text>
      </TouchableOpacity>

      <View style={styles.historyCard}>
        <Text style={styles.historyTitle}>Payment History</Text>
        {payments.length === 0 ? (
          <Text style={styles.historyEmpty}>No payments recorded yet.</Text>
        ) : (
          payments.map((payment) => (
            <View key={payment.id} style={styles.paymentRow}>
              <View>
                <Text style={styles.paymentAmount}>Rs. {payment.amount}</Text>
                <Text style={styles.paymentDate}>
                  {formatShortDate(payment.createdAt)}
                </Text>
              </View>
              <Text style={styles.paymentNote}>{payment.note || "-"}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f3f4f6",
    padding: 16,
    paddingBottom: 30
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
  payBtn: {
    marginTop: 10,
    backgroundColor: "#0ea5e9",
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
  editBtn: {
    marginTop: 10,
    backgroundColor: "#6b7280",
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
  },
  historyCard: {
    marginTop: 14,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14
  },
  historyTitle: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 10
  },
  historyEmpty: {
    color: "#6b7280"
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6"
  },
  paymentAmount: {
    color: "#111827",
    fontWeight: "700"
  },
  paymentDate: {
    color: "#6b7280",
    marginTop: 2,
    fontSize: 12
  },
  paymentNote: {
    color: "#374151",
    maxWidth: "55%",
    textAlign: "right"
  }
});
