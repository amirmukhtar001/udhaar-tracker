import AsyncStorage from "@react-native-async-storage/async-storage";

const LOANS_KEY = "loans";

function normalizeLoan(loan) {
  return {
    ...loan,
    payments: Array.isArray(loan.payments) ? loan.payments : []
  };
}

export async function getLoans() {
  try {
    const data = await AsyncStorage.getItem(LOANS_KEY);
    const parsed = data ? JSON.parse(data) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeLoan);
  } catch (error) {
    console.warn("Failed to load loans", error);
    return [];
  }
}

export async function saveLoans(loans) {
  await AsyncStorage.setItem(LOANS_KEY, JSON.stringify(loans));
}

export async function addLoan(loan) {
  const loans = await getLoans();
  const updated = [normalizeLoan(loan), ...loans];
  await saveLoans(updated);
  return updated;
}

export async function updateLoan(id, data) {
  const loans = await getLoans();
  const updated = loans.map((loan) =>
    loan.id === id ? { ...loan, ...data } : loan
  );
  await saveLoans(updated);
  return updated;
}

export async function deleteLoan(id) {
  const loans = await getLoans();
  const updated = loans.filter((loan) => loan.id !== id);
  await saveLoans(updated);
  return updated;
}

export async function addPaymentToLoan(loanId, payment) {
  const loans = await getLoans();
  const updated = loans.map((loan) => {
    if (loan.id !== loanId) return loan;

    const payments = [...loan.payments, payment];
    const totalPaid = payments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const amount = Number(loan.amount || 0);
    const isPaid = totalPaid >= amount;

    return {
      ...loan,
      payments,
      isPaid
    };
  });

  await saveLoans(updated);
  return updated;
}
