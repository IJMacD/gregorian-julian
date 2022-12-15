const d = new Date();
const CURRENT_DATE = {
  year: d.getFullYear(),
  month: d.getMonth() + 1,
  day: d.getDate(),
};

/**
 * Proleptic Gregorian Date from Julian Day
 * Algorithm from https://quasar.as.utexas.edu/BillInfo/JulianDatesG.html
 */
export function gregorianDateFromJD(jd) {
  const Z = jd;
  const W = ((Z - 1867216.25) / 36524.25) | 0;
  const X = (W / 4) | 0;
  const A = Z + 1 + W - X;
  const B = A + 1524;
  const C = ((B - 122.1) / 365.25) | 0;
  const D = (365.25 * C) | 0;
  const E = ((B - D) / 30.6001) | 0;
  const F = (30.6001 * E) | 0;

  const day = B - D - F;
  let month = E - 1;
  if (month > 12) {
    month -= 12;
  }
  const year = month <= 2 ? C - 4715 : C - 4716;

  return { year, month, day };
}

/**
 * Julian Day from Proleptic Gregorian Date
 * Algorithm from https://quasar.as.utexas.edu/BillInfo/JulianDatesG.html
 * Gives integer that starts at noon on the given date
 * @param {number} year
 * @param {number} month
 * @param {number} day
 */
export function jdFromGregorian (year, month, day) {
  if (month < 3) {
    year--;
    month += 12;
  }
  const A = Math.floor(year/100);
  const B = Math.floor(A/4);
  const C = 2-A+B;
  const E = Math.floor(365.25 * (year+4716));
  const F = Math.floor(30.6001 * (month+1));
  return C+day+E+F-1524;
}

/**
 * ISO Week Day
 * Algorithm from https://www.tondering.dk/claus/cal/week.php
 */
export function weekDayFromJD(jd) {
  const dt = gregorianDateFromJD(jd);
  let d;

  // Special case for 0000-01-01
  if (dt.year === 0 && dt.month === 1 && dt.day === 1) {
    return 7;
  }

  if (dt.month < 3) {
    const a = dt.year - 1;
    const b = Math.floor(a / 4) - Math.floor(a / 100) + Math.floor(a / 400);
    const e = 0;
    const f = dt.day - 1 + 31 * (dt.month - 1);
    const g = (a + b) % 7;
    d = (f + g - e) % 7;
  }
  else {
    const a = dt.year;
    const b = Math.floor(a / 4) - Math.floor(a / 100) + Math.floor(a / 400);
    const c = Math.floor((a - 1) / 4) - Math.floor((a - 1) / 100) + Math.floor((a - 1) / 400);
    const s = b - c;
    const e = s + 1;
    const f = dt.day + Math.floor((153 * (dt.month - 3) + 2) / 5) + 58 + s;
    const g = (a + b) % 7;
    d = (f + g - e) % 7;
  }

  // Algorithm gives 0 = Monday, etc.
  // Adjust to give ISO 8601 week day numbers
  return d + 1;
}

/**
 * @param {string} iso
 */
export function jdFromISO8601 (iso) {
  const cM = /(\d{4})[-\u2010](\d{2})[-\u2010](\d{2})/.exec(iso);
  if (cM) {
    return jdFromGregorian(+cM[1], +cM[2], +cM[3]);
  }

  const wM = /(\d{4})[-\u2010]W(\d{2})[-\u2010](\d)/.exec(iso);
  if (wM) {
    console.log("Whoops, you caught me. ISO 8601 week dates are not implemented");
    return NaN;
  }

  const oM = /(\d{4})[-\u2010](\d{3})/.exec(iso);
  if (oM) {
    return jdFromGregorian(+oM[1], 1, 1) + +oM[2] - 1;
  }

  return NaN;
}

/**
 *
 * @param {object?} [date]
 * @param {number} date.year
 * @param {number} date.month
 * @param {number} date.day
 * @returns
 */
export function formatDate(date = CURRENT_DATE) {
  if (date === null) return "";
  const { year, month, day } = date;
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

function julianAdjust(jd) {
  if (jd < 1722580) return NaN;   // < 0004-03-01
  if (jd < 1757643) return 2;     // < 0100-03-01
  if (jd < 1794167) return 1;     // < 0200-03-01
  if (jd < 1830691) return 0;     // < 0300-03-01
  if (jd < 1903740) return -1;    // < 0500-03-01
  if (jd < 1940264) return -2;    // < 0600-03-01
  if (jd < 1976788) return -3;    // < 0700-03-01
  if (jd < 2049837) return -4;    // < 0900-03-01
  if (jd < 2086361) return -5;    // < 1000-03-01
  if (jd < 2122885) return -6;    // < 1100-03-01
  if (jd < 2195934) return -7;    // < 1300-03-01
  if (jd < 2232458) return -8;    // < 1400-03-01
  if (jd < 2268982) return -9;    // < 1500-03-01
  if (jd < 2342031) return -10;   // < 1700-03-01
  if (jd < 2378555) return -11;   // < 1800-03-01
  if (jd < 2415079) return -12;   // < 1900-03-01
  if (jd < 2488128) return -13;   // < 2100-03-01
  return NaN;
}

export function julianDateFromJD(jd) {
  const adjust = julianAdjust(jd);
  if (isNaN(adjust)) return null;
  const d = gregorianDateFromJD(jd + adjust);
  if (d.year % 4 === 0 && d.month === 2 && d.day > 24) {
    d.day--;
  }
  return d;
}

/**
 * @param {string} region
 * @param {number} jd
 */
export function politicalDateFromJD (region, jd) {
  const calendar = getRegionCalendar(region, jd);
  if (calendar === "julian") {
    const d = julianDateFromJD(jd);

    if (region === "uk" && d) {
      if (d.year < 1752 && d.year >= 1155 && (d.month < 3 || (d.month === 3 && d.day < 25))) {
        d.year--;
      }
    }

    return d;
  }
  if (calendar === "gregorian")
    return gregorianDateFromJD(jd);
  return null;
}

/**
 * @param {string} region
 * @param {number} jd
 */
export function getRegionCalendar(region, jd) {
  if (region === "papal") {
    return jd < 2299161 ? "julian" : "gregorian";
  }

  if (region === "uk") {
    return jd < 2361222 ? "julian" : "gregorian";
  }

  if (region === "us_french") {
    return jd < 2299227 ? "julian" : "gregorian";
  }

  if (region === "russia") {
    return jd < 2421639 ? "julian" : "gregorian";
  }

  if (region === "france") {
    if (jd < 2299227) return "julian";
    if (jd < 2376207) return "gregorian";
    if (jd < 2380688) return "other";
    return "gregorian";
  }

  if (region === "japan") {
    return jd < 2405160 ? "other" : "gregorian";
  }

  if (region === "china") {
    return jd < 2419403 ? "other" : "gregorian";
  }
}
