import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable
} from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";

function ActionButton({ label, color, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionBtn,
        { backgroundColor: color, opacity: pressed ? 0.8 : 1 }
      ]}
    >
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

export default function LoanItem({ loan, onPress, onTogglePaid, onDelete }) {
  const renderRightActions = () => (
    <View style={styles.actions}>
      <ActionButton
        label={loan.isPaid ? "Unpaid" : "Paid"}
        color={loan.isPaid ? "#f59e0b" : "#22c55e"}
        onPress={onTogglePaid}
      />
      <ActionButton label="Delete" color="#ef4444" onPress={onDelete} />
    </View>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
        <View>
          <Text style={styles.name}>{loan.name}</Text>
          <Text style={styles.note}>{loan.note || "No note"}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.amount}>Rs. {loan.amount}</Text>
          <Text style={[styles.status, loan.isPaid ? styles.paid : styles.unpaid]}>
            {loan.isPaid ? "Paid" : "Unpaid"}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 1
  },
  name: {
    fontWeight: "700",
    fontSize: 16,
    color: "#111827"
  },
  note: {
    marginTop: 4,
    color: "#6b7280"
  },
  right: {
    alignItems: "flex-end"
  },
  amount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827"
  },
  status: {
    marginTop: 4,
    fontWeight: "700"
  },
  paid: {
    color: "#16a34a"
  },
  unpaid: {
    color: "#dc2626"
  },
  actions: {
    flexDirection: "row",
    marginBottom: 12
  },
  actionBtn: {
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginLeft: 8
  },
  actionText: {
    color: "#fff",
    fontWeight: "700"
  }
});
