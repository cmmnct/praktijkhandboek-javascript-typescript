// utils.gerenateRandomResults.ts
import { State, Result } from "../models/models";
import { firestore } from "../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { User } from "firebase/auth";
export async function generateResults(user: User | null, state: State) {
const results: Result[] = [];
const gridSizes = [16, 25, 36];
const startDate = new Date(2024, 0, 1); // Start vanaf een gekozen dag
const endDate = new Date(2024, 6, 18); // Tot en met een gekozen dag
for (
let date = startDate;
date <= endDate;
date.setDate(date.getDate() + 1) // in elke iteratie een volgende dag
) {
gridSizes.forEach((gridSize) => {
for (let i = 0; i < 2; i++) {
let randomAttempts = Math.floor(Math.random() * gridSize + (gridSize - 4));
results.push({
date: new Date(date).toISOString(),
attempts: randomAttempts,
gridSize,
score: 10 * ((gridSize - 4) / randomAttempts), // Willekeurige score
});
}
});
}
// Sorteer resultaten op datum
results.sort(
(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
);
const userId = user?.uid;
state.results = results;
if (userId) {
const stateRef = doc(firestore, `users/${userId}/gameState/state`);
await setDoc(stateRef, state);
} else {
console.log("error: could not save fake data")
}
}