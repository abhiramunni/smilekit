# SmileKit — Your Dental Care Companion

Tap any tooth to log how it feels, time your two-minute brush, never miss a checkup, and know what dental work should cost in India — before you sit in the chair.

**Live:** https://abhiramunni.github.io/smilekit/

## What it does

- **Interactive 32-tooth chart** — all 32 teeth, numbered the way dentists number them (FDI system). Tap any tooth to mark it healthy, watch, hurts, treated or missing, and add a dated note ("cold water zings on this side since last week"). A "needs attention" list keeps the flagged teeth in one place.
- **Today's brushing** — morning brush, night brush and floss ticks, plus a **2-minute brush timer** that walks you through all four quarters of your mouth (30 seconds each) with a progress ring. Finishing the timer ticks off your next brush automatically. Your brushing streak is counted from real consecutive days.
- **Two countdowns that matter** — next 6-month dental checkup (from your last visit date) and toothbrush replacement (every 3 months). Both are editable.
- **Visit ledger** — log every dental visit with treatment, clinic and cost in ₹, with a running total. Handy at a new clinic, and handy when a bill looks wrong.
- **Treatment cost estimator** — indicative Indian price ranges for 8 common treatments (cleaning, filling, root canal, extraction, crown, braces/aligners, whitening, implant), adjusted for metro vs smaller city and number of teeth, with a plain-words note on what changes the price.
- **Know the signs** — four situations that cannot wait (throbbing pain + swelling, knocked-out tooth, bleeding gums, lingering cold sensitivity) with what to do.
- **Six plain-language guides** — brushing, flossing, fluoride, staining foods, kids' teeth, braces care.
- **Your data stays yours** — everything is stored in the browser's localStorage only; nothing is uploaded. Copy a plain-text summary to show your dentist, remove the sample entries, or erase everything.

## How to use it

1. Open the live link. Tap through the 3-step tour (or skip it).
2. Tap a tooth on the chart to log how it feels.
3. Use the brush timer morning and night — it keeps your streak.
4. Set your last checkup date and brush start date so the countdowns are real.
5. Before any treatment, check the cost estimator so you can judge the quote.

## Prices — please read

Treatment ranges are **indicative**, gathered from typical Indian clinic price lists. Real prices vary by city, clinic and complexity. Always ask for a written estimate before treatment starts.

## Health note

SmileKit is a personal tracker, not a medical device. It does not diagnose anything. For pain, swelling, bleeding that will not stop, or a knocked-out tooth, see a dentist promptly.

## Tech

Single self-contained `index.html` (no backend, no signup, no build step) plus two photos. Works offline after first load except for the Google Fonts. Data: localStorage only.

## QA

`qa-test.js` — 96 headless jsdom assertions, `node --check` clean, zero uncaught JS errors (run 27 Nov 2026). Verified live in the browser after publishing: intro hides, chart renders all 32 teeth, seeded teeth 46/11/28 show, checkup shows overdue, estimator returns hand-checked ranges.
