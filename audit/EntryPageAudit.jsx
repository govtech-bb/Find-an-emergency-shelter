/**
 * Entry Page Audit — alpha.gov.bb
 *
 * Interactive React checklist for reviewing entry and start pages on
 * alpha.gov.bb (GovTech Barbados). Built to the entry-page-audit skill
 * specification. Pre-populated with an audit of the "Find an emergency
 * shelter" start page as of May 27th, 2026.
 *
 * To use in a fresh React project:
 *   1. Drop this file in any React app (Vite, Next.js, CRA — anything).
 *   2. Import and render: <EntryPageAudit />.
 *   3. Clear the prefilled statuses/notes if you want a blank audit
 *      (see INITIAL_STATUSES and INITIAL_NOTES below).
 *
 * No external CSS — all styles inline so it runs anywhere with React 16.8+.
 */

import React, { useState, useMemo } from "react";

const SECTIONS = [
  {
    id: "a",
    title: "A. Design System & Brand",
    color: "#0D2B5E",
    checks: [
      {
        id: "a1",
        text: "Coat of arms is present in the header",
        note: "The Barbados coat of arms should appear in the site header on every page.",
      },
      {
        id: "a2",
        text: "Coat of arms is correctly sized and not distorted",
        note: "Must not be stretched, cropped, or replaced with a logo variant.",
      },
      {
        id: "a3",
        text: "Page uses the Barbados Design System components (buttons, typography, spacing)",
        note: "Refer to the GovTech Barbados Design System on GitHub/Storybook.",
      },
      {
        id: "a4",
        text: "Typography matches the design system — no rogue font families",
        note: "Do not use system fonts or fonts not defined in the design system.",
      },
      {
        id: "a5",
        text: "Colour palette is consistent with the design system",
        note: "Buttons, links, and text colours must match approved tokens.",
      },
      {
        id: "a6",
        text: "Primary action button uses the correct design system button style",
        note: "The Start button or equivalent must use the primary button variant.",
      },
      {
        id: "a7",
        text: "No custom styles override or break design system components",
        note: "Inspect for inline styles or class overrides that contradict design system rules.",
      },
    ],
  },
  {
    id: "b",
    title: "B. Content Clarity",
    color: "#1F7A4D",
    checks: [
      {
        id: "b1",
        text: "The purpose of the page is clear within the first mobile screen",
        note: "A user should understand what the service lets them do without scrolling.",
      },
      {
        id: "b2",
        text: "Service mode is explicit: online, in person, or hybrid",
        note: "If partly online, it must be clear which steps happen online and which require attendance.",
      },
      {
        id: "b3",
        text: "Key timing rules or deadlines are visible as short standalone lines near the top",
        note: "Deadlines must not be buried inside paragraphs.",
      },
      {
        id: "b4",
        text: "Users can quickly self-identify — who the service is for is clear early",
        note: "Key eligibility conditions are surfaced without requiring a scroll.",
      },
      {
        id: "b5",
        text: "Plain language is used — no jargon, legalese, or overly formal phrasing",
        note: "Standard 4 of the Digital Service Standards: use simple and relatable language.",
      },
      {
        id: "b6",
        text: "Content is written for scanning: short paragraphs, bullets, descriptive headings",
        note: "No single idea buried inside a long paragraph.",
      },
      {
        id: "b7",
        text: "The page does not contain document lists, location directories, or detailed exceptions",
        note: "These belong in Guidance pages, not on entry or start pages.",
      },
    ],
  },
  {
    id: "c",
    title: "C. Page Structure",
    color: "#6B4FA0",
    checks: [
      {
        id: "c1",
        text: "Entry page is short and routing-focused (does not duplicate the start page)",
        note: "If no routing value is provided (choosing between paths/types), the entry page may be unnecessary.",
      },
      {
        id: "c2",
        text: "Start page contains: timing, eligibility, service mode, what's needed, cost (if any), next step",
        note: "These are the essentials. All should be on the start page.",
      },
      {
        id: "c3",
        text: "Detailed guidance content is separated out onto guidance pages",
        note: "Start = essentials. Guidance = preparation and detail.",
      },
      {
        id: "c4",
        text: "No accordions are used on the start page",
        note: "Accordions hide key information. This is a hard rule for start pages.",
      },
      {
        id: "c5",
        text: "If accordions are used on guidance pages, they are accessible (keyboard navigable, screen reader friendly)",
        note: "Only use accordions for supporting or conditional detail — never for critical information.",
      },
      {
        id: "c6",
        text: "Service journey structure follows the pattern: Entry → Start → Guidance (optional) → Service",
        note: "Use the simplest structure that keeps the service clear.",
      },
    ],
  },
  {
    id: "d",
    title: "D. Primary Action (CTA)",
    color: "#C0392B",
    checks: [
      {
        id: "d1",
        text: "There is one clear primary action (Start now / Start online / equivalent)",
        note: "No competing start-style buttons that suggest different or duplicate next steps.",
      },
      {
        id: "d2",
        text: "The primary action appears near the top of the start page",
        note: "Users should not need to scroll to find the start button.",
      },
      {
        id: "d3",
        text: "If repeated at the bottom, the button leads to the same next step",
        note: "Repeating the same CTA top and bottom is acceptable — different CTAs are not.",
      },
      {
        id: "d4",
        text: "No CTA duplication across pages — users do not click start-style buttons on multiple pages before the form",
        note: "Pattern to avoid: 'Register now' → 'Start now' before the form.",
      },
      {
        id: "d5",
        text: "CTA label uses a verb users recognise (e.g. Start now, Apply online, Register)",
        note: "Avoid vague labels like 'Continue' or 'Proceed' as the primary start action.",
      },
    ],
  },
  {
    id: "e",
    title: "E. Mobile Readability",
    color: "#D97706",
    checks: [
      {
        id: "e1",
        text: "Critical information appears within the first 1–2 mobile screens (375×812px baseline)",
        note: "One scroll = one full mobile screen (~812px tall). Critical info = what it is, service mode, timing, the CTA.",
      },
      {
        id: "e2",
        text: "Paragraphs are short (around four lines or fewer on mobile)",
        note: "Each paragraph communicates one idea only.",
      },
      {
        id: "e3",
        text: "Page passes the mobile scan test: a short skim answers what this is, whether it applies to me, and what to do next",
        note: "Test this yourself on a real mobile device or at 375px viewport width.",
      },
      {
        id: "e4",
        text: "Touch targets (buttons, links) are large enough and well-spaced",
        note: "Minimum 44×44px touch target area, per accessibility best practice.",
      },
    ],
  },
  {
    id: "f",
    title: "F. Accessibility & Inclusion",
    color: "#2A8E96",
    checks: [
      {
        id: "f1",
        text: "Page is accessible to users with disabilities (keyboard navigable, screen reader compatible)",
        note: "Standard 3 of the Digital Service Standards: ensure everyone can use the service.",
      },
      {
        id: "f2",
        text: "Images have meaningful alt text (or are marked decorative where appropriate)",
        note: "This includes the coat of arms — provide descriptive alt text.",
      },
      {
        id: "f3",
        text: "Colour contrast meets WCAG AA minimum (4.5:1 for body text, 3:1 for large text)",
        note: "Use a contrast checker tool to verify.",
      },
      {
        id: "f4",
        text: "Page does not rely solely on colour to convey information",
        note: "Use icons, labels, or text in addition to colour.",
      },
      {
        id: "f5",
        text: "Language is plain and accessible to users with varying literacy levels",
        note: "Barbados Digital Service Standard 4: use simple and relatable language.",
      },
      {
        id: "f6",
        text: "Page requires as little data as possible to load",
        note: "Standard 3: services should be accessible even with limited internet connectivity.",
      },
    ],
  },
  {
    id: "g",
    title: "G. Digital Service Standards Alignment",
    color: "#B7861A",
    checks: [
      {
        id: "g1",
        text: "The service meets a real user need (not just a policy or process need)",
        note: "Standard 1: the service should have been shaped by user research.",
      },
      {
        id: "g2",
        text: "The service works the first time — users can complete it without help",
        note: "Standard 5: simple, intuitive, reliable from start to finish.",
      },
      {
        id: "g3",
        text: "Users know what will happen after they submit (confirmation, next steps)",
        note: "'What happens next' should be clearly communicated before and after the action.",
      },
      {
        id: "g4",
        text: "The page is consistent in facts with the form and any guidance pages (eligibility, fees, timelines)",
        note: "Entry page + start page + form must contain the same facts.",
      },
      {
        id: "g5",
        text: "No contradictions exist across the service journey (especially edge cases)",
        note: "Run an end-to-end read-through: entry → start → form.",
      },
      {
        id: "g6",
        text: "The Barbados Design System has been used to inform the UI",
        note: "Standard 3: the design system promotes accessibility and consistent experience.",
      },
    ],
  },
];

// Pre-populated audit of the Find an emergency shelter start page (May 27th, 2026).
// Set to {} for a blank audit.
const INITIAL_STATUSES = {
  // A. Design System & Brand
  a1: "pass",
  a2: "pass",
  a3: "pass",
  a4: "pass",
  a5: "pass",
  a6: "fail",
  a7: "pass",
  // B. Content Clarity
  b1: "pass",
  b2: "fail",
  b3: "fail",
  b4: "na",
  b5: "pass",
  b6: "pass",
  b7: "fail",
  // C. Page Structure
  c1: "na",
  c2: "fail",
  c3: "fail",
  c4: "fail",
  c5: "pass",
  c6: "fail",
  // D. Primary Action
  d1: "pass",
  d2: "fail",
  d3: "na",
  d4: "pass",
  d5: "pass",
  // E. Mobile Readability
  e1: "fail",
  e2: "pass",
  e3: "fail",
  e4: "pass",
  // F. Accessibility & Inclusion
  f1: "pass",
  f2: "pass",
  f3: "pass",
  f4: "pass",
  f5: "pass",
  f6: "fail",
  // G. Digital Service Standards
  g1: "pass",
  g2: "pass",
  g3: "fail",
  g4: "pass",
  g5: "pass",
  g6: "pass",
};

const INITIAL_NOTES = {
  a6: "The 'Find a shelter' CTA uses a custom .btn-start class (solid green with arrow), not the design system's .govbb-btn primary variant (teal). FIX: either swap to .govbb-btn, or upstream the start-style green button into the design system as a new variant.",
  b2: "Service mode isn't stated upfront. Users could wonder: is this an online booking? FIX: add a one-liner under the lede — 'Search online. Shelters are visited in person once activated.'",
  b3: "The activation rule ('Shelters only open when…activates them.') sits in 'What to know before you go', several scrolls down. Hurricane-season dates (1 Jun – 30 Nov) don't appear on the start page at all. FIX: surface both as a standalone line near the top, e.g. an inset notice between lede and CTA.",
  b7: "The Need-to-know accordion contains a directory of 14 accessible shelters by name and 9 phone numbers. Directories belong on guidance pages, not the start page. FIX: move the accessible-shelter list into the find page as a filter result; keep the phone directory on a separate guidance page.",
  c2: "Service mode, cost ('free'), and what-you-need (Go Bag) aren't on the page surface — they're hidden inside the accordion. FIX: add a short 'What you'll need' section with the Go Bag essentials inline, above the CTA.",
  c3: "Detailed guidance (Go Bag, rules, protocol, accessible shelters, phone numbers) lives in an accordion on the start page rather than on a separate guidance page. FIX: create guidance.html and move sub-accordion content out; replace accordion with two or three direct links.",
  c4: "Hard rule violation — accordions on the start page hide key information. Acknowledged: requested by the user. FIX: split the accordion out to guidance.html.",
  c6: "Journey is Start → Service. Should be Start → Guidance → Service. The guidance step is collapsed into the start page accordion. FIX: introduce guidance.html with linked sub-sections (#go-bag, #rules, etc.) so cross-links from anywhere land on a real page.",
  d2: "On mobile (375×812), the 'Find a shelter' CTA falls below: chrome, breadcrumb, H1, last-updated, HR, lede, the 4-row Emergency phone numbers panel, 'Use this service to' bullets, and 'What to know before you go' bullets — roughly the third scroll. FIX: hoist the CTA above the Emergency phones panel, or above 'Use this service to'.",
  e1: "Direct consequence of D2 — the CTA, the primary action, isn't in the first 1–2 mobile screens. FIX: same as D2.",
  e3: "Mobile scan test: 'what this is' = yes (lede), 'whether it applies to me' = implicit (assumed everyone in Barbados), 'what to do next' = no (CTA is far down). FIX: move CTA up.",
  f6: "dist/assets/images/govbb-creast.svg is 564KB and rendered at 24×24 in the official banner. That's ~24,000× larger than necessary. FIX: optimise with SVGO or replace with a small PNG/inline SVG at the icon size.",
  g3: "After a user finds a shelter on the find page, there's no address, no map link, and no directions. The user knows the shelter name but not where to go. FIX: add a Google Maps search link on each shelter card using the shelter name + parish + 'Barbados' as the query string.",
};

const STATUS_STYLES = {
  pass: { bg: "#E6F4EA", border: "#1F7A4D", text: "#1F7A4D" },
  fail: { bg: "#FCE7E5", border: "#C0392B", text: "#C0392B" },
  na: { bg: "#EEEEEE", border: "#888888", text: "#444444" },
};

function StatusButton({ active, onClick, label, status }) {
  const baseStyle = {
    padding: "6px 14px",
    fontSize: "0.85rem",
    fontWeight: 600,
    borderRadius: 4,
    border: "2px solid",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all .15s",
  };
  const s = STATUS_STYLES[status];
  const style = active
    ? {
        ...baseStyle,
        background: s.bg,
        borderColor: s.border,
        color: s.text,
      }
    : {
        ...baseStyle,
        background: "#fff",
        borderColor: "#cccccc",
        color: "#666666",
      };
  return (
    <button type="button" style={style} onClick={onClick} aria-pressed={active}>
      {label}
    </button>
  );
}

function CheckRow({ check, status, note, onStatus, onNote, alt }) {
  const rowBg =
    status === "pass"
      ? "#F3F9F5"
      : status === "fail"
      ? "#FEF1F0"
      : alt
      ? "#FAFAFB"
      : "#FFFFFF";
  return (
    <div
      style={{
        padding: "14px 18px",
        background: rowBg,
        borderBottom: "1px solid #EEE",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1 1 320px", minWidth: 260 }}>
          <div style={{ fontWeight: 600, color: "#222", fontSize: "0.95rem" }}>
            {check.text}
          </div>
          <div
            style={{
              fontStyle: "italic",
              color: "#666",
              fontSize: "0.82rem",
              marginTop: 4,
            }}
          >
            {check.note}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <StatusButton
            label="Pass"
            status="pass"
            active={status === "pass"}
            onClick={() => onStatus(status === "pass" ? null : "pass")}
          />
          <StatusButton
            label="Fail"
            status="fail"
            active={status === "fail"}
            onClick={() => onStatus(status === "fail" ? null : "fail")}
          />
          <StatusButton
            label="N/A"
            status="na"
            active={status === "na"}
            onClick={() => onStatus(status === "na" ? null : "na")}
          />
        </div>
      </div>
      {status === "fail" && (
        <textarea
          value={note || ""}
          onChange={(e) => onNote(e.target.value)}
          placeholder="What's the issue, and what's the recommended fix?"
          rows={3}
          style={{
            marginTop: 10,
            width: "100%",
            padding: "8px 10px",
            border: "2px solid #C0392B33",
            borderRadius: 4,
            fontFamily: "inherit",
            fontSize: "0.9rem",
            color: "#222",
            resize: "vertical",
          }}
        />
      )}
    </div>
  );
}

function Section({ section, statuses, notes, setStatus, setNote, expanded, toggle }) {
  const counts = useMemo(() => {
    let pass = 0,
      fail = 0;
    section.checks.forEach((c) => {
      if (statuses[c.id] === "pass") pass += 1;
      else if (statuses[c.id] === "fail") fail += 1;
    });
    return { pass, fail };
  }, [section, statuses]);

  const isOpen = expanded !== false;

  return (
    <section
      style={{
        background: "#fff",
        borderRadius: 6,
        borderLeft: `6px solid ${section.color}`,
        marginBottom: 14,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={toggle}
        style={{
          width: "100%",
          textAlign: "left",
          padding: "14px 20px",
          background: "transparent",
          border: 0,
          cursor: "pointer",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#222" }}>
          {isOpen ? "▾" : "▸"} {section.title}
        </div>
        <div style={{ display: "flex", gap: 10, fontSize: "0.85rem" }}>
          <span style={{ color: "#1F7A4D", fontWeight: 600 }}>
            ✓ {counts.pass}
          </span>
          <span style={{ color: "#C0392B", fontWeight: 600 }}>
            ✗ {counts.fail}
          </span>
        </div>
      </button>
      {isOpen && (
        <div>
          {section.checks.map((c, i) => (
            <CheckRow
              key={c.id}
              check={c}
              status={statuses[c.id]}
              note={notes[c.id]}
              onStatus={(s) => setStatus(c.id, s)}
              onNote={(n) => setNote(c.id, n)}
              alt={i % 2 === 1}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function EntryPageAudit() {
  const [serviceName, setServiceName] = useState(
    "Find an emergency shelter (alpha)"
  );
  const [auditorName, setAuditorName] = useState("");
  const [statuses, setStatuses] = useState(INITIAL_STATUSES);
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [expanded, setExpanded] = useState({});

  function setStatus(id, value) {
    setStatuses((s) => ({ ...s, [id]: value }));
  }
  function setNote(id, value) {
    setNotes((n) => ({ ...n, [id]: value }));
  }
  function toggleSection(id) {
    setExpanded((e) => ({ ...e, [id]: e[id] === false ? true : false }));
  }
  function reset() {
    setStatuses({});
    setNotes({});
  }

  const totals = useMemo(() => {
    let pass = 0,
      fail = 0,
      na = 0,
      checked = 0;
    Object.values(statuses).forEach((v) => {
      if (v === "pass") {
        pass += 1;
        checked += 1;
      } else if (v === "fail") {
        fail += 1;
        checked += 1;
      } else if (v === "na") {
        na += 1;
        checked += 1;
      }
    });
    const totalChecks = SECTIONS.reduce((n, s) => n + s.checks.length, 0);
    const denom = checked - na;
    const passRate = denom > 0 ? Math.round((pass / denom) * 100) : null;
    return { pass, fail, na, checked, totalChecks, passRate };
  }, [statuses]);

  const failingByChecklist = useMemo(() => {
    const out = [];
    SECTIONS.forEach((sec) => {
      sec.checks.forEach((c) => {
        if (statuses[c.id] === "fail") {
          out.push({
            sectionTitle: sec.title,
            color: sec.color,
            check: c.text,
            note: notes[c.id] || "",
          });
        }
      });
    });
    return out;
  }, [statuses, notes]);

  return (
    <div
      style={{
        fontFamily:
          "Figtree, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        background: "#F4F4F6",
        color: "#222",
        minHeight: "100vh",
        padding: "0 0 60px",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#0D2B5E",
          color: "#fff",
          padding: "26px 24px 20px",
        }}
      >
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span
              role="img"
              aria-label="Barbados coat of arms"
              style={{
                width: 44,
                height: 44,
                background: "#F4C842",
                color: "#0D2B5E",
                borderRadius: 8,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 800,
              }}
            >
              🇧🇧
            </span>
            <div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, lineHeight: 1.1 }}>
                Entry Page Audit
              </div>
              <div style={{ fontSize: "0.95rem", opacity: 0.8, marginTop: 4 }}>
                Reviewing alpha.gov.bb entry and start pages against the Barbados
                Digital Service Standards.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metadata sub-header */}
      <div
        style={{
          background: "#08214A",
          color: "#fff",
          padding: "14px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <label style={{ fontSize: "0.85rem" }}>
            <div style={{ marginBottom: 4, fontWeight: 600 }}>
              Service name / URL
            </div>
            <input
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 10px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 4,
                color: "#fff",
                fontFamily: "inherit",
                fontSize: "0.9rem",
              }}
            />
          </label>
          <label style={{ fontSize: "0.85rem" }}>
            <div style={{ marginBottom: 4, fontWeight: 600 }}>Reviewer</div>
            <input
              value={auditorName}
              onChange={(e) => setAuditorName(e.target.value)}
              placeholder="Your name"
              style={{
                width: "100%",
                padding: "8px 10px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 4,
                color: "#fff",
                fontFamily: "inherit",
                fontSize: "0.9rem",
              }}
            />
          </label>
        </div>
      </div>

      {/* Score bar */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #E0E0E5",
          padding: "12px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: 22, fontSize: "0.9rem" }}>
            <span>
              <strong style={{ color: "#1F7A4D" }}>Pass:</strong> {totals.pass}
            </span>
            <span>
              <strong style={{ color: "#C0392B" }}>Fail:</strong> {totals.fail}
            </span>
            <span>
              <strong style={{ color: "#666" }}>N/A:</strong> {totals.na}
            </span>
            <span style={{ color: "#666" }}>
              Reviewed: {totals.checked} / {totals.totalChecks}
            </span>
            {totals.passRate !== null && (
              <span>
                <strong>Pass rate:</strong> {totals.passRate}%
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "7px 14px",
              fontSize: "0.85rem",
              background: "#fff",
              border: "1px solid #C0392B",
              color: "#C0392B",
              borderRadius: 4,
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: 600,
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Sections */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "20px 18px" }}>
        {SECTIONS.map((sec) => (
          <Section
            key={sec.id}
            section={sec}
            statuses={statuses}
            notes={notes}
            setStatus={setStatus}
            setNote={setNote}
            expanded={expanded[sec.id]}
            toggle={() => toggleSection(sec.id)}
          />
        ))}

        {/* Failing checks summary */}
        {failingByChecklist.length > 0 && (
          <section
            style={{
              marginTop: 32,
              background: "#0D2B5E",
              color: "#fff",
              padding: "22px 24px",
              borderRadius: 6,
            }}
          >
            <div
              style={{
                fontSize: "1.15rem",
                fontWeight: 800,
                marginBottom: 12,
              }}
            >
              Failing checks ({failingByChecklist.length})
            </div>
            <ol style={{ paddingLeft: 22, margin: 0 }}>
              {failingByChecklist.map((f, i) => (
                <li
                  key={i}
                  style={{
                    marginBottom: 12,
                    paddingBottom: 12,
                    borderBottom:
                      i < failingByChecklist.length - 1
                        ? "1px solid rgba(255,255,255,0.15)"
                        : 0,
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.78rem",
                      color: "#F4C842",
                      fontWeight: 600,
                      marginBottom: 3,
                      textTransform: "uppercase",
                      letterSpacing: 0.3,
                    }}
                  >
                    {f.sectionTitle}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                    {f.check}
                  </div>
                  {f.note && (
                    <div
                      style={{
                        fontSize: "0.88rem",
                        marginTop: 4,
                        opacity: 0.88,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {f.note}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
}
