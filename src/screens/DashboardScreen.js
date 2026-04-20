import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getLoans } from "../storage/loanStorage";
import {
  getRemainingAmount,
  getTotalPaid,
  isLoanOverdue
} from "../utils/loanMath";

function isInCurrentMonth(dateValue) {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

function StatCard({ label, value, tint }) {
  return (
    <View style={[styles.card, tint]}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const [stats, setStats] = useState({
    totalLent: 0,
    totalRecovered: 0,
    totalPending: 0,
    overdueCount: 0,
    monthLent: 0,
    monthRecovered: 0
  });

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const loans = await getLoans();

        const totalLent = loans.reduce((sum, loan) => sum + Number(loan.amount || 0), 0);
        const totalRecovered = loans.reduce((sum, loan) => sum + getTotalPaid(loan), 0);
        const totalPending = loans.reduce((sum, loan) => sum + getRemainingAmount(loan), 0);
        const overdueCount = loans.filter((loan) => isLoanOverdue(loan)).length;
        const monthLent = loans
          .filter((loan) => isInCurrentMonth(loan.createdAt))
          .reduce((sum, loan) => sum + Number(loan.amount || 0), 0);
        const monthRecovered = loans.reduce((sum, loan) => {
          if (!Array.isArray(loan.payments)) return sum;
          const currentMonthPayments = loan.payments.filter((payment) =>
            isInCurrentMonth(payment.createdAt)
          );
          return (
            sum + currentMonthPayments.reduce((acc, payment) => acc + Number(payment.amount || 0), 0)
          );
        }, 0);

        setStats({
          totalLent,
          totalRecovered,
          totalPending,
          overdueCount,
          monthLent,
          monthRecovered
        });
      };

      load();
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.sectionTitle}>Overall</Text>
      <View style={styles.grid}>
        <StatCard label="Total Lent" value={`Rs. ${stats.totalLent}`} tint={styles.blue} />
        <StatCard label="Total Recovered" value={`Rs. ${stats.totalRecovered}`} tint={styles.green} />
        <StatCard label="Total Pending" value={`Rs. ${stats.totalPending}`} tint={styles.red} />
        <StatCard label="Overdue Loans" value={String(stats.overdueCount)} tint={styles.orange} />
      </View>

      <Text style={styles.sectionTitle}>This Month</Text>
      <View style={styles.grid}>
        <StatCard label="Lent This Month" value={`Rs. ${stats.monthLent}`} tint={styles.purple} />
        <StatCard
          label="Recovered This Month"
          value={`Rs. ${stats.monthRecovered}`}
          tint={styles.teal}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f3f4f6"
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
    marginTop: 6
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 8
  },
  card: {
    width: "48%",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10
  },
  cardLabel: {
    color: "#374151",
    fontWeight: "600",
    marginBottom: 4
  },
  cardValue: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 18
  },
  blue: { backgroundColor: "#dbeafe" },
  green: { backgroundColor: "#dcfce7" },
  red: { backgroundColor: "#fee2e2" },
  orange: { backgroundColor: "#ffedd5" },
  purple: { backgroundColor: "#ede9fe" },
  teal: { backgroundColor: "#ccfbf1" }
});
