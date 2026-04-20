import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { getLoans, updateLoan } from "../storage/loanStorage";
import {
  cancelLoanReminder,
  scheduleLoanReminder
} from "../utils/notification";

function formatDate(date) {
  if (!date) return "Select reminder date (optional)";
  return date.toISOString().split("T")[0];
}

function parseDate(input) {
  if (!input) return null;
  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export default function EditLoanScreen({ route, navigation }) {
  const { loanId } = route.params;
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [reminderDate, setReminderDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const loadLoan = async () => {
      const loans = await getLoans();
      const found = loans.find((item) => item.id === loanId) || null;

      setLoan(found);
      if (found) {
        setName(found.name || "");
        setAmount(String(found.amount || ""));
        setNote(found.note || "");
        setReminderDate(parseDate(found.reminderDate));
      }
      setLoading(false);
    };

    loadLoan();
  }, [loanId]);

  const onDateChange = (_, selectedDate) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (selectedDate) {
      setReminderDate(selectedDate);
    }
  };

  const clearReminder = () => {
    setReminderDate(null);
    setShowPicker(false);
  };

  const handleSave = async () => {
    if (!loan) return;

    const cleanName = name.trim();
    const numericAmount = Number(amount);

    if (!cleanName) {
      Alert.alert("Validation", "Name is required.");
      return;
    }
    if (!numericAmount || numericAmount <= 0) {
      Alert.alert("Validation", "Amount must be greater than 0.");
      return;
    }

    try {
      const nextReminderDate = reminderDate ? reminderDate.toISOString() : null;
      let notificationId = loan.notificationId || null;
      const reminderChanged = (loan.reminderDate || null) !== nextReminderDate;

      if (notificationId && (reminderChanged || !nextReminderDate || loan.isPaid)) {
        await cancelLoanReminder(notificationId);
        notificationId = null;
      }

      if (!loan.isPaid && nextReminderDate) {
        notificationId = await scheduleLoanReminder({
          ...loan,
          name: cleanName,
          amount: numericAmount,
          reminderDate: nextReminderDate
        });
      }

      await updateLoan(loan.id, {
        name: cleanName,
        amount: numericAmount,
        note: note.trim(),
        reminderDate: nextReminderDate,
        notificationId
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Unable to update loan. Please try again.");
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.infoText}>Loading...</Text>
      </View>
    );
  }

  if (!loan) {
    return (
      <View style={styles.container}>
        <Text style={styles.infoText}>Loan not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name *</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g. Ali"
        style={styles.input}
      />

      <Text style={styles.label}>Amount *</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        placeholder="e.g. 5000"
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Note (optional)</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Dinner, rent, etc."
        style={styles.input}
      />

      <Text style={styles.label}>Reminder Date (optional)</Text>
      <TouchableOpacity style={styles.dateBtn} onPress={() => setShowPicker(true)}>
        <Text style={styles.dateBtnText}>{formatDate(reminderDate)}</Text>
      </TouchableOpacity>

      {reminderDate ? (
        <TouchableOpacity style={styles.clearBtn} onPress={clearReminder}>
          <Text style={styles.clearBtnText}>Clear Reminder Date</Text>
        </TouchableOpacity>
      ) : null}

      {showPicker && (
        <DateTimePicker
          value={reminderDate || new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16
  },
  infoText: {
    color: "#6b7280"
  },
  label: {
    marginTop: 10,
    marginBottom: 6,
    color: "#374151",
    fontWeight: "600"
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  dateBtn: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12
  },
  dateBtnText: {
    color: "#111827"
  },
  clearBtn: {
    marginTop: 10,
    alignSelf: "flex-start"
  },
  clearBtnText: {
    color: "#dc2626",
    fontWeight: "600"
  },
  saveBtn: {
    marginTop: 24,
    backgroundColor: "#2563eb",
    borderRadius: 10,
    alignItems: "center",
    paddingVertical: 13
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "700"
  }
});
