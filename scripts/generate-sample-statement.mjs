import fs from "node:fs";

/** Dense 10-year bank statement samples for local demos. */
const start = new Date(Date.UTC(2016, 6, 26));
const end = new Date(Date.UTC(2026, 6, 26));

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(0xf00d5eed);

function daysInMonth(y, m) {
  return new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
}
function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}
function money(min, max) {
  return Number((min + rand() * (max - min)).toFixed(2));
}
function round2(n) {
  return Math.round(n * 100) / 100;
}
function pad(n) {
  return String(n).padStart(2, "0");
}
function csvEscape(s) {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

const groceries = [
  "WHOLE FOODS #4821",
  "TRADER JOE'S",
  "COSTCO WHSE",
  "KROGER #1190",
  "ALDI 729",
  "FRESH MARKET",
  "WALMART SUPERCENTER",
];
const dining = [
  "STARBUCKS STORE",
  "CHIPOTLE ONLINE",
  "UBER EATS",
  "DOORDASH*RESTAURANT",
  "LOCAL BISTRO",
  "SUSHI HOUSE",
  "PIZZA HUT",
  "MCDONALD'S",
];
const transport = [
  "UBER TRIP",
  "LYFT RIDE",
  "SHELL OIL",
  "CHEVRON",
  "METRO TRANSIT",
  "PARKING GARAGE",
  "EZ PASS TOLL",
];
const shopping = [
  "AMAZON.COM",
  "AMAZON MKTP",
  "TARGET.COM",
  "BEST BUY",
  "APPLE.COM/BILL",
  "IKEA",
  "HOME DEPOT",
  "NIKE STORE",
];
const health = [
  "CVS/PHARMACY",
  "WALGREENS",
  "PLANET FITNESS",
  "DENTAL CARE",
  "CITY MEDICAL CLINIC",
];
const entertainment = [
  "NETFLIX.COM",
  "SPOTIFY USA",
  "DISNEYPLUS",
  "AMC THEATRES",
  "STEAM GAMES",
  "TICKETMASTER",
];
const utilities = [
  "ELECTRIC COMPANY",
  "CITY WATER BILL",
  "COMCAST CABLE",
  "VERIZON WIRELESS",
  "GAS UTILITY",
];

const rows = [];

for (let y = 2016; y <= 2026; y++) {
  const mStart = y === 2016 ? 6 : 0;
  const mEnd = y === 2026 ? 6 : 11;
  for (let m = mStart; m <= mEnd; m++) {
    const dim = daysInMonth(y, m);
    // Keep income ahead of dense spending so the running balance stays believable.
    const salaryBase = 5200 + (y - 2016) * 220 + (m % 3 === 0 ? 150 : 0);
    const salaryDay = Math.min(28, 1 + Math.floor(rand() * 3));
    rows.push({
      date: `${y}-${pad(m + 1)}-${pad(salaryDay)}`,
      description: "ACH CREDIT EMPLOYER PAYROLL",
      amount: round2(salaryBase + money(-40, 120)),
      category: "Income",
    });

    if (rand() < 0.55) {
      const day = Math.min(dim, 8 + Math.floor(rand() * 18));
      rows.push({
        date: `${y}-${pad(m + 1)}-${pad(day)}`,
        description: pick([
          "ZELLE FROM CLIENT",
          "VENMO CASHOUT",
          "PAYPAL TRANSFER",
          "ACH CREDIT FREELANCE",
        ]),
        amount: money(200, 1200),
        category: "Income",
      });
    }

    if (m === 11 && rand() < 0.9) {
      rows.push({
        date: `${y}-12-${pad(15 + Math.floor(rand() * 10))}`,
        description: "ACH CREDIT YEAR END BONUS",
        amount: money(800, 2500),
        category: "Income",
      });
    }

    rows.push({
      date: `${y}-${pad(m + 1)}-03`,
      description: "BILL PAY RENT LANDLORD",
      amount: -round2(1350 + (y - 2016) * 45 + money(-20, 20)),
      category: "Housing",
    });

    for (let i = 0; i < 2 + Math.floor(rand() * 3); i++) {
      rows.push({
        date: `${y}-${pad(m + 1)}-${pad(Math.min(dim, 5 + Math.floor(rand() * 22)))}`,
        description: pick(utilities),
        amount: -money(35, 195),
        category: "Utilities",
      });
    }

    for (let i = 0; i < 6 + Math.floor(rand() * 5); i++) {
      rows.push({
        date: `${y}-${pad(m + 1)}-${pad(1 + Math.floor(rand() * dim))}`,
        description: pick(groceries),
        amount: -money(18, 160),
        category: "Groceries",
      });
    }

    for (let i = 0; i < 5 + Math.floor(rand() * 8); i++) {
      rows.push({
        date: `${y}-${pad(m + 1)}-${pad(1 + Math.floor(rand() * dim))}`,
        description: pick(dining),
        amount: -money(6, 85),
        category: "Dining",
      });
    }

    for (let i = 0; i < 8 + Math.floor(rand() * 9); i++) {
      rows.push({
        date: `${y}-${pad(m + 1)}-${pad(1 + Math.floor(rand() * dim))}`,
        description: pick(transport),
        amount: -money(4, 72),
        category: "Transport",
      });
    }

    for (let i = 0; i < 3 + Math.floor(rand() * 5); i++) {
      rows.push({
        date: `${y}-${pad(m + 1)}-${pad(1 + Math.floor(rand() * dim))}`,
        description: pick(shopping),
        amount: -money(12, 280),
        category: "Shopping",
      });
    }

    for (let i = 0; i < 1 + Math.floor(rand() * 3); i++) {
      rows.push({
        date: `${y}-${pad(m + 1)}-${pad(1 + Math.floor(rand() * dim))}`,
        description: pick(health),
        amount: -money(8, 220),
        category: "Health",
      });
    }

    for (let i = 0; i < 2 + Math.floor(rand() * 4); i++) {
      rows.push({
        date: `${y}-${pad(m + 1)}-${pad(1 + Math.floor(rand() * dim))}`,
        description: pick(entertainment),
        amount: -money(9, 65),
        category: "Entertainment",
      });
    }

    if (rand() < 0.55) {
      rows.push({
        date: `${y}-${pad(m + 1)}-${pad(1 + Math.floor(rand() * dim))}`,
        description: pick(["ATM WITHDRAWAL", "ZELLE TO FRIEND", "VENMO PAYMENT"]),
        amount: -money(40, 300),
        category: "Transfers",
      });
    }

    if (m === 0 && y > 2016) {
      rows.push({
        date: `${y}-01-15`,
        description: "INSURANCE ANNUAL PREMIUM",
        amount: -money(900, 1400),
        category: "Insurance",
      });
    }

    if (m === 3) {
      rows.push({
        date: `${y}-04-${pad(10 + Math.floor(rand() * 5))}`,
        description: "IRS USATAXPYMT",
        amount: -money(200, 1800),
        category: "Taxes",
      });
    }

    if ((m === 6 || m === 7) && rand() < 0.7) {
      rows.push({
        date: `${y}-${pad(m + 1)}-${pad(10 + Math.floor(rand() * 12))}`,
        description: pick(["AIRLINE TICKET", "HOTEL BOOKING", "AIRBNB *STAY"]),
        amount: -money(180, 1200),
        category: "Travel",
      });
    }

    if (m === 10) {
      for (let i = 0; i < 4 + Math.floor(rand() * 5); i++) {
        rows.push({
          date: `${y}-11-${pad(5 + Math.floor(rand() * 24))}`,
          description: pick(["AMAZON.COM", "TARGET.COM", "BEST BUY", "ETSY.COM"]),
          amount: -money(25, 250),
          category: "Shopping",
        });
      }
    }
  }
}

const filtered = rows
  .filter((r) => {
    const t = new Date(`${r.date}T00:00:00Z`).getTime();
    return t >= start.getTime() && t <= end.getTime();
  })
  .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

let balance = 8500;
const out = filtered.map((r) => {
  balance = round2(balance + r.amount);
  return { ...r, balance };
});

const byYear = {};
for (const r of out) {
  const y = r.date.slice(0, 4);
  byYear[y] = (byYear[y] || 0) + 1;
}

const root = new URL("../apps/web/public/samples/", import.meta.url);

const generic = ["Date,Description,Amount,Balance,Category"];
for (const r of out) {
  generic.push(
    [
      r.date,
      csvEscape(r.description),
      r.amount.toFixed(2),
      r.balance.toFixed(2),
      r.category,
    ].join(","),
  );
}
fs.writeFileSync(new URL("generic-amount.csv", root), `${generic.join("\n")}\n`);

const chase = ["Posting Date,Description,Amount,Balance,Type"];
for (const r of out) {
  const type =
    r.amount >= 0
      ? "ACH_CREDIT"
      : r.category === "Housing" || r.category === "Utilities"
        ? "BILLPAY"
        : "DEB";
  chase.push(
    [
      r.date,
      csvEscape(r.description),
      r.amount.toFixed(2),
      r.balance.toFixed(2),
      type,
    ].join(","),
  );
}
fs.writeFileSync(new URL("chase.csv", root), `${chase.join("\n")}\n`);

const debitCredit = ["Date,Description,Debit,Credit,Balance"];
for (const r of out) {
  debitCredit.push(
    [
      r.date,
      csvEscape(r.description),
      r.amount < 0 ? Math.abs(r.amount).toFixed(2) : "",
      r.amount >= 0 ? r.amount.toFixed(2) : "",
      r.balance.toFixed(2),
    ].join(","),
  );
}
fs.writeFileSync(
  new URL("generic-debit-credit.csv", root),
  `${debitCredit.join("\n")}\n`,
);

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const gt = ["Trans Date,Remarks,Debit,Credit,Balance"];
for (const r of out) {
  const [yy, mm, dd] = r.date.split("-");
  const named = `${Number(dd)}-${months[Number(mm) - 1]}-${yy}`;
  gt.push(
    [
      named,
      csvEscape(r.description),
      r.amount < 0 ? Math.abs(r.amount).toFixed(2) : "",
      r.amount >= 0 ? r.amount.toFixed(2) : "",
      r.balance.toFixed(2),
    ].join(","),
  );
}
fs.writeFileSync(new URL("gtbank.csv", root), `${gt.join("\n")}\n`);

const hsbc = ["Date,Description,Amount,Balance"];
for (const r of out) {
  hsbc.push(
    [
      r.date,
      csvEscape(r.description),
      r.amount.toFixed(2),
      r.balance.toFixed(2),
    ].join(","),
  );
}
fs.writeFileSync(new URL("hsbc-uk.csv", root), `${hsbc.join("\n")}\n`);

console.log("total rows", out.length);
console.log("by year", byYear);
console.log("range", out[0]?.date, "→", out[out.length - 1]?.date);
