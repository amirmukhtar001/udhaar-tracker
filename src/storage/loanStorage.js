import AsyncStorage from "@react-native-async-storage/async-storage";

const LOANS_KEY = "loans";

export async function getLoans() {
  try {
    const data = await AsyncStorage.getItem(LOANS_KEY);
    return data ? JSON.parse(data) : [];
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
  const updated = [loan, ...loans];
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
