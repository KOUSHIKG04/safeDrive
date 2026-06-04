import AsyncStorage from "@react-native-async-storage/async-storage";
import type { DriveSummary } from "./types";

const DRIVE_HISTORY_KEY = "safedrive.driveHistory.v1";
const MAX_STORED_DRIVES = 12;

export async function loadDriveHistory(): Promise<DriveSummary[]> {
  const rawValue = await AsyncStorage.getItem(DRIVE_HISTORY_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as DriveSummary[];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveDriveSummary(
  summary: DriveSummary,
): Promise<DriveSummary[]> {
  const currentHistory = await loadDriveHistory();
  const nextHistory = [summary, ...currentHistory]
    .filter((drive, index, allDrives) => {
      return allDrives.findIndex((candidate) => candidate.id === drive.id) === index;
    })
    .slice(0, MAX_STORED_DRIVES);

  await AsyncStorage.setItem(DRIVE_HISTORY_KEY, JSON.stringify(nextHistory));

  return nextHistory;
}

export async function clearDriveHistory(): Promise<void> {
  await AsyncStorage.removeItem(DRIVE_HISTORY_KEY);
}
