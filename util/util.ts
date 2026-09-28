// import dayjs, { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
export const getNestedValue = (obj, key) => obj?.[key];

export const deepGet = (obj, path, defaultValue = undefined) => {
  return path
    .split(".")
    .reduce(
      (acc, key) => (acc && acc[key] !== undefined ? acc[key] : defaultValue),
      obj
    );
};

export function extractName(fromString: string) {
  if (fromString?.includes('<') && fromString?.includes('>')) {
    const namePart = fromString.split('<')[0].trim();
    return namePart.replace(/^"|"$/g, '');
  }
  return fromString;
}

export function formatFilename(filenameInput: any): string {
  if (!filenameInput) return "";

  // If input is an array, pick the most likely valid filename
  let filename = "";
  if (Array.isArray(filenameInput)) {
    filename = filenameInput.find((item) => typeof item === "string" && item.includes(".")) || filenameInput[0];
  } else if (typeof filenameInput === "string") {
    filename = filenameInput;
  } else {
    return "";
  }

  if (!filename) return "";

  // Handle 'filename="some%20file.png"' or similar pattern
  const match = filename.match(/filename="?([^"]+)"?/);
  if (match && match[1]) {
    filename = match[1];
  }

  // Decode percent-encoded characters safely
  try {
    filename = decodeURIComponent(filename);
  } catch {
    filename = filename
      .replace(/%20/g, " ")
      .replace(/%28/g, "(")
      .replace(/%29/g, ")")
      .replace(/%2C/g, ",")
      .replace(/%2D/g, "-")
      .replace(/%2E/g, ".")
      .replace(/%5F/g, "_");
  }

  return filename.trim();
}



