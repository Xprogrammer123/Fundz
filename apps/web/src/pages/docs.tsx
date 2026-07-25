import { Link } from "react-router-dom";

export function DocsPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-10 pb-16">
      <header className="space-y-3">
        <h1 className="font-display text-4xl text-ink">Funds documentation</h1>
        <p className="text-muted-foreground">
          Everything about how Funds works, why it is local-first, how to import
          bank statements, read charts, export data, and stay safe.
        </p>
      </header>

      <Nav />

      <Section id="promise" title="Privacy promise">
        <p>
          <strong>
            Processing happens only on your device. We never receive your
            statements.
          </strong>
        </p>
        <p>
          Funds is a static web app (and optional browser extension). There is
          no account server, no cloud sync of transactions, and no analytics
          that can see your bank data. When you open the site, your browser
          downloads the app code. After that, statement files are read, parsed,
          stored, charted, and exported entirely inside your browser tab.
        </p>
        <ul>
          <li>No upload of CSV/PDF contents to a Funds backend</li>
          <li>SQLite lives in IndexedDB on this device</li>
          <li>Optional passphrase encrypts the vault with AES-GCM</li>
          <li>After first load, airplane mode still works</li>
        </ul>
      </Section>

      <Section id="how-it-works" title="How it works end-to-end">
        <ol>
          <li>
            <strong>Open Funds</strong> in a browser (desktop website) or install
            the PWA on your phone.
          </li>
          <li>
            <strong>Create a vault</strong> — optionally set a passphrase. This
            only encrypts the local database blob.
          </li>
          <li>
            <strong>Import</strong> a bank CSV or PDF. Columns are mapped to a
            common shape: date, description, amount, balance, category.
          </li>
          <li>
            <strong>Normalize</strong> amounts to signed numbers (expenses
            negative, or debit/credit merged).
          </li>
          <li>
            <strong>Store</strong> rows in sql.js (SQLite compiled to WebAssembly)
            and persist an encrypted (or plain-local) snapshot to IndexedDB.
          </li>
          <li>
            <strong>Explore</strong> transactions, filter charts by day/month/year,
            and export Excel or chart images — still offline-capable.
          </li>
        </ol>
      </Section>

      <Section id="import" title="Importing statements">
        <p>
          Go to <Link to="/import">Import</Link>. Drop a <code>.csv</code> or{" "}
          <code>.pdf</code>. After a successful import, Funds automatically opens
          the Transactions page so you can verify the rows, then jump to Charts.
        </p>
        <h3>CSV</h3>
        <p>
          Funds guesses column names, or you can pick a bank preset (Chase, HSBC
          UK, GTBank, generic amount, generic debit/credit). Required fields are
          date + description, plus either a single amount column or debit/credit
          columns.
        </p>
        <h3>PDF</h3>
        <p>
          PDF support uses a heuristic line parser (date + description + amount).
          Bank PDFs vary wildly — CSV exports are more reliable. Dedicated PDF
          adapters can be added when you have real sample statements.
        </p>
        <h3>Sample files</h3>
        <p>
          The Import page links to sample CSVs under <code>/samples/</code> so
          you can try the full flow without using a real statement.
        </p>
      </Section>

      <Section id="data-model" title="What gets stored">
        <p>Local SQLite tables (simplified):</p>
        <ul>
          <li>
            <code>accounts</code> — name, currency
          </li>
          <li>
            <code>imports</code> — source filename, format, row count
          </li>
          <li>
            <code>transactions</code> — date, description, signed amount,
            balance, category
          </li>
          <li>
            <code>categories</code> — optional keyword rules (future)
          </li>
          <li>
            <code>meta</code> — schema version
          </li>
        </ul>
        <p>
          The database file never leaves your browser storage. Wipe it anytime in{" "}
          <Link to="/settings">Settings</Link>.
        </p>
      </Section>

      <Section id="charts" title="Charts">
        <p>
          Charts are powered by <strong>EvilCharts</strong> on the{" "}
          <strong>Apache ECharts</strong> engine. Each chart type is split into
          its own React file under <code>src/components/charts/</code> so styles
          and variants can be customized independently later.
        </p>
        <p>Available types:</p>
        <ul>
          <li>Bar, Line, Area, Pie</li>
          <li>Composed (bars + net line)</li>
          <li>Radar, Radial</li>
          <li>Sankey (income → spending → categories)</li>
        </ul>
        <p>Controls:</p>
        <ul>
          <li>
            <strong>What to show</strong> — spending, income, both, or categories
          </li>
          <li>
            <strong>Group by</strong> — day, month, or year
          </li>
          <li>
            <strong>Year / month</strong> filters
          </li>
          <li>
            <strong>Export PNG / JPG</strong> — downloads the chart canvas to your
            device (no upload)
          </li>
        </ul>
      </Section>

      <Section id="export" title="Exports">
        <ul>
          <li>
            <strong>Excel</strong> — from Transactions, downloads{" "}
            <code>.xlsx</code> via SheetJS in the browser
          </li>
          <li>
            <strong>Chart images</strong> — PNG or JPG from the Charts page
          </li>
        </ul>
        <p>
          Treat exported files like the original statements: they contain
          sensitive financial history if you share or sync them carelessly.
        </p>
      </Section>

      <Section id="security" title="Security & risk">
        <p>
          Local-first removes the risk of a Funds server breach, but it does not
          remove all risk:
        </p>
        <ul>
          <li>Stolen laptop / shared computer</li>
          <li>Malware on the device</li>
          <li>Browser profile sync if the user enables it at the OS/browser level</li>
          <li>Exported Excel/PNG files copied elsewhere</li>
        </ul>
        <p>Mitigations in the app:</p>
        <ul>
          <li>Optional vault passphrase (AES-GCM)</li>
          <li>Content-Security-Policy limiting unexpected network calls</li>
          <li>Wipe local data control</li>
          <li>No telemetry of transaction contents</li>
        </ul>
        <p>
          If a bank statement leaks, attackers can attempt identity fraud,
          targeted phishing, profiling, or blackmail — which is exactly why Funds
          refuses to centralize this data.
        </p>
      </Section>

      <Section id="extension" title="Browser extension">
        <p>
          Phase 2 includes a Chromium MV3 extension under{" "}
          <code>apps/extension</code>. It reuses CSV parsing from{" "}
          <code>@funds/core</code>, stores rows in <code>chrome.storage.local</code>,
          and has <strong>no host permissions</strong>. Build with:
        </p>
        <pre>
          <code>pnpm build:extension</code>
        </pre>
        <p>
          Then load <code>apps/extension/dist</code> as an unpacked extension.
          Full charts and encrypted SQLite remain in the web app.
        </p>
      </Section>

      <Section id="monetization" title="Monetization (product notes)">
        <p>Designed to stay local-first:</p>
        <ul>
          <li>Free: single account, CSV import, basic charts, CSV/Excel export</li>
          <li>
            Paid one-time offline license (future): multi-account, PDF bank packs,
            advanced templates
          </li>
          <li>Never sell or aggregate user transaction data</li>
        </ul>
      </Section>

      <Section id="develop" title="Developers">
        <pre>
          <code>{`pnpm install
pnpm dev          # web PWA
pnpm build        # core + web + extension
pnpm build:extension`}</code>
        </pre>
        <p>Monorepo layout:</p>
        <ul>
          <li>
            <code>apps/web</code> — React + Vite PWA + EvilCharts
          </li>
          <li>
            <code>apps/extension</code> — MV3 popup shell
          </li>
          <li>
            <code>packages/core</code> — parse, SQLite, crypto, analytics, excel
          </li>
          <li>
            <code>packages/banks</code> — bank presets / header matching
          </li>
        </ul>
        <p>
          Chart view files (for pasting EvilCharts style variants):{" "}
          <code>apps/web/src/components/charts/*-view.tsx</code>
        </p>
      </Section>

      <Section id="faq" title="FAQ">
        <h3>Does Funds see my bank password?</h3>
        <p>No. There is no bank login or aggregation API.</p>
        <h3>Where is my data?</h3>
        <p>
          In this browser’s IndexedDB for this origin. Clearing site data deletes
          the vault unless you exported Excel first.
        </p>
        <h3>Can I use it offline?</h3>
        <p>
          Yes, after the first visit — the service worker caches the app shell,
          and the vault is local.
        </p>
        <h3>Why are some PDFs empty?</h3>
        <p>
          Many bank PDFs are image-only or oddly laid out. Prefer CSV; PDF heuristics
          only catch simple text lines.
        </p>
      </Section>
    </article>
  );
}

function Nav() {
  const items = [
    ["#promise", "Privacy"],
    ["#how-it-works", "How it works"],
    ["#import", "Import"],
    ["#data-model", "Data model"],
    ["#charts", "Charts"],
    ["#export", "Exports"],
    ["#security", "Security"],
    ["#extension", "Extension"],
    ["#monetization", "Monetization"],
    ["#develop", "Developers"],
    ["#faq", "FAQ"],
  ] as const;

  return (
    <nav className="flex flex-wrap gap-2 rounded-3xl border border-border/70 bg-white/55 p-3 text-sm backdrop-blur">
      {items.map(([href, label]) => (
        <a
          key={href}
          href={href}
          className="rounded-lg bg-muted px-2.5 py-1 text-muted-foreground hover:bg-sand hover:text-ink"
        >
          {label}
        </a>
      ))}
    </nav>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <h2 className="font-display text-2xl text-ink">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground [&_a]:text-moss [&_a]:underline-offset-2 hover:[&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-ink [&_h3]:mt-4 [&_h3]:font-medium [&_h3]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_ol]:list-decimal [&_ol_li]:ml-5 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:border [&_pre]:border-border [&_pre]:bg-ink [&_pre]:p-4 [&_pre]:text-leaf [&_strong]:text-ink">
        {children}
      </div>
    </section>
  );
}
