import { formatDate, getDate } from "date-fns";

export const formatDateAndTime = (isoDate: string) => {
    const date = isoDate;

    const day = getDate(date);
    let daySuffix = 'th';
    if (day % 10 === 1 && day !== 11) daySuffix = 'st';
    else if (day % 10 === 2 && day !== 12) daySuffix = 'nd';
    else if (day % 10 === 3 && day !== 13) daySuffix = 'rd';

    return formatDate(date, `EEEE do MMMM yyyy 'at' h:mmaaa`)
        .replace(/\b(\d+)(?:st|nd|rd|th)\b/, `${day}${daySuffix}`)
        .replace('AM', 'am')
        .replace('PM', 'pm');
};

export const formatRelativeDate = (isoDate: string): string => {
    const now = new Date();
    const date = new Date(isoDate);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const timeFormatter = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).format(date).toLowerCase();

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInWeeks = Math.floor(diffInDays / 7);
    const diffInMonths = Math.floor(diffInDays / 30);
    const diffInYears = Math.floor(diffInDays / 365);

    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    } else if (diffInHours < 24 && now.getDate() === date.getDate()) {
        return `Today ${timeFormatter}`;
    } else if (diffInDays < 1) {
        return `Yesterday ${timeFormatter}`;
    } else if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    } else if (diffInWeeks < 4) {
        return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
    } else if (diffInMonths < 12) {
        return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
    } else {
        const day = date.getDate();
        let daySuffix = 'th';
        if (day % 10 === 1 && day !== 11) daySuffix = 'st';
        else if (day % 10 === 2 && day !== 12) daySuffix = 'nd';
        else if (day % 10 === 3 && day !== 13) daySuffix = 'rd';

        const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long' });
        const month = monthFormatter.format(date);
        const year = date.getFullYear();

        return `${day}${daySuffix} ${month} ${year}`;
    }
};

export const getRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds} seconds ago`;
  if (seconds < intervals.hour) {
    const minutes = Math.floor(seconds / intervals.minute);
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  if (seconds < intervals.day) {
    const hours = Math.floor(seconds / intervals.hour);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(seconds / intervals.day);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;

  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }

  if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }

  const years = Math.floor(days / 365);
  return `${years} year${years === 1 ? "" : "s"} ago`;
};

export function eventFormatDateAndTime(dateString: any) {
  if (!dateString) {
    return ""; // or return 'Invalid date' or whatever default you prefer
  }

  const date = new Date(dateString);

  // Format the date parts
  const options: any = {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  const formatted = new Intl.DateTimeFormat("en-US", options).format(date);

  // Add ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";

  return formatted
    .replace(/(\d+)/, `$1${suffix}`) // Add ordinal suffix
    .replace(/,/, " at") // Replace comma with 'at'
    .replace(/(am|pm)/i, (match) => match.toLowerCase()); // Ensure lowercase am/pm
}

export function eventShareDateFormat(dateString: any) {
  if (!dateString) {
    return ""; // or return 'Invalid date' or whatever default you prefer
  }

  const date = new Date(dateString);

  // Format the date parts
  const options: any = {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };

  const formatted = new Intl.DateTimeFormat("en-US", options).format(date);

  // Add ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";

  return formatted
    .replace(/(\d+)/, `$1${suffix}`) // Add ordinal suffix
    .replace(/,/, ",")
    .replace(/(am|pm)/i, (match) => match.toLowerCase()); // Ensure lowercase am/pm
}

import { format } from "date-fns";

export function mailDetailDateFormat(dateString: any) {
  if (!dateString) {
    return ""; // or "Invalid date"
  }

  const date = new Date(dateString);

  // Get the day and its ordinal suffix
  const day = date.getDate();
  const suffix =
    day % 10 === 1 && day !== 11
      ? "st"
      : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
          ? "rd"
          : "th";

  // Format: e.g. "Oct 7th 2025"
  const monthYear = format(date, "MMM yy");

  return `${format(date, "d")}${suffix} ${monthYear}`;
}

