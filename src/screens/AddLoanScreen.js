import React, { useState } from "react";
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
import { addLoan } from "../storage/loanStorage";
import { scheduleLoanReminder } from "../utils/notification";

function formatDate(date) {
  if (!date) return "Select reminder date (optional)";
  return date.toISOString().split("T")[0];
}

export default function AddLoanScreen({ navigation }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [reminderDate, setReminderDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  const onDateChange = (_, selectedDate) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (selectedDate) {
      setReminderDate(selectedDate);
    }
  };

  const handleSave = async () => {
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

    const loan = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: cleanName,
      amount: numericAmount,
      note: note.trim(),
      payments: [],
      date: new Date().toISOString().split("T")[0],
      reminderDate: reminderDate ? reminderDate.toISOString() : null,
      isPaid: false,
      createdAt: new Date().toISOString(),
      notificationId: null
    };

    if (loan.reminderDate) {
      loan.notificationId = await scheduleLoanReminder(loan);
    }

    await addLoan(loan);
    navigation.goBack();
  };

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

      {showPicker && (
        <DateTimePicker
          value={reminderDate || new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
          minimumDate={new Date()}
        />
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Loan</Text>
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
