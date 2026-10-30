// Behaviour checks that screenshots cannot show: the Ecosystem tab bar (click, sliding highlight, keyboard, phone auto-scroll), the one-off
// entrances reaching their end state, and the reduced-motion version of the page (nothing hidden, nothing pinned).
//
//   npm run qa:serve   (another terminal)
//   npm run qa:interact
//
// URL: QA_URL (default http://localhost:3002). Exits with 1 when a check fails.
import { chromium } from "playwright-core";

const BASE = process.env.QA_URL ?? "http://localhost:3002";
let fails = 0;
const ok = (name, pass, detail = "") => {
  if (!pass) fails++;
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? "  (" + detail + ")" : ""}`);
};
const near = (a, b, tolerance = 1.5) => Math.abs(a - b) <= tolerance;

const ECO = 'section[aria-label="The ecosystem behind LPS 360"]';

/** Scrolls to a page position with the mouse wheel (window.scrollTo fights the smooth scrolling). */
async function scrollToY(page, y) {
  for (let i = 0; i < 80; i++) {
    const now = await page.evaluate(() => Math.round(scrollY));
    const delta = y - now;
    if (Math.abs(delta) <= 2) break;
    await page.mouse.wheel(0, Math.max(-900, Math.min(900, delta)));
    await page.waitForTimeout(260);
  }
  await page.waitForTimeout(1800);
}

/** The page position where the section's pinned scene starts (or the section's own top when it is not pinned). */
const startOf = (page, selector) =>
  page.evaluate((s) => {
    const el = document.querySelector(s);
    const box = (el.closest(".pin-spacer") ?? el).getBoundingClientRect();
    return Math.round(box.top + scrollY);
  }, selector);

const browser = await chromium.launch({ channel: "chrome" });

// ---------------------------------------------------------------- 1. Ecosystem tabs on a desktop screen
{
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 1200 } })).newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
  page.on("console", (m) => ["error", "warning"].includes(m.type()) && errors.push(m.text().slice(0, 160)));
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.mouse.move(5, 600);
  await page.mouse.wheel(0, 40);
  await page.waitForTimeout(1500);
  await scrollToY(page, await startOf(page, ECO));

  const read = () =>
    page.evaluate((s) => {
      const sec = document.querySelector(s);
      const tabs = [...sec.querySelectorAll("[role=tab]")];
      const indicator = sec.querySelector("[role=tablist] > span");
      const rect = (el) => {
        const b = el.getBoundingClientRect();
        return { x: b.left, w: b.width, h: b.height };
      };
      return {
        tabs: tabs.map(rect),
        indicator: rect(indicator),
        selected: tabs.findIndex((t) => t.getAttribute("aria-selected") === "true"),
        tabindex: tabs.map((t) => t.tabIndex).join(),
        panelLabel: sec.querySelector("[role=tabpanel]").getAttribute("aria-labelledby"),
        tabIds: tabs.map((t) => t.id),
        title: sec.querySelector("[role=tabpanel] h3")?.textContent,
        textsVisible: [...sec.querySelectorAll("[data-eco-text],[data-eco-head],[data-eco-bar]")].every(
          (e) => +getComputedStyle(e).opacity === 1,
        ),
        clip: getComputedStyle(sec.querySelector("[data-eco-clip]")).clipPath,
      };
    }, ECO);

  const first = await read();
  ok(
    "tabs: five tabs, the first selected, roving tabindex, panel labelled by the selected tab",
    first.tabs.length === 5 && first.selected === 0 && first.tabindex === "0,-1,-1,-1,-1" && first.panelLabel === first.tabIds[0],
    JSON.stringify({ n: first.tabs.length, sel: first.selected, ti: first.tabindex }),
  );
  ok(
    "tabs: the entrance has finished (everything visible, photo fully open)",
    first.textsVisible && /inset\(0/.test(first.clip),
    first.clip,
  );
  ok(
    "tabs: the highlight sits exactly on the active tab",
    near(first.indicator.x, first.tabs[0].x, 0.6) &&
      near(first.indicator.w, first.tabs[0].w, 0.6) &&
      near(first.indicator.h, first.tabs[0].h, 0.6),
    JSON.stringify(first.indicator),
  );

  const positions = [];
  await page.locator(`${ECO} [role=tab]`).nth(2).click();
  for (let i = 0; i < 7; i++) {
    positions.push(
      await page.evaluate((s) => Math.round(document.querySelector(`${s} [role=tablist] > span`).getBoundingClientRect().left), ECO),
    );
    await page.waitForTimeout(70);
  }
  await page.waitForTimeout(1600);
  const third = await read();
  ok(
    "tabs: clicking the third tab slides the highlight (several positions on the way) and ends on it",
    new Set(positions).size >= 3 && near(third.indicator.x, third.tabs[2].x, 0.6) && near(third.indicator.w, third.tabs[2].w, 0.6),
    positions.join(" "),
  );
  ok(
    "tabs: the panel follows (label, content visible again after the change animation)",
    third.selected === 2 && third.panelLabel === third.tabIds[2] && third.textsVisible && /inset\(0/.test(third.clip),
  );

  await page.locator(`${ECO} [role=tab]`).nth(2).focus();
  const selected = async () => (await read()).selected;
  const keys = [];
  for (const key of ["ArrowRight", "End", "ArrowRight", "Home", "ArrowLeft"]) {
    await page.keyboard.press(key);
    await page.waitForTimeout(700);
    keys.push(await selected());
  }
  ok(
    "tabs: keyboard (ArrowRight 3>4, End 5, ArrowRight wraps to 1, Home 1, ArrowLeft wraps to 5)",
    keys.join() === "3,4,0,0,4",
    keys.join(),
  );
  ok("tabs: no console errors or warnings", errors.length === 0, JSON.stringify(errors));
  await page.close();
}

// ---------------------------------------------------------------- 2. Ecosystem tab bar on a phone and a tablet (the bar swipes)
for (const [width, height, label] of [
  [390, 844, "phone 390"],
  [768, 1024, "tablet 768"],
]) {
  const page = await (await browser.newContext({ viewport: { width, height }, hasTouch: true })).newPage();
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.mouse.move(100, 300);
  await page.mouse.wheel(0, 40);
  await page.waitForTimeout(1200);
  await scrollToY(page, (await startOf(page, ECO)) + 250);

  const state = () =>
    page.evaluate((s) => {
      const list = document.querySelector(`${s} [role=tablist]`);
      const box = list.getBoundingClientRect();
      const tabs = [...list.querySelectorAll("[role=tab]")];
      const selected = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
      const indicator = list.querySelector(":scope > span").getBoundingClientRect();
      const tab = tabs[selected].getBoundingClientRect();
      const next = tabs[selected + 1]?.getBoundingClientRect();
      return {
        selected,
        activeInside: tab.left >= box.left - 1 && tab.right <= box.right + 1,
        highlightOnActive: Math.abs(indicator.left - tab.left) < 1 && Math.abs(indicator.width - tab.width) < 1,
        nextShare: next ? Math.max(0, Math.min(next.right, box.right) - Math.max(next.left, box.left)) / next.width : 1,
      };
    }, ECO);

  let bad = 0;
  for (const index of [1, 2, 3, 4, 0, 2]) {
    await page.locator(`${ECO} [role=tab]`).nth(index).click({ force: true });
    await page.waitForTimeout(900);
    const s = await state();
    // the chosen tab is fully in view, the highlight is on it, and (except for the last tab) a part of the next tab shows
    if (!(s.selected === index && s.activeInside && s.highlightOnActive && (index === 4 || s.nextShare > 0.12))) {
      bad++;
      console.log("   ", label, "tab", index + 1, JSON.stringify(s));
    }
  }
  ok(`${label}: choosing a tab slides it in, keeps the highlight on it and reveals the next tab`, bad === 0, `${bad} wrong`);
  await page.close();
}

// ---------------------------------------------------------------- 3. Entrances reach their end state (desktop)
{
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 993 } })).newPage();
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.mouse.move(5, 500);
  await page.mouse.wheel(0, 40);
  await page.waitForTimeout(1000);
  const sections = {
    Campus: 'section[aria-label="A campus built around possibility"]',
    News: 'section[aria-label^="What"]',
    CTA: 'section[aria-label="Admissions"]',
  };
  for (const [name, selector] of Object.entries(sections)) {
    const exists = await page.evaluate((s) => !!document.querySelector(s), selector);
    if (!exists) {
      console.log(`SKIP  ${name}: selector ${selector} not found`);
      continue;
    }
    // Campus: its media box opens BY THE SCROLL (scrubbed, 2026-10-28), and the label comes in at the end, when the box has risen to 40% of
    // the screen: so for Campus "scrolled to it" means the media box is in the upper part of the screen (the checks of that opening follow below).
    const target = name === "Campus" ? (await startOf(page, "[data-campus-frame]")) - 250 : (await startOf(page, selector)) - 150;
    await scrollToY(page, target);
    await page.waitForTimeout(1200);
    const hidden = await page.evaluate(
      (s) =>
        [...document.querySelector(s).querySelectorAll("[class]")].filter(
          (e) => +getComputedStyle(e).opacity === 0 && e.offsetWidth > 0 && !e.hasAttribute("aria-hidden"),
        ).length,
      selector,
    );
    ok(`${name}: after scrolling to it, nothing is left invisible`, hidden === 0, `${hidden} invisible elements`);
  }

  // The Campus media box opens with the scroll, in both directions: closed (a smaller rounded window, label hidden) while it is still low on the
  // screen, completely open and showing its label once it is high, and closed again when scrolling back up.
  if (await page.evaluate(() => !!document.querySelector("[data-campus-frame]"))) {
    const frameTop = await startOf(page, "[data-campus-frame]");
    const vh = 993;
    const read = () =>
      page.evaluate(() => {
        const frame = document.querySelector("[data-campus-frame]");
        const tag = document.querySelector("[data-campus-tag]");
        const numbers = (getComputedStyle(frame).clipPath.match(/[\d.]+/g) ?? []).map(Number);
        return { open: numbers.every((n) => n < 0.5), tag: +getComputedStyle(tag).opacity };
      });
    await scrollToY(page, frameTop - 0.88 * vh); // the box's top 88% down the screen: just starting to open
    const low = await read();
    await scrollToY(page, frameTop - 250); // the box's top about 25% down: finished
    const high = await read();
    await scrollToY(page, frameTop - 0.88 * vh);
    const back = await read();
    ok(
      "Campus media: closed while low on the screen, completely open (label shown) once high, closed again scrolling back (scrubbed by the scroll)",
      !low.open && low.tag < 0.5 && high.open && high.tag > 0.95 && !back.open && back.tag < 0.5,
      JSON.stringify({ low, high, back }),
    );
  }
  await page.close();
}

// ---------------------------------------------------------------- 4. Reduced motion: everything shown, nothing pinned
{
  const page = await (await browser.newContext({ viewport: { width: 1920, height: 993 }, reducedMotion: "reduce" })).newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 160)));
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForTimeout(3500);
  const info = await page.evaluate(() => {
    const animated = [
      ...document.querySelectorAll(
        "[data-news-intro],[data-news-card],[data-eco-head],[data-eco-text],[data-fw-head],[data-fw-pill],[data-campus-head],[data-campus-frame],[data-cta-item],[data-alumni-head],[data-alumni-card],[data-head],[data-col],[data-char],[data-photo]",
      ),
    ];
    return {
      pinned: document.querySelectorAll(".pin-spacer").length,
      count: animated.length,
      // the texts of the tabs that are not chosen are inert and invisible on purpose (see EcosystemSection): not counted
      hidden: animated.filter(
        (e) => !e.closest("[inert]") && (+getComputedStyle(e).opacity < 1 || getComputedStyle(e).visibility === "hidden"),
      ).length,
      overflow: document.documentElement.scrollWidth - innerWidth,
    };
  });
  ok(
    "reduced motion: nothing pinned, every animated element visible, no horizontal overflow",
    info.pinned === 0 && info.hidden === 0 && info.count > 30 && info.overflow <= 0,
    JSON.stringify(info),
  );
  ok("reduced motion: no console errors", errors.length === 0, JSON.stringify(errors));
  await page.close();
}

// ---------------------------------------------------------------- 5. Resizing: DevTools device mode, a docked DevTools, a phone's address bar
// Bug found 2026-10-22: resizing in DevTools (touch emulation) left the pinned scenes measured for the OLD size, so the hero showed behind
// later sections. A resized page must lay out exactly like a fresh load at the final size (pin-spacer positions and heights).
{
  const layout = (page) =>
    page.evaluate(() => ({
      h: document.documentElement.scrollHeight,
      spacers: [...document.querySelectorAll(".pin-spacer")].map((s) => [
        Math.round(s.getBoundingClientRect().top + scrollY),
        Math.round(s.offsetHeight),
      ]),
    }));
  const open = async (opts, viewport) => {
    const context = await browser.newContext({ ...opts, viewport });
    const page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "load" });
    // a small wheel turn first: the smooth scrolling (Lenis) fights window.scrollTo until it has been used once
    await page.mouse.move(5, 300);
    await page.mouse.wheel(0, 30);
    await page.waitForTimeout(2500);
    return { context, page };
  };
  const final = { width: 1326, height: 672 };
  const cases = [
    ["mouse", {}, { width: 1920, height: 993 }],
    ["mouse", {}, { width: 1326, height: 792 }],
    ["touch emulation (DevTools device mode)", { hasTouch: true, isMobile: true }, { width: 1920, height: 993 }],
    ["touch emulation (DevTools device mode)", { hasTouch: true, isMobile: true }, { width: 1326, height: 792 }],
  ];
  for (const [mode, opts, from] of cases) {
    const resized = await open(opts, from);
    await resized.page.setViewportSize(final);
    await resized.page.waitForTimeout(2500);
    const fresh = await open(opts, final);
    const a = await layout(resized.page);
    const b = await layout(fresh.page);
    ok(
      `resize ${from.width}x${from.height} -> 1326x672, ${mode}: the pinned scenes are measured again (same as a fresh load)`,
      JSON.stringify(a) === JSON.stringify(b),
      JSON.stringify({ resized: a.spacers, fresh: b.spacers }),
    );
    await resized.context.close();
    await fresh.context.close();
  }

  // the hero must never show behind later sections after such a resize
  {
    const { context, page } = await open({ hasTouch: true, isMobile: true }, { width: 1920, height: 993 });
    await page.setViewportSize(final);
    await page.waitForTimeout(2500);
    const heroEnd = await page.evaluate(() => Math.round(document.querySelector(".pin-spacer").getBoundingClientRect().bottom + scrollY));
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    const seen = [];
    let checked = 0;
    for (let y = heroEnd + 50; y < total - final.height; y += 350) {
      await page.evaluate((to) => window.scrollTo(0, to), y);
      await page.waitForTimeout(250);
      // only count a position the page really reached (a scrollTo that did not land would show the hero for a wrong reason)
      if (Math.abs((await page.evaluate(() => scrollY)) - y) > 5) continue;
      checked++;
      const visible = await page.evaluate(() =>
        [...document.querySelectorAll("[data-slide-image]")].some((img) => {
          const box = img.getBoundingClientRect();
          return box.bottom > 5 && box.top < innerHeight - 5 && box.right > 5 && box.left < innerWidth - 5;
        }),
      );
      if (visible) seen.push(y);
    }
    ok(
      "after a DevTools-style resize the hero never shows once its pin is over",
      seen.length === 0 && checked >= 25,
      seen.length ? "visible at " + seen.slice(0, 4).join(", ") : `${checked} positions checked`,
    );
    await context.close();
  }

  // a phone's address bar (the window height changes WHILE scrolling) must NOT re-measure the pinned scenes; a real resize must
  {
    const { context, page } = await open({ hasTouch: true, isMobile: true }, { width: 390, height: 764 });
    const hero = () => page.evaluate(() => ({ spacer: Math.round(document.querySelector(".pin-spacer").offsetHeight), h: innerHeight }));
    const before = await hero();
    for (let i = 0; i < 4; i++) {
      await page.evaluate(() => window.scrollBy(0, 60));
      await page.waitForTimeout(60);
      await page.setViewportSize({ width: 390, height: 764 + (i % 2 === 0 ? 80 : 0) });
      await page.waitForTimeout(60);
    }
    await page.waitForTimeout(1500);
    const scrolling = await hero();
    ok(
      "phone: the address bar changing the height while scrolling does not re-measure the pinned hero",
      scrolling.spacer === before.spacer,
      `${before.spacer} -> ${scrolling.spacer}`,
    );
    await page.waitForTimeout(1200);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1800);
    const still = await hero();
    ok(
      "phone: the same height change with the page standing still does re-measure it",
      still.spacer !== scrolling.spacer && still.h === 844,
      `${scrolling.spacer} -> ${still.spacer}`,
    );
    await page.evaluate(() => window.scrollBy(0, 40));
    await page.waitForTimeout(60);
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(1800);
    const rotated = await hero();
    ok(
      "phone: rotating (the width changes) re-measures it even while scrolling",
      rotated.h === 390 && rotated.spacer !== still.spacer,
      `${still.spacer} -> ${rotated.spacer}`,
    );
    await context.close();
  }
}

// ---------------------------------------------------------------- 6. The Ecosystem tabs: ALWAYS one row, the highlight ALWAYS exactly on the active tab
// Bugs found 2026-10-22: between 1024 and 1599px the tabs wrapped onto two rows, and on a window shorter than the panel (it is scaled down
// to fit) the highlight was measured in screen pixels and placed in the panel's own, so it came out smaller than its tab and off to one side.
{
  const read = (page) =>
    page.evaluate((s) => {
      const list = document.querySelector(`${s} [role=tablist]`);
      const tabs = [...list.querySelectorAll("[role=tab]")];
      const box = (el) => el.getBoundingClientRect();
      const active = tabs.find((t) => t.getAttribute("aria-selected") === "true");
      const highlight = box(list.querySelector(":scope > span"));
      const tab = box(active);
      return {
        oneRow: new Set(tabs.map((t) => Math.round(box(t).top))).size === 1,
        dx: Math.abs(highlight.left - tab.left),
        dw: Math.abs(highlight.width - tab.width),
        dh: Math.abs(highlight.height - tab.height),
        scrolls: list.scrollWidth > list.clientWidth + 1,
        activeInView: tab.left >= box(list).left - 1 && tab.right <= box(list).right + 1,
      };
    }, ECO);
  const exact = (r) => r.oneRow && r.dx < 1 && r.dw < 1 && r.dh < 1;
  for (const [width, height] of [
    [1920, 993],
    [1600, 900],
    [1500, 760],
    [1366, 672],
    [1100, 700],
    [768, 900],
    [390, 844],
  ]) {
    const page = await (await browser.newContext({ viewport: { width, height } })).newPage();
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.mouse.move(5, 300);
    await page.mouse.wheel(0, 30);
    await page.waitForTimeout(2200);
    await scrollToY(page, await startOf(page, ECO));
    const first = await read(page);
    await page.locator(`${ECO} [role=tab]`).nth(1).click({ force: true });
    await page.waitForTimeout(1200);
    const second = await read(page);
    await page.locator(`${ECO} [role=tab]`).nth(4).click({ force: true });
    await page.waitForTimeout(1200);
    const last = await read(page);
    ok(
      `tabs at ${width}x${height}: one row, highlight exactly on the tab (first, second, last), chosen tab in view${last.scrolls ? " (the bar scrolls)" : ""}`,
      exact(first) && exact(second) && exact(last) && last.activeInView,
      JSON.stringify({ first, second, last }),
    );
    await page.close();
  }

  // resizing with a tab chosen: the highlight follows, still one row
  {
    const page = await (await browser.newContext({ viewport: { width: 1920, height: 993 } })).newPage();
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.mouse.move(5, 300);
    await page.mouse.wheel(0, 30);
    await page.waitForTimeout(2200);
    await scrollToY(page, await startOf(page, ECO));
    await page.locator(`${ECO} [role=tab]`).nth(1).click({ force: true });
    await page.waitForTimeout(1000);
    const results = [];
    for (const [width, height] of [
      [1500, 700],
      [1100, 700],
      [1700, 900],
      [1326, 672],
      [1920, 993],
    ]) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(1800);
      results.push(exact(await read(page)));
    }
    ok(
      "tabs: after resizing through 1500, 1100, 1700, 1326 and 1920px the highlight is still exactly on the tab, in one row",
      results.every(Boolean),
      results.join(),
    );
    await page.close();
  }
}

// ---------------------------------------------------------------- 7. The sideways scenes on a PHONE and a TABLET (owner, 2026-10-22: same scroll effect as desktop)
// Scroll down, the view pans sideways across the panels, and a panel taller than the screen (Journey on a phone) is then scrolled DOWN through.
for (const [label, width, height] of [
  ["phone 390", 390, 844],
  ["tablet 768", 768, 1024],
]) {
  const context = await browser.newContext({ viewport: { width, height }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 140)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text().slice(0, 140)));
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.mouse.move(5, 300);
  await page.mouse.wheel(0, 30);
  await page.waitForTimeout(3500);

  const scenes = () =>
    page.evaluate(() =>
      [...document.querySelectorAll(".pin-spacer")].slice(1).map((spacer) => {
        const stage = spacer.firstElementChild;
        return {
          top: Math.round(spacer.getBoundingClientRect().top + scrollY),
          length: spacer.offsetHeight - stage.offsetHeight,
          stage: stage.offsetHeight,
          panels: stage.querySelectorAll("[data-scene-panel]").length,
        };
      }),
    );
  const found = await scenes();
  // Below 640px wide (or 500px high) the Ecosystem and Alumni scene is an ordinary vertical stack, not pinned (`stackOnPhones`, owner 2026-10-28):
  // there the page has the hero's pin and ONE sideways scene (2 pins); from 640px it has the hero's pin and two scenes (3 pins).
  const pins = width >= 640 && height >= 500 ? 3 : 2;
  ok(
    `${label}: the page has the hero's pin and ${pins - 1} sideways scene${pins === 3 ? "s" : ""} (${pins} pins), each stage exactly one screen high`,
    (await page.evaluate(() => document.querySelectorAll(".pin-spacer").length)) === pins && found.every((x) => x.stage === height),
    JSON.stringify(found),
  );
  if (pins === 2) {
    // the second scene is a plain stack: not inside a pin, Alumni under Ecosystem, nothing wider than the screen
    const stack = await page.evaluate(() => {
      const eco = document.querySelector('section[aria-label="The ecosystem behind LPS 360"]');
      const alumni = document.querySelector('section[aria-label^="Alumni"]');
      const a = eco.getBoundingClientRect();
      const b = alumni.getBoundingClientRect();
      return {
        pinned: Boolean(eco.closest(".pin-spacer") || alumni.closest(".pin-spacer")),
        underneath: b.top + scrollY >= a.bottom + scrollY - 5,
        fits: a.width <= innerWidth + 1 && b.width <= innerWidth + 1,
      };
    });
    ok(
      `${label}: Ecosystem and Alumni are an ordinary stack (not pinned, one under the other, within the screen)`,
      !stack.pinned && stack.underneath && stack.fits,
      JSON.stringify(stack),
    );
  }

  // scene 1 (vision, courage, journey): at its start the Vision panel is centred; the Courage heading is typed at the end of the first pan
  await scrollToY(page, found[0].top + 2);
  const visionCentre = await page.evaluate(() => {
    const box = document.querySelector('section[aria-label="Our vision, mission and values"]').getBoundingClientRect();
    return Math.round(box.left + box.width / 2);
  });
  ok(
    `${label}: scene 1 starts with the Vision panel centred on the screen`,
    Math.abs(visionCentre - width / 2) <= 3,
    `centre ${visionCentre} of ${width}`,
  );

  // the whole scene scrolled through: sideways, then down through the last panel, then the pin ends
  await scrollToY(page, found[0].top + found[0].length);
  const end = await page.evaluate(() => {
    const columns = [...document.querySelectorAll("[data-col]")];
    const last = columns[columns.length - 1].getBoundingClientRect();
    // the Courage heading is shown in full: typewriter variant = every typed character is on; rotate variant = the rotating word is on the page
    const chars = [...document.querySelectorAll("[data-char]")];
    const headingShown = chars.length
      ? chars.every((c) => +c.style.opacity === 1)
      : document.querySelectorAll("[data-rotating-word]").length >= 2;
    return {
      lastBottom: Math.round(last.bottom),
      lastTop: Math.round(last.top),
      headingShown,
      overflow: document.documentElement.scrollWidth - innerWidth,
    };
  });
  ok(
    `${label}: at the end of scene 1 the LAST Journey column is on screen (the view went down through the tall panel), the Courage heading is shown in full`,
    end.lastBottom <= height + 3 && end.lastBottom > height - 140 && end.lastTop < height && end.headingShown,
    JSON.stringify(end),
  );
  ok(`${label}: no horizontal overflow anywhere in the scene`, end.overflow <= 0, String(end.overflow));

  // one pixel past the end the pin is released and the page goes on (the Framework section is next)
  await scrollToY(page, found[0].top + found[0].length + height);
  const after = await page.evaluate(() => {
    const framework = document.querySelector('section[aria-label*="LPS 360"], section[aria-label*="Framework" i]');
    const box = framework ? framework.getBoundingClientRect() : null;
    return {
      frameworkTop: box ? Math.round(box.top) : null,
      hero: [...document.querySelectorAll("[data-slide-image]")].some(
        (i) => i.getBoundingClientRect().bottom > 5 && i.getBoundingClientRect().top < innerHeight,
      ),
    };
  });
  ok(
    `${label}: after the scene the page continues down with the next section, the hero does not show behind it`,
    after.frameworkTop !== null && after.frameworkTop < height && !after.hero,
    JSON.stringify(after),
  );
  ok(`${label}: no console errors in the scenes`, errors.length === 0, JSON.stringify(errors));
  await context.close();
}

// reduced motion on a phone: no pin, no sideways pan: the panels are an ordinary vertical stack with everything shown
{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(BASE + "/", { waitUntil: "load" });
  await page.waitForTimeout(3000);
  const info = await page.evaluate(() => ({
    pinned: document.querySelectorAll(".pin-spacer").length,
    overflow: document.documentElement.scrollWidth - innerWidth,
    hidden: [...document.querySelectorAll("[data-col],[data-char],[data-photo],[data-eco-text],[data-alumni-card]")].filter(
      (e) => +getComputedStyle(e).opacity < 1,
    ).length,
    panelsStacked: (() => {
      const panels = [...document.querySelectorAll("[data-scene-panel]")];
      return panels.every((p, i) => i === 0 || p.getBoundingClientRect().top > panels[i - 1].getBoundingClientRect().top + 50);
    })(),
  }));
  ok(
    "phone with reduced motion: nothing pinned, panels stacked one under the other, everything shown, no overflow",
    info.pinned === 0 && info.panelsStacked && info.hidden === 0 && info.overflow <= 0,
    JSON.stringify(info),
  );
  await context.close();
}

// ---------------------------------------------------------------- 8. The Courage heading: fully visible, one word swapping (the client's reference: boltonschool.org)
// The client does not want the typewriter. The heading is fully visible from the start and its last word rotates; the typewriter code is kept
// (headingEffect: "typewriter" in src/data/home-courage.ts), so these checks adapt: they only run for the rotating variant.
{
  const probe = async (width, height, touch) => {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch });
    const page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForTimeout(2500);
    return { context, page };
  };

  // 1. the rotating word never runs out of the heading's box (the slot is as wide as the longest word: a word that is too long would)
  for (const [width, height, touch] of [
    [1920, 993, false],
    [1440, 900, false],
    [1100, 760, false],
    [768, 1024, true],
    [390, 844, true],
  ]) {
    const { context, page } = await probe(width, height, touch);
    const result = await page.evaluate(() => {
      const word = document.querySelector("[data-rotating-word]");
      if (!word) return { rotating: false };
      const slot = word.parentElement.getBoundingClientRect();
      const heading = word.closest("h2").getBoundingClientRect();
      const words = [...document.querySelectorAll("[data-rotating-word]")].map((w) => w.textContent);
      return {
        rotating: true,
        words: words.length,
        over: Math.round(slot.right - heading.right),
        typewriter: document.querySelectorAll("[data-char]").length,
      };
    });
    if (!result.rotating) {
      console.log("SKIP  heading checks: the typewriter variant is on");
      await context.close();
      break;
    }
    ok(
      `Courage heading at ${width}px: the heading is plain text (no typed characters), and the longest rotating word stays inside the heading's box`,
      result.typewriter === 0 && result.words >= 2 && result.over <= 4,
      JSON.stringify(result),
    );
    await context.close();
  }

  // 2. on a desktop screen: while the heading is on screen the word really changes, and the rest of the heading is visible all the time
  {
    const { context, page } = await probe(1920, 993, false);
    const exists = await page.evaluate(() => !!document.querySelector("[data-rotating-word]"));
    if (exists) {
      await page.mouse.move(5, 300);
      await page.mouse.wheel(0, 30);
      const geo = await page.evaluate(() => {
        const spacer = document.querySelectorAll(".pin-spacer")[1];
        return {
          top: Math.round(spacer.getBoundingClientRect().top + scrollY),
          length: spacer.offsetHeight - spacer.firstElementChild.offsetHeight,
        };
      });
      // walk along the pan until the heading is inside the screen
      let seenAt = null;
      for (let step = 2; step <= 9 && seenAt === null; step++) {
        await scrollToY(page, geo.top + (geo.length * step) / 10);
        const inside = await page.evaluate(() => {
          const box = document.querySelector("[data-rotating-word]").parentElement.getBoundingClientRect();
          return box.left > 0 && box.right < innerWidth;
        });
        if (inside) seenAt = step;
      }
      const words = new Set();
      let plainTextVisible = true;
      for (let i = 0; i < 20; i++) {
        const now = await page.evaluate(() => {
          const heading = document.querySelector("[data-rotating-word]").closest("h2");
          const active = document.querySelector('[data-rotating-word][data-state="active"]');
          return { word: active ? active.textContent : null, opacity: +getComputedStyle(heading).opacity, text: heading.textContent };
        });
        if (now.word) words.add(now.word);
        if (now.opacity !== 1 || !/Courage/.test(now.text)) plainTextVisible = false;
        await page.waitForTimeout(500);
      }
      ok(
        "Courage heading on a desktop screen: the heading is visible the whole time and its last word changes while it is on screen",
        seenAt !== null && plainTextVisible && words.size >= 2,
        JSON.stringify({ seenAt, words: [...words] }),
      );
    }
    await context.close();
  }

  // 3. reduced motion: the word does not change
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 993 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForTimeout(5000);
    const info = await page.evaluate(() => {
      const words = [...document.querySelectorAll("[data-rotating-word]")];
      return { count: words.length, active: words.filter((w) => w.getAttribute("data-state") === "active").map((w) => w.textContent) };
    });
    if (info.count)
      ok(
        "Courage heading with reduced motion: the first word stays, nothing rotates",
        info.active.length === 1 && info.active[0] === "Path",
        JSON.stringify(info),
      );
    await context.close();
  }
}

// ---------------------------------------------------------------- 9. The five Ecosystem tabs: each has its own text and photo; the panel never changes height
// (the texts differ in length: all five sit stacked in one grid cell, so the panel is as tall as the tallest, and the scene fits THAT to the screen)
{
  const expected = [
    ["Building strong foundations", "choir"],
    ["Developing strength", "sports"],
    ["Expanding learning", "coscholastic"],
    ["Turning ideas", "capstone"],
    ["Preparing students", "social-impact"],
  ];
  for (const [width, height, touch] of [
    [1920, 1200, false],
    [1440, 900, false],
    [390, 844, true],
  ]) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: touch, isMobile: touch });
    const page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.mouse.move(5, 300);
    await page.mouse.wheel(0, 30);
    await page.waitForTimeout(3000);
    await scrollToY(page, (await startOf(page, ECO)) + (touch ? 200 : 4));
    const rows = [];
    for (let index = 0; index < 5; index++) {
      await page.locator(`${ECO} [role=tab]`).nth(index).click({ force: true });
      await page.waitForTimeout(1500);
      const readRow = () =>
        page.evaluate((s) => {
          const sec = document.querySelector(s);
          const active = sec.querySelector("[data-eco-row][data-active]");
          const photo = sec.querySelector("[data-eco-photo] img");
          const panel = sec.closest("[data-scene-panel]");
          const stage = panel.parentElement.parentElement.getBoundingClientRect();
          const bullets = [...active.querySelectorAll("li")];
          const lastBullet = bullets[bullets.length - 1].getBoundingClientRect();
          return {
            title: active.querySelector("h3").textContent,
            photo: photo ? photo.getAttribute("src") : null,
            panelHeight: Math.round(panel.firstElementChild.offsetHeight),
            inertOthers: [...sec.querySelectorAll("[data-eco-row]:not([data-active])")].every(
              (r) => r.hasAttribute("inert") && r.getAttribute("aria-hidden") === "true",
            ),
            lastBulletBottomVsStage: Math.round(lastBullet.bottom - stage.bottom),
            bullets: bullets.length,
          };
        }, ECO);
      // a photo that comes from the CMS media storage can take longer to arrive than one from the site's own files: look again before judging
      let row = await readRow();
      if (!row.photo?.includes(expected[index][1])) {
        await page.waitForTimeout(3500);
        row = await readRow();
      }
      rows.push(row);
    }
    const titlesAndPhotos = rows.every((r, i) => r.title.startsWith(expected[i][0]) && r.photo.includes(expected[i][1]));
    const sameHeight = new Set(rows.map((r) => r.panelHeight)).size === 1;
    ok(
      `Ecosystem tabs at ${width}x${height}: each tab shows its own title and photo, the other tabs' texts are inert, the panel height is the same for all five`,
      titlesAndPhotos && sameHeight && rows.every((r) => r.inertOthers),
      JSON.stringify(rows.map((r) => [r.title.slice(0, 14), r.photo?.split("/").pop(), r.panelHeight])),
    );
    ok(
      `Ecosystem tabs at ${width}x${height}: the last bullet of every tab stays inside the pinned screen (nothing cut off)`,
      rows.every((r) => r.lastBulletBottomVsStage <= 2),
      JSON.stringify(rows.map((r) => r.lastBulletBottomVsStage)),
    );
    await context.close();
  }
}

// ---------------------------------------------------------------- 10. The Ecosystem photo CROSS-FADES on a tab change (owner, 2026-10-24; it used to wipe open from the left)
// The new photo is loaded first, then fades in (about 0.9 s) over the old one while it settles from a slight zoom (1.08 to 1). The old
// photo stays fully visible underneath until the fade is done (no blank frame); then one layer is left. Reduced motion: an instant swap.
{
  /** Clicks tab `n` and records every animation frame for `ms`: the layers' opacity, scale and photo, and the photo box's clip. */
  const clickAndSample = (page, n, ms) =>
    page.evaluate(
      ([sec, n, ms]) =>
        new Promise((resolve) => {
          const root = document.querySelector(sec);
          const frames = [];
          const t0 = performance.now();
          root.querySelectorAll("[role=tab]")[n].click();
          const read = () => {
            const layers = [...root.querySelectorAll("[data-eco-layer]")];
            frames.push({
              t: Math.round(performance.now() - t0),
              layers: layers.map((l) => ({
                o: +getComputedStyle(l).opacity,
                s: +new DOMMatrix(getComputedStyle(l).transform).a.toFixed(3),
                src: (l.querySelector("img")?.getAttribute("src") ?? "").split("/").pop(),
                top: l.hasAttribute("data-eco-photo"),
              })),
              clip: getComputedStyle(root.querySelector("[data-eco-clip]")).clipPath,
            });
            if (performance.now() - t0 < ms) requestAnimationFrame(read);
            else resolve(frames);
          };
          read();
        }),
      [ECO, n, ms],
    );

  for (const [label, reduced] of [
    ["desktop 1920", false],
    ["reduced motion", true],
  ]) {
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1200 },
      reducedMotion: reduced ? "reduce" : "no-preference",
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 160)));
    page.on("console", (m) => ["error", "warning"].includes(m.type()) && errors.push(m.text().slice(0, 160)));
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.mouse.move(5, 300);
    await page.mouse.wheel(0, 30);
    await page.waitForTimeout(3000);
    await scrollToY(page, (await startOf(page, ECO)) + 4);

    const frames = await clickAndSample(page, 1, 2200);
    const last = frames[frames.length - 1];
    if (reduced) {
      ok(
        `Ecosystem photo, ${label}: swaps at once (never a second layer, always opaque and at normal size)`,
        frames.every((f) => f.layers.length === 1 && f.layers[0].o === 1 && f.layers[0].s === 1) && last.layers[0].src.includes("sports"),
        `layers ${[...new Set(frames.map((f) => f.layers.length))]}, shows ${last.layers[0].src}`,
      );
    } else {
      const during = frames.filter((f) => f.layers.length === 2);
      const top = during.map((f) => f.layers.find((l) => l.top));
      const under = during.map((f) => f.layers.find((l) => !l.top));
      ok(
        `Ecosystem photo, ${label}: the new photo is on top of the old one while it fades in (two layers for about 0.9 s)`,
        during.length >= 20 &&
          top[0].src.includes("sports") &&
          under[0].src.includes("choir") &&
          during.at(-1).t > 700 &&
          during.at(-1).t < 1500,
        `${during.length} frames, until ${during.at(-1)?.t} ms, top ${top[0]?.src}, under ${under[0]?.src}`,
      );
      ok(
        `Ecosystem photo, ${label}: opacity rises from 0 to 1 and the zoom eases from about 1.08 to 1, both only one way`,
        top[0].o < 0.2 &&
          top.at(-1).o > 0.97 &&
          top.every((l, i) => i === 0 || l.o >= top[i - 1].o - 0.001) &&
          top[0].s > 1.05 &&
          top[0].s <= 1.081 &&
          last.layers[0].s === 1 &&
          top.every((l, i) => i === 0 || l.s <= top[i - 1].s + 0.001),
        `opacity ${top[0].o.toFixed(2)} to ${top.at(-1).o.toFixed(2)}, scale ${top[0].s} to ${last.layers[0].s}`,
      );
      ok(
        `Ecosystem photo, ${label}: the old photo stays fully visible underneath the whole time (no blank frame)`,
        under.every((l) => l.o === 1),
        `lowest ${Math.min(...under.map((l) => l.o))}`,
      );
      ok(
        `Ecosystem photo, ${label}: afterwards one layer is left, opaque, at normal size, showing the new photo; the box is not wiped`,
        last.layers.length === 1 &&
          last.layers[0].top &&
          last.layers[0].o === 1 &&
          last.layers[0].s === 1 &&
          frames.every((f) => /inset\(0/.test(f.clip) && !/100%/.test(f.clip)),
        `${last.layers.length} layer, ${last.layers[0].src}, ${last.clip}`,
      );
      // three quick clicks: the stack settles on the last tab, nothing is left half faded
      await page.evaluate((sec) => {
        const t = document.querySelector(sec).querySelectorAll("[role=tab]");
        t[0].click();
        setTimeout(() => t[3].click(), 120);
        setTimeout(() => t[4].click(), 260);
      }, ECO);
      await page.waitForTimeout(3200);
      const end = await page.evaluate((sec) => {
        const r = document.querySelector(sec);
        const l = [...r.querySelectorAll("[data-eco-layer]")];
        return {
          n: l.length,
          src: l[0]?.querySelector("img")?.getAttribute("src").split("/").pop(),
          o: +getComputedStyle(l[0]).opacity,
          selected: [...r.querySelectorAll("[role=tab]")].findIndex((t) => t.getAttribute("aria-selected") === "true"),
        };
      }, ECO);
      ok(
        `Ecosystem photo, ${label}: three quick clicks (tabs 1, 4, 5 within 0.3 s) end on the last tab with one fully visible layer`,
        end.n === 1 && end.src.includes("social-impact") && end.o === 1 && end.selected === 4,
        JSON.stringify(end),
      );
    }
    ok(`Ecosystem photo, ${label}: no console errors or warnings`, errors.length === 0, JSON.stringify(errors.slice(0, 2)));
    await context.close();
  }
}

// ---------------------------------------------------------------- 10. The mega menu (owner, 2026-10-29): the header's menu button opens a full-screen panel from the right
{
  const MENU = "#site-menu";
  const openMenu = async (page) => {
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.waitForTimeout(2700);
  };
  const dialogBox = (page) =>
    page.evaluate((sel) => {
      const d = document.querySelector(sel);
      const r = d.getBoundingClientRect();
      return { left: Math.round(r.left), top: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height), inert: d.inert };
    }, MENU);
  const chosenLinks = (page) =>
    page.evaluate((sel) => {
      const d = document.querySelector(sel);
      return [...d.querySelectorAll("[data-menu-sub]")].filter((a) => !a.closest("[inert]")).map((a) => a.textContent.trim());
    }, MENU);

  // desktop, the Figma design size: it comes in from the right, covers the screen, the photo and the white panel
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 993 } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 140)));
    page.on("console", (m) => ["error", "warning"].includes(m.type()) && errors.push(m.text().slice(0, 140)));
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForTimeout(3000);

    const closed = await dialogBox(page);
    const button = page.getByRole("button", { name: "Open menu" });
    ok(
      "menu (1920): closed, it waits off screen to the right, not reachable (inert), and the button says it is closed",
      closed.left >= 1920 && closed.inert && (await button.getAttribute("aria-expanded")) === "false",
      JSON.stringify(closed),
    );

    await openMenu(page);
    const opened = await dialogBox(page);
    const info = await page.evaluate((sel) => {
      const d = document.querySelector(sel);
      const box = (el) => {
        const r = el.getBoundingClientRect();
        return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)];
      };
      const photo = d.querySelector("img[src*='menu-crest']");
      const parents = [...d.querySelectorAll("[data-menu-parent]")];
      const close = d.querySelector("[data-menu-close]");
      return {
        photoLoaded: !!photo && photo.complete && photo.naturalWidth > 0,
        photoBox: photo ? box(photo.parentElement) : null,
        parents: parents.length,
        firstOpen: parents[0].getAttribute("aria-expanded"),
        close: box(close),
        focus: document.activeElement?.getAttribute("aria-label"),
        buttonExpanded: document.querySelector("header button[aria-controls]").getAttribute("aria-expanded"),
        overflowX: document.documentElement.scrollWidth - innerWidth,
      };
    }, MENU);
    ok(
      "menu (1920): open, it covers the whole screen (1920 x 993 from the top left) and the menu button says it is open",
      opened.left === 0 &&
        opened.top === 0 &&
        opened.width === 1920 &&
        opened.height === 993 &&
        !opened.inert &&
        info.buttonExpanded === "true",
      JSON.stringify({ opened, expanded: info.buttonExpanded }),
    );
    ok(
      "menu (1920): the photo fills the left half (960px), loaded, and the white panel is the right half",
      info.photoLoaded && info.photoBox && info.photoBox[0] === 0 && info.photoBox[2] === 960 && info.photoBox[3] === 993,
      JSON.stringify({ loaded: info.photoLoaded, box: info.photoBox }),
    );
    ok(
      "menu (1920): the close button is the round 56px button at the Figma place (x 1784, y 50) and has the focus",
      Math.abs(info.close[0] - 1784) <= 1 &&
        Math.abs(info.close[1] - 50) <= 1 &&
        info.close[2] === 56 &&
        info.close[3] === 56 &&
        info.focus === "Close menu",
      JSON.stringify({ close: info.close, focus: info.focus }),
    );
    const links = await chosenLinks(page);
    ok(
      "menu (1920): eight main items, About Us is chosen and shows its eight links",
      info.parents === 8 &&
        info.firstOpen === "true" &&
        links.length === 8 &&
        links[0] === "Welcome to LPS" &&
        links[7] === "Information Desk",
      JSON.stringify({ parents: info.parents, links }),
    );

    // the page behind cannot be scrolled
    const y0 = await page.evaluate(() => Math.round(scrollY));
    await page.mouse.move(400, 500);
    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(900);
    const y1 = await page.evaluate(() => Math.round(scrollY));
    ok("menu (1920): the page behind the open menu does not scroll", y0 === y1, y0 + " to " + y1);

    // choosing another main item swaps the links
    await page.locator("[data-menu-parent]", { hasText: "Admissions" }).click();
    await page.waitForTimeout(700);
    const swapped = await chosenLinks(page);
    const firstListHidden = await page.evaluate(() => {
      const first = document.querySelector("[data-menu-parent]").getAttribute("aria-controls");
      const el = document.getElementById(first);
      return { inert: el.inert, opacity: +getComputedStyle(el).opacity };
    });
    ok(
      "menu (1920): clicking Admissions shows ITS links (the About Us links go away, not reachable)",
      swapped.includes("Why LPS") && !swapped.includes("Partnerships") && firstListHidden.inert && firstListHidden.opacity === 0,
      JSON.stringify({ swapped, firstListHidden }),
    );

    // a mouse over an item chooses it, with no click
    await page.locator("[data-menu-parent]", { hasText: "Alumni" }).hover();
    await page.waitForTimeout(700);
    ok("menu (1920): pointing at Alumni with the mouse shows its links", (await chosenLinks(page)).includes("Alumni Guidance"), "");

    // the links of a main item are revealed one after another EVERY time it is chosen (hover), not just swapped
    {
      const listOpacity = (name) =>
        page.evaluate((label) => {
          const btn = [...document.querySelectorAll("[data-menu-parent]")].find((b) => b.textContent.trim() === label);
          return [...document.getElementById(btn.getAttribute("aria-controls")).querySelectorAll("li")].map(
            (li) => +getComputedStyle(li).opacity,
          );
        }, name);
      await page.locator("[data-menu-parent]", { hasText: "Secondary" }).hover();
      await page.waitForTimeout(150);
      const early = await listOpacity("Secondary");
      await page.waitForTimeout(2000);
      const late = await listOpacity("Secondary");
      ok(
        "menu (1920): hovering a main item reveals its links one after another (the last is still hidden at 150 ms, the first is ahead of it, all are visible at the end)",
        early.length >= 6 && early.at(-1) < 0.2 && early[0] > early.at(-1) && late.every((o) => o > 0.99),
        JSON.stringify({ early, late }),
      );
    }

    // the keyboard stays inside: many Tab presses, the focus is always in the menu
    let escaped = 0;
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate((sel) => document.querySelector(sel).contains(document.activeElement), MENU);
      if (!inside) escaped++;
    }
    ok("menu (1920): 40 Tab presses never leave the open menu", escaped === 0, escaped + " outside");

    // Escape closes it, the focus goes back to the menu button, the page scrolls again
    await page.keyboard.press("Escape");
    await page.waitForTimeout(1100);
    const after = await page.evaluate((sel) => {
      const d = document.querySelector(sel);
      const r = d.getBoundingClientRect();
      return {
        left: Math.round(r.left),
        inert: d.inert,
        focus: document.activeElement?.getAttribute("aria-label"),
        overflow: document.documentElement.style.overflow,
        expanded: document.querySelector("header button[aria-controls]").getAttribute("aria-expanded"),
      };
    }, MENU);
    ok(
      "menu (1920): Escape slides it away to the right, the focus is back on the menu button, the page can scroll again",
      after.left >= 1920 && after.inert && after.focus === "Open menu" && after.overflow !== "hidden" && after.expanded === "false",
      JSON.stringify(after),
    );

    // opened again, it starts at About Us again; a click on a link closes it
    await openMenu(page);
    ok("menu (1920): opened again, it starts at About Us", (await chosenLinks(page))[0] === "Welcome to LPS", "");
    await page.locator("[data-menu-sub]", { hasText: "Partnerships" }).first().click();
    await page.waitForTimeout(1100);
    ok("menu (1920): a click on a link closes it", (await dialogBox(page)).left >= 1920, "");
    ok("menu (1920): no console errors or warnings", errors.length === 0, JSON.stringify(errors.slice(0, 2)));
    await context.close();
  }

  // reduced motion: the menu simply appears (no sliding)
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 993 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForTimeout(2500);
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.waitForTimeout(150);
    const box = await dialogBox(page);
    ok(
      "menu with reduced motion: it is in place 150 ms after the click (nothing slides)",
      box.left === 0 && !box.inert,
      JSON.stringify(box),
    );
    await context.close();
  }

  // laptops: the whole menu fits without scrolling (the spacing follows the screen height)
  for (const [width, height] of [
    [1366, 768],
    [1280, 720],
  ]) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForTimeout(2500);
    await openMenu(page);
    const fit = await page.evaluate((sel) => {
      const panel = document.querySelector(sel).children[1];
      const buttons = [...document.querySelector(sel).querySelectorAll("a")]
        .find((a) => /enquiry/i.test(a.textContent))
        .getBoundingClientRect();
      return {
        scrolls: panel.scrollHeight > panel.clientHeight + 1,
        buttonsBottom: Math.round(buttons.bottom),
        overflowX: document.documentElement.scrollWidth - innerWidth,
      };
    }, MENU);
    ok(
      `menu (${width} x ${height}): everything fits, nothing scrolls, the buttons are on screen`,
      !fit.scrolls && fit.buttonsBottom <= height && fit.overflowX <= 0,
      JSON.stringify(fit),
    );
    await context.close();
  }

  // tablet: the same two columns on the white panel, without the photo
  {
    const context = await browser.newContext({ viewport: { width: 768, height: 1024 }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForTimeout(2500);
    await openMenu(page);
    const tablet = await page.evaluate((sel) => {
      const d = document.querySelector(sel);
      const parents = [...d.querySelectorAll("[data-menu-parent]")];
      const firstSub = [...d.querySelectorAll("[data-menu-sub]")].find((a) => !a.closest("[inert]"));
      return {
        photo: !!d.querySelector("img[src*='menu-crest']"),
        columns: firstSub.getBoundingClientRect().left > parents[0].getBoundingClientRect().right,
        overflowX: document.documentElement.scrollWidth - innerWidth,
        width: Math.round(d.getBoundingClientRect().width),
      };
    }, MENU);
    ok(
      "menu (768, tablet): full screen, the lists side by side, no photo is downloaded, no sideways overflow",
      !tablet.photo && tablet.columns && tablet.overflowX <= 0 && tablet.width === 768,
      JSON.stringify(tablet),
    );
    await context.close();
  }

  // phone: the main items stacked, tapping one opens its links under it (an accordion)
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 140)));
    page.on("console", (m) => ["error", "warning"].includes(m.type()) && errors.push(m.text().slice(0, 140)));
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForTimeout(2500);
    await openMenu(page);
    const start = await page.evaluate((sel) => {
      const d = document.querySelector(sel);
      const parents = [...d.querySelectorAll("[data-menu-parent]")];
      const tops = parents.map((p) => Math.round(p.getBoundingClientRect().top));
      return {
        allClosed: parents.every((p) => p.getAttribute("aria-expanded") === "false"),
        stacked: tops.every((t, i) => i === 0 || t > tops[i - 1]),
        desktopPhoto: !!d.querySelector("img[src*='menu-crest.avif']"),
        banner: (() => {
          const img = d.querySelector("img[src*='menu-crest-wide']");
          const r = img?.getBoundingClientRect();
          return r ? { top: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height) } : null;
        })(),
        linkRows: new Set([...d.querySelectorAll("ul")[0].querySelectorAll("a")].map((a) => Math.round(a.getBoundingClientRect().top)))
          .size,
        closeOnBanner: (() => {
          const c = d.querySelector("[data-menu-close]").getBoundingClientRect();
          const b = d.querySelector("img[src*='menu-crest-wide']")?.getBoundingClientRect();
          return !!b && c.top >= b.top && c.bottom <= b.bottom && c.right <= b.right && c.left >= b.left;
        })(),
        overflowX: document.documentElement.scrollWidth - innerWidth,
      };
    }, MENU);
    ok(
      "menu (390, phone): the main items are stacked and all closed at first, no sideways overflow",
      start.allClosed && start.stacked && start.overflowX <= 0,
      JSON.stringify(start),
    );
    ok(
      "menu (390, phone): the crest photo (the wide cut, not the desktop one) is across the top with the close button on it, and Parent Login and Contact us share one row",
      !start.desktopPhoto &&
        start.banner &&
        start.banner.width > 300 &&
        start.banner.height > 120 &&
        start.closeOnBanner &&
        start.linkRows === 1,
      JSON.stringify(start),
    );
    await page.getByRole("button", { name: "Primary", exact: true }).tap();
    await page.waitForTimeout(700);
    const tapped = await chosenLinks(page);
    ok(
      "menu (390, phone): tapping Primary opens its links under it",
      tapped.includes("Welcome to LPS Primary") && !tapped.includes("Partnerships"),
      JSON.stringify(tapped),
    );
    await page.getByRole("button", { name: "Primary", exact: true }).tap();
    await page.waitForTimeout(700);
    ok("menu (390, phone): tapping it again closes it", (await chosenLinks(page)).length === 0, "");
    await page.locator("[data-menu-close]").tap();
    await page.waitForTimeout(1100);
    ok("menu (390, phone): the close button closes it", (await dialogBox(page)).left >= 390, "");
    ok("menu (390, phone): no console errors or warnings", errors.length === 0, JSON.stringify(errors.slice(0, 2)));
    await context.close();
  }

  // a narrow window with a MOUSE (the browser's responsive mode): the mouse wheel must scroll the menu panel (the smooth scrolling, Lenis, is
  // stopped while the menu is open and used to swallow the wheel, so the panel could not be scrolled)
  {
    const context = await browser.newContext({ viewport: { width: 375, height: 640 } });
    const page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForTimeout(2500);
    await openMenu(page);
    await page.getByRole("button", { name: "About Us", exact: true }).click();
    await page.waitForTimeout(700);
    const read = () =>
      page.evaluate((sel) => {
        const panel = document.querySelector(sel).children[1];
        return { top: Math.round(panel.scrollTop), room: panel.scrollHeight - panel.clientHeight, pageY: Math.round(scrollY) };
      }, MENU);
    const before = await read();
    await page.mouse.move(180, 360);
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(800);
    const after = await read();
    ok(
      "menu (375 wide, mouse): the mouse wheel scrolls the menu panel, not the page behind it",
      before.room > 0 && after.top > before.top && after.pageY === before.pageY,
      JSON.stringify({ before, after }),
    );
    await context.close();
  }
}

console.log(fails ? `\n${fails} CHECK(S) FAILED` : "\nALL INTERACTION CHECKS PASSED");
await browser.close();
process.exitCode = fails ? 1 : 0;
