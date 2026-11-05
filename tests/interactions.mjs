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

/** Waits until the page has really stopped moving: the smooth scroll has finished its glide (its length and curve are not assumed). */
async function scrollSettled(page, maxMs = 4000) {
  let last = null;
  let steady = 0;
  for (let waited = 0; waited < maxMs && steady < 3; waited += 100) {
    await page.waitForTimeout(100);
    const y = await page.evaluate(() => Math.round(scrollY));
    steady = y === last ? steady + 1 : 0;
    last = y;
  }
}

// Scrolls to a page position with the mouse wheel (window.scrollTo fights the smooth scrolling). The whole distance in one go (wheel events add up in the smooth scroll's target), then wait for the glide to finish; what is left is corrected the same
// way. The first version sent the rest of the distance again 260 ms later, while the glide was still running, and how far that overshot depended on the
// shape of the glide: it broke when the glide's curve was changed (the scene-position checks of section 7 failed on CI, 2026-11-03).
async function scrollToY(page, y) {
  for (let i = 0; i < 12; i++) {
    const now = await page.evaluate(() => Math.round(scrollY));
    let left = y - now;
    if (Math.abs(left) <= 2) break;
    while (left !== 0) {
      const step = Math.max(-900, Math.min(900, left));
      await page.mouse.wheel(0, step);
      left -= step;
      await page.waitForTimeout(30);
    }
    await scrollSettled(page);
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

/** The pinned sideways scene that holds the section: where its pin starts and how many px of scroll the pan takes (null when it is not in a scene). */
const sceneOf = (page, selector) =>
  page.evaluate((s) => {
    const spacer = document.querySelector(s)?.closest(".pin-spacer");
    if (!spacer) return null;
    return {
      top: Math.round(spacer.getBoundingClientRect().top + scrollY),
      length: spacer.offsetHeight - spacer.firstElementChild.offsetHeight,
    };
  }, selector);

const browser = await chromium.launch({ channel: "chrome" });
// `html { scrollbar-gutter: stable }` (src/app/(frontend)/globals.css) keeps 15px of the page reserved for the scrollbar, even in this browser, which
// hides its scrollbars: every check below that measures against Figma at exactly 1920px would then see 1905px. So the pages of this browser switch
// the gutter off; section 14 tests it in a browser with real scrollbars.
const openContext = browser.newContext.bind(browser);
browser.newContext = async (...args) => {
  const context = await openContext(...args);
  await context.addInitScript(() => {
    // a constructed stylesheet: nothing is added to the DOM, so React's hydration sees the page it rendered
    const sheet = new CSSStyleSheet();
    sheet.replaceSync("html { scrollbar-gutter: auto !important; }");
    document.adoptedStyleSheets = [sheet];
  });
  return context;
};

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
    await page
      .locator(`${ECO} [role=tab]`)
      .nth(index)
      .evaluate((el) => el.click());
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
    Alumni: 'section[aria-label^="Alumni"]',
    News: 'section[aria-label^="What"]',
    CTA: 'section[aria-label="Admissions"]',
  };
  for (const [name, selector] of Object.entries(sections)) {
    const exists = await page.evaluate((s) => !!document.querySelector(s), selector);
    if (!exists) {
      console.log(`SKIP  ${name}: selector ${selector} not found`);
      continue;
    }
    // Campus is the second panel of the Ecosystem scene (2026-11-02): its media box opens BY THE PAN and the label comes in at the end, so for
    // Campus "scrolled to it" means the end of that scene's pan (the checks of that opening follow below).
    const scene = name === "Campus" ? await sceneOf(page, selector) : null;
    const target = scene ? scene.top + scene.length : (await startOf(page, selector)) - 150;
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

  // The Campus media box opens with the pan of the Ecosystem scene, in both directions: closed (a smaller rounded window, label hidden) while the
  // pan has not reached it, completely open and showing its label at the end of the pan, and closed again when scrolling back to the start.
  if (await page.evaluate(() => !!document.querySelector("[data-campus-frame]"))) {
    const scene = await sceneOf(page, "[data-campus-frame]");
    const read = () =>
      page.evaluate(() => {
        const frame = document.querySelector("[data-campus-frame]");
        const tag = document.querySelector("[data-campus-tag]");
        const numbers = (getComputedStyle(frame).clipPath.match(/[d.]+/g) ?? []).map(Number);
        return { open: numbers.every((n) => n < 0.5), tag: +getComputedStyle(tag).opacity };
      });
    await scrollToY(page, scene.top + 2); // the pan has only just started: the video is still out of sight to the right
    const low = await read();
    await scrollToY(page, scene.top + scene.length); // the end of the pan: the video is centred
    const high = await read();
    await scrollToY(page, scene.top + 2);
    const back = await read();
    ok(
      "Campus media: closed while the pan has not reached it, completely open (label shown) at the end of the pan, closed again scrolling back (driven by the scroll)",
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
    // How many times the page was measured again (src/lib/gsap.ts counts it on <html data-measured>); below 1024px nothing but the sideways scenes is
    // pinned (the hero is a slider there), so the measurements are what shows whether a resize was taken into account.
    const hero = () => page.evaluate(() => ({ measured: Number(document.documentElement.dataset.measured ?? 0), h: innerHeight }));
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
      "phone: the address bar changing the height while scrolling does not re-measure the pinned scenes",
      scrolling.measured === before.measured,
      `measured ${before.measured} -> ${scrolling.measured} times`,
    );
    await page.waitForTimeout(1200);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1800);
    const still = await hero();
    ok(
      "phone: the same height change with the page standing still does re-measure it",
      still.measured > scrolling.measured && still.h === 844,
      `measured ${scrolling.measured} -> ${still.measured} times`,
    );
    await page.evaluate(() => window.scrollBy(0, 40));
    await page.waitForTimeout(60);
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(1800);
    const rotated = await hero();
    ok(
      "phone: rotating (the width changes) re-measures it even while scrolling",
      rotated.h === 390 && rotated.measured > still.measured,
      `measured ${still.measured} -> ${rotated.measured} times`,
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
    await page
      .locator(`${ECO} [role=tab]`)
      .nth(1)
      .evaluate((el) => el.click());
    await page.waitForTimeout(1200);
    const second = await read(page);
    await page
      .locator(`${ECO} [role=tab]`)
      .nth(4)
      .evaluate((el) => el.click());
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
    await page
      .locator(`${ECO} [role=tab]`)
      .nth(1)
      .evaluate((el) => el.click());
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
// Scroll down and the view pans sideways across the panels; the Journey panel ends the pan whole on the screen (its four columns are a row to swipe, owner 2026-11-04).
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
      [...document.querySelectorAll(".pin-spacer")].map((spacer) => {
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
  // there the page has ONE sideways scene (1 pin); from 640px it has two scenes (2 pins). The hero is NOT pinned below 1024px (it is a swipe slider
  // there, owner 2026-11-02), so it adds no pin.
  const pins = width >= 640 && height >= 500 ? 2 : 1;
  ok(
    `${label}: the page has ${pins} sideways scene${pins === 2 ? "s" : ""} (${pins} pin${pins === 2 ? "s" : ""}, none for the hero), each stage exactly one screen high`,
    (await page.evaluate(() => document.querySelectorAll(".pin-spacer").length)) === pins && found.every((x) => x.stage === height),
    JSON.stringify(found),
  );
  if (pins === 1) {
    // the second scene is a plain stack: not inside a pin, Campus under Ecosystem, nothing wider than the screen
    const stack = await page.evaluate(() => {
      const eco = document.querySelector('section[aria-label="The ecosystem behind LPS 360"]');
      const campus = document.querySelector('section[aria-label="A campus built around possibility"]');
      const a = eco.getBoundingClientRect();
      const b = campus.getBoundingClientRect();
      return {
        pinned: Boolean(eco.closest(".pin-spacer") || campus.closest(".pin-spacer")),
        underneath: b.top + scrollY >= a.bottom + scrollY - 5,
        fits: a.width <= innerWidth + 1 && b.width <= innerWidth + 1,
      };
    });
    ok(
      `${label}: Ecosystem and Campus are an ordinary stack (not pinned, one under the other, within the screen)`,
      !stack.pinned && stack.underneath && stack.fits,
      JSON.stringify(stack),
    );
  }
  // Beyond the school gate is an ordinary section under the scene at every size: not pinned, below the Campus panel
  const alumniBelow = await page.evaluate(() => {
    const campus = document.querySelector('section[aria-label="A campus built around possibility"]');
    const alumni = document.querySelector('section[aria-label^="Alumni"]');
    return {
      pinned: Boolean(alumni.closest(".pin-spacer")),
      below: alumni.getBoundingClientRect().top + scrollY >= campus.getBoundingClientRect().bottom + scrollY - 5,
      fits: alumni.getBoundingClientRect().width <= innerWidth + 1,
    };
  });
  ok(
    `${label}: Beyond the school gate is an ordinary section under the scene (not pinned, within the screen)`,
    !alumniBelow.pinned && alumniBelow.below && alumniBelow.fits,
    JSON.stringify(alumniBelow),
  );

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

  // the whole scene scrolled through: sideways to the Journey panel, then the pin ends
  await scrollToY(page, found[0].top + found[0].length);
  const end = await page.evaluate(() => {
    const columns = [...document.querySelectorAll("[data-col]")];
    const first = columns[0].getBoundingClientRect();
    const second = columns[1].getBoundingClientRect();
    const section = columns[0].closest("section").getBoundingClientRect();
    // the Courage heading is shown in full: typewriter variant = every typed character is on; rotate variant = the rotating word is on the page
    const chars = [...document.querySelectorAll("[data-char]")];
    const headingShown = chars.length
      ? chars.every((c) => +c.style.opacity === 1)
      : document.querySelectorAll("[data-rotating-word]").length >= 2;
    return {
      firstLeft: Math.round(first.left),
      firstWidth: Math.round(first.width),
      secondLeft: Math.round(second.left),
      sectionBottom: Math.round(section.bottom),
      headingShown,
      overflow: document.documentElement.scrollWidth - innerWidth,
    };
  });
  ok(
    `${label}: at the end of scene 1 the Journey panel is whole on the screen (the first column showing, the next one peeking in), the Courage heading is shown in full`,
    end.firstLeft >= 0 &&
      end.firstLeft < width / 2 &&
      end.secondLeft < width - 20 &&
      end.secondLeft > end.firstLeft + 100 &&
      end.sectionBottom <= height + 3 &&
      end.headingShown,
    JSON.stringify(end),
  );
  // the four columns are a row to swipe: it scrolls, snaps to the columns, and the last column can be reached
  const swipe = await page.evaluate(async () => {
    const slider = document.querySelector("[data-col]").parentElement;
    const style = getComputedStyle(slider);
    const before = slider.scrollLeft;
    slider.scrollLeft = slider.scrollWidth;
    await new Promise((resolve) => setTimeout(resolve, 600));
    const columns = [...slider.children];
    const last = columns[columns.length - 1].getBoundingClientRect();
    const result = {
      scrollable: style.overflowX === "auto" && slider.scrollWidth > slider.clientWidth,
      snaps: style.scrollSnapType.includes("mandatory"),
      focusable: slider.getAttribute("tabindex") === "0",
      columns: columns.length,
      startedAtZero: before === 0,
      lastRight: Math.round(last.right),
      lastLeft: Math.round(last.left),
    };
    slider.scrollLeft = 0;
    return result;
  });
  ok(
    `${label}: the Journey columns are a row to swipe (four columns, snapping, a tab stop for the keyboard) and the last one can be reached`,
    swipe.scrollable &&
      swipe.snaps &&
      swipe.focusable &&
      swipe.columns === 4 &&
      swipe.startedAtZero &&
      swipe.lastRight <= width + 1 &&
      swipe.lastLeft >= 0,
    JSON.stringify(swipe),
  );
  ok(`${label}: no horizontal overflow anywhere in the scene`, end.overflow <= 0, String(end.overflow));

  // one pixel past the end the pin is released and the page goes on (the Framework section is next, or the Ecosystem on a phone where the Framework is hidden)
  await scrollToY(page, found[0].top + found[0].length + height);
  const after = await page.evaluate(() => {
    // the first one that is shown: on a phone the LPS 360 Framework is hidden (client, 2026-11-02), so the next section is the Ecosystem
    const framework = [...document.querySelectorAll('section[aria-label*="LPS 360"], section[aria-label*="Framework" i]')].find(
      (section) => getComputedStyle(section).display !== "none",
    );
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
      await page
        .locator(`${ECO} [role=tab]`)
        .nth(index)
        .evaluate((el) => el.click());
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
        `Ecosystem photo, ${label}: the new photo is on top of the old one while it fades in (two layers until the zoom has settled, about 1.4 s)`,
        during.length >= 20 &&
          top[0].src.includes("sports") &&
          under[0].src.includes("choir") &&
          // how long the two layers coexist is the fade and the settle together (the old photo is dropped when BOTH are done, 1.4 s: dropping it
          // while the new photo was still settling made the picture jump, 2026-11-03); WHEN it starts depends on how fast the new photo loads, so the
          // check measures that stretch itself and not the time since the click
          during.at(-1).t - during[0].t > 1200 &&
          during.at(-1).t - during[0].t < 1700,
        `${during.length} frames, fade ${during.at(-1)?.t - during[0]?.t} ms (from ${during[0]?.t} to ${during.at(-1)?.t}), top ${top[0]?.src}, under ${under[0]?.src}`,
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

// ---------------------------------------------------------------- 11. The Contact page (owner, 2026-11-02): the reusable hero, the details, the form, the map
{
  const SMALL_ERRORS = (errors, m) => {
    // The map is Google's page inside an iframe: its own console messages are not ours.
    const url = m.location()?.url ?? "";
    if (
      !/google\./.test(url) &&
      ["error", "warning"].includes(m.type()) &&
      !/preloaded using link preload|Download the React/.test(m.text())
    )
      errors.push(m.text().slice(0, 140));
  };
  const box = (page, selector) =>
    page.evaluate((s) => {
      const b = document.querySelector(s).getBoundingClientRect();
      return { x: Math.round(b.left), y: Math.round(b.top + scrollY), w: Math.round(b.width), h: Math.round(b.height) };
    }, selector);

  // desktop 1920 x 993: the geometry of the Figma frame (node 5644:9493), measured from the page top (the header is the first 74px)
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 993 } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 140)));
    page.on("console", (m) => SMALL_ERRORS(errors, m));
    await page.goto(BASE + "/contact-us", { waitUntil: "load" });
    await page.waitForTimeout(3500);
    for (let y = 0; y < 3300; y += 500) {
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(250);
    }
    await page.waitForTimeout(1800);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1200);

    const photo = await box(page, "[data-hero-photo]");
    ok(
      "contact (1920): the hero photo is 1920 x 736 right under the 74px header",
      near(photo.x, 0) && near(photo.y, 74, 2) && near(photo.w, 1920) && near(photo.h, 736, 2),
      JSON.stringify(photo),
    );
    const pill = await box(page, "section[aria-label='Contact us'] p");
    const h1 = await box(page, "h1");
    ok(
      "contact (1920): the pill and the heading are where Figma has them (centred, y 731 and 779)",
      near(pill.y, 731, 3) && near(pill.x + pill.w / 2, 960, 2) && near(h1.y, 779, 3) && near(h1.w, 616, 8) && near(h1.h, 58, 2),
      JSON.stringify({ pill, h1 }),
    );
    const form = await box(page, "form");
    const first = await box(page, "input[name=firstName]");
    const message = await box(page, "textarea");
    const send = await box(page, "button[type=submit]");
    ok(
      "contact (1920): the form is 784px wide on the right, fields 53px high, the message 213px, the button 176px",
      near(form.x, 936, 3) &&
        near(form.w, 784, 3) &&
        near(first.w, 378, 2) &&
        near(first.h, 53, 1.5) &&
        near(message.h, 213, 1.5) &&
        near(send.w, 176, 3),
      JSON.stringify({ form, first, message, send }),
    );
    const map = await box(page, "iframe");
    const footer = await box(page, "footer");
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    ok(
      "contact (1920): the map is 1520 x 516 and the page is as high as the design (3223px)",
      near(map.w, 1520, 3) && near(map.h, 516, 2) && near(map.y, 1878, 4) && near(total, 3223, 4),
      JSON.stringify({ map, footerTop: footer.y, total }),
    );
    const meta = await page.evaluate(() => ({
      variant: document.querySelector("header").getAttribute("data-variant"),
      h1s: document.querySelectorAll("h1").length,
      mapSrc: document.querySelector("iframe").getAttribute("src").slice(0, 40),
      mapLoading: document.querySelector("iframe").getAttribute("loading"),
      mapTitle: !!document.querySelector("iframe").getAttribute("title"),
    }));
    ok(
      "contact: solid header, one h1, and the map is a lazy Google Maps embed with a title",
      meta.variant === "solid" &&
        meta.h1s === 1 &&
        meta.mapSrc.startsWith("https://www.google.com/maps/embed") &&
        meta.mapLoading === "lazy" &&
        meta.mapTitle,
      JSON.stringify(meta),
    );

    // the form
    await page.evaluate(() => document.querySelector("form").scrollIntoView({ block: "center" }));
    await page.waitForTimeout(600);
    await page.getByRole("button", { name: /send message/i }).click();
    await page.waitForTimeout(400);
    const empty = await page.evaluate(() => ({
      focus: document.activeElement?.getAttribute("name"),
      errors: [...document.querySelectorAll("form [id$='-error']")].map((e) => e.textContent),
    }));
    ok(
      "contact: pressing Send on an empty form says what is missing and puts the focus on the first field",
      empty.focus === "firstName" && empty.errors.length === 5,
      JSON.stringify(empty),
    );
    await page.fill("input[name=firstName]", "Asha");
    await page.fill("input[name=lastName]", "Kaur");
    await page.fill("input[name=email]", "asha@example.com");
    await page.fill("input[name=phone]", "98780 07553");
    await page.fill("input[name=subject]", "Admission dates");
    await page.fill("textarea[name=message]", "Could you tell me about the admission dates?");
    const cleared = await page.evaluate(() => document.querySelectorAll("form [id$='-error']").length);
    await page.getByRole("button", { name: /send message/i }).click();
    await page.waitForTimeout(1500);
    // The e-mail host is not connected yet (src/lib/actions/contact.ts): the visitor is told the truth. When it is, this becomes "Thank you".
    const result = await page.evaluate(() => ({
      text: document.querySelector("form [aria-live]").textContent,
      links: [...document.querySelectorAll("form [aria-live] a")].map((a) => a.getAttribute("href")),
      kept: document.querySelector("input[name=firstName]").value,
    }));
    ok(
      "contact: with the e-mail host not connected, a good message is NOT reported as sent: the visitor is given the address and the phone number, and keeps what was typed",
      cleared === 0 &&
        /cannot send messages just yet/.test(result.text) &&
        !/has been sent/.test(result.text) &&
        result.links.length === 2 &&
        result.kept === "Asha",
      JSON.stringify(result),
    );
    // the trap for robots is never reached by the keyboard
    await page.evaluate(() => document.querySelector("input[name=firstName]").focus());
    let trapped = false;
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press("Tab");
      if (await page.evaluate(() => document.activeElement?.getAttribute("name") === "website")) trapped = true;
    }
    ok("contact: 14 Tab presses through the form never land on the hidden robot field", !trapped);
    ok("contact (1920): no console errors or warnings", errors.length === 0, JSON.stringify(errors.slice(0, 2)));
    await context.close();
  }

  // every width: no sideways overflow, the form ABOVE the details below 1024 (full width, no space at its left) and beside them from 1024
  for (const [width, height] of [
    [360, 740],
    [390, 844],
    [768, 1024],
    [1024, 768],
    [1280, 720],
    [1536, 864],
  ]) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 140)));
    page.on("console", (m) => SMALL_ERRORS(errors, m));
    await page.goto(BASE + "/contact-us", { waitUntil: "load" });
    await page.waitForTimeout(2500);
    const layout = await page.evaluate(() => {
      const r = (s) => document.querySelector(s).getBoundingClientRect();
      const address = r("address");
      const form = r("form");
      const card = r("h1").width;
      return {
        overflow: document.documentElement.scrollWidth - innerWidth,
        beside: form.left >= address.right - 1 && Math.abs(form.top - address.top) < 40,
        under: address.top >= form.bottom - 1,
        formFillsColumn: Math.abs(form.left - address.left) <= 1 && Math.abs(form.right - address.right) <= 1,
        formInside: form.right <= innerWidth + 1 && form.left >= -1,
        h1Inside: card <= innerWidth,
        photoH: Math.round(r("[data-hero-photo]").height),
      };
    });
    const wide = width >= 1024;
    ok(
      `contact (${width}): no sideways overflow, the form is ${wide ? "beside" : "above, filling the width of,"} the details, the photo is ${layout.photoH}px high`,
      layout.overflow <= 0 &&
        layout.formInside &&
        layout.h1Inside &&
        (wide ? layout.beside : layout.under && layout.formFillsColumn) &&
        layout.photoH >= 295,
      JSON.stringify(layout),
    );
    ok(`contact (${width}): no console errors or warnings`, errors.length === 0, JSON.stringify(errors.slice(0, 2)));
    await context.close();
  }

  // The form must fit a phone whatever the browser's default width for a text field is (the `size` attribute: 20 characters, wider on some devices and
  // systems). A grid column never shrinks below the minimum width of its content, so the phone row once pushed the whole form out of the page (owner,
  // 2026-11-03: "the contact form is not responsive and causes a sideways scroll on my phone"; CI caught it, a Windows machine did not). Widening
  // the fields here is that device.
  for (const [width, height] of [
    [320, 640],
    [360, 740],
    [390, 844],
  ]) {
    for (const size of [20, 30, 40]) {
      const context = await browser.newContext({ viewport: { width, height }, hasTouch: true, isMobile: true });
      const page = await context.newPage();
      await page.goto(BASE + "/contact-us", { waitUntil: "load" });
      await page.waitForTimeout(2000);
      await page.evaluate(
        (size) => document.querySelectorAll("form input").forEach((input) => input.setAttribute("size", String(size))),
        size,
      );
      await page.waitForTimeout(300);
      const fit = await page.evaluate(() => {
        const form = document.querySelector("form").getBoundingClientRect();
        const widest = Math.max(...[...document.querySelectorAll("form *")].map((el) => el.getBoundingClientRect().right));
        return {
          overflow: document.documentElement.scrollWidth - innerWidth,
          formRight: Math.round(form.right),
          widest: Math.round(widest),
          screen: innerWidth,
        };
      });
      ok(
        `contact (${width}, text fields ${size} characters wide by default): the form and everything in it stays inside the screen`,
        fit.overflow <= 0 && fit.formRight <= fit.screen && fit.widest <= fit.screen,
        JSON.stringify(fit),
      );
      await context.close();
    }
  }

  // the menu's "Contact us" links lead here
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 993 } });
    const page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForTimeout(2500);
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.waitForTimeout(2700);
    const hrefs = await page.evaluate(() =>
      [...document.querySelectorAll("#site-menu a")].filter((a) => /contact/i.test(a.textContent)).map((a) => a.getAttribute("href")),
    );
    ok(
      'menu: both "Contact us" links point to /contact-us',
      hrefs.length === 2 && hrefs.every((h) => h === "/contact-us"),
      JSON.stringify(hrefs),
    );
    await page
      .locator("#site-menu a", { hasText: /^contact us$/i })
      .first()
      .click();
    await page.waitForTimeout(1500);
    ok("menu: following it opens the Contact page and closes the menu", new URL(page.url()).pathname === "/contact-us", page.url());
    await context.close();
  }
}

// ---------------------------------------------------------------- 12. The Principal's Welcome page (owner, 2026-11-02): the text-only hero, the message, the call to action and the photo strip
{
  const quiet = (errors, m) => {
    if (["error", "warning"].includes(m.type()) && !/preloaded using link preload|Download the React/.test(m.text()))
      errors.push(m.text().slice(0, 140));
  };
  const box = (page, selector) =>
    page.evaluate((s) => {
      const b = document.querySelector(s).getBoundingClientRect();
      return { x: Math.round(b.left), y: Math.round(b.top + scrollY), w: Math.round(b.width), h: Math.round(b.height) };
    }, selector);
  const HERO = "section[aria-label='From the Principal’s desk']";
  const LETTER = "section[aria-label='A message from the Principal']";

  // desktop 1920 x 993: the geometry of the Figma frame (node 5748:2), measured from the page top (the header is the first 74px)
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 993 } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 140)));
    page.on("console", (m) => quiet(errors, m));
    await page.goto(BASE + "/principals-welcome", { waitUntil: "load" });
    await page.waitForTimeout(3500);

    const pill = await box(page, `${HERO} p`);
    const h1 = await box(page, "h1");
    const sub = await box(page, "h1 + p");
    const rule = await box(page, `${HERO} [aria-hidden='true']`);
    ok(
      "principal (1920): the text-only hero: pill, heading on ONE line (924 x 58), line of text and the crest rule are where Figma has them",
      near(pill.y, 166, 3) &&
        near(pill.x + pill.w / 2, 960, 2) &&
        near(h1.y, 215, 3) &&
        near(h1.w, 924, 10) &&
        near(h1.h, 58, 2) &&
        near(sub.y, 283, 3) &&
        near(rule.y, 377, 3) &&
        near(rule.h, 46, 1),
      JSON.stringify({ pill, h1, sub, rule }),
    );
    const photoInHero = await page.evaluate((s) => document.querySelectorAll(`${s} [data-hero-photo]`).length, HERO);
    ok("principal: the hero has no photo", photoInHero === 0);

    await page.evaluate(() => window.scrollTo(0, 440));
    await page.waitForTimeout(2800);
    const portrait = await box(page, "[data-message-photo]");
    const h2 = await box(page, `${LETTER} h2`);
    ok(
      "principal (1920): the portrait is 777 x 816 on the left, the quotation heading starts 37px to its right and is 40px type on one line",
      near(portrait.x, 200, 2) &&
        near(portrait.y, 538, 3) &&
        near(portrait.w, 777, 2) &&
        near(portrait.h, 816, 2) &&
        near(h2.x, 1014, 3) &&
        near(h2.h, 48, 2),
      JSON.stringify({ portrait, h2 }),
    );
    const letter = await page.evaluate((s) => {
      const paragraphs = [...document.querySelectorAll(`${s} p[data-message-item]`)];
      const lines = (p) => Math.round(p.getBoundingClientRect().height / parseFloat(getComputedStyle(p).lineHeight));
      const sig = document.querySelector(`${s} [data-message-item]:last-child p`);
      return {
        count: paragraphs.length,
        lines: paragraphs.map(lines),
        widest: Math.round(Math.max(...paragraphs.map((p) => p.getBoundingClientRect().width))),
        sigStyle: sig ? getComputedStyle(sig).fontStyle + " " + getComputedStyle(sig).fontWeight : "",
        italicLoaded: [...document.fonts].some((f) => f.style === "italic" && f.weight === "700" && f.status === "loaded"),
        visible: paragraphs.every((p) => Number(getComputedStyle(p).opacity) === 1),
      };
    }, LETTER);
    ok(
      "principal (1920): five paragraphs break their lines where the design does (4, 4, 4, 4 and 5 lines, no wider than 697px), and the entrance has finished",
      letter.count === 5 && JSON.stringify(letter.lines) === JSON.stringify([4, 4, 4, 4, 5]) && letter.widest <= 698 && letter.visible,
      JSON.stringify(letter),
    );
    ok(
      "principal: the name under the letter is bold italic, and the italic font file was fetched for it",
      letter.sigStyle === "italic 700" && letter.italicLoaded,
      letter.sigStyle + ", loaded " + letter.italicLoaded,
    );

    await page.evaluate(() => window.scrollTo(0, 1400));
    await page.waitForTimeout(3000);
    const cta = await box(page, "section[aria-label='Admissions'] > div > div");
    const tile = await page.evaluate(() => {
      const li = document.querySelector("section[aria-label='Life at Learning Paths School in pictures'] li");
      const b = li.getBoundingClientRect();
      return { y: Math.round(b.top + scrollY), w: Math.round(b.width) };
    });
    const footer = await box(page, "footer");
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    ok(
      "principal (1920): the call to action is 1520 x 335 at 120px under the letter, the photo strip 120px under it and touching the footer",
      near(cta.y, 1474, 4) &&
        near(cta.w, 1520, 2) &&
        near(cta.h, 335, 3) &&
        near(tile.y, 1929, 4) &&
        near(tile.w, 320, 2) &&
        near(footer.y, 2249, 4) &&
        near(total, 2995, 8),
      JSON.stringify({ cta, tile, footerTop: footer.y, total }),
    );
    const ctaShown = await page.evaluate(() => {
      const items = [...document.querySelectorAll("section[aria-label='Admissions'] [data-cta-item]")];
      return items.length > 0 && items.every((el) => Number(getComputedStyle(el).opacity) === 1);
    });
    ok("principal: the call to action's entrance has finished (text and button visible)", ctaShown);
    ok("principal (1920): no console errors or warnings", errors.length === 0, JSON.stringify(errors.slice(0, 2)));
    await context.close();
  }

  // reduced motion: everything is simply there
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 993 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(BASE + "/principals-welcome", { waitUntil: "load" });
    await page.waitForTimeout(2000);
    const shown = await page.evaluate(() => {
      const els = [...document.querySelectorAll("[data-hero-item], [data-message-item], [data-message-photo]")];
      return {
        n: els.length,
        hidden: els.filter((el) => Number(getComputedStyle(el).opacity) < 1 || getComputedStyle(el).visibility === "hidden").length,
      };
    });
    ok(
      "principal (reduced motion): nothing is hidden, nothing waits for an entrance",
      shown.n > 8 && shown.hidden === 0,
      JSON.stringify(shown),
    );
    await context.close();
  }

  // every width: no sideways overflow, the portrait above the letter below 1024 and beside it from 1024, the heading never wider than the screen
  for (const [width, height] of [
    [360, 740],
    [390, 844],
    [768, 1024],
    [1024, 768],
    [1280, 720],
    [1536, 864],
  ]) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 140)));
    page.on("console", (m) => quiet(errors, m));
    await page.goto(BASE + "/principals-welcome", { waitUntil: "load" });
    await page.waitForTimeout(2500);
    const layout = await page.evaluate((s) => {
      const r = (q) => document.querySelector(q).getBoundingClientRect();
      const photo = r("[data-message-photo]");
      const h2 = r(`${s} h2`);
      const h1 = r("h1");
      return {
        overflow: document.documentElement.scrollWidth - innerWidth,
        beside: h2.left >= photo.right - 1 && h2.top < photo.bottom,
        above: h2.top >= photo.bottom - 1,
        insideScreen: h1.left >= -1 && h1.right <= innerWidth + 1 && photo.left >= -1 && photo.right <= innerWidth + 1,
        h1Lines: Math.round(h1.height / parseFloat(getComputedStyle(document.querySelector("h1")).lineHeight)),
      };
    }, LETTER);
    const wide = width >= 1024;
    ok(
      `principal (${width}): no sideways overflow, the portrait is ${wide ? "beside" : "above"} the letter, the heading is ${layout.h1Lines} line(s)`,
      layout.overflow <= 0 && layout.insideScreen && (wide ? layout.beside : layout.above),
      JSON.stringify(layout),
    );
    ok(`principal (${width}): no console errors or warnings`, errors.length === 0, JSON.stringify(errors.slice(0, 2)));
    await context.close();
  }

  // the menu's "Principal's Welcome" link leads here
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 993 } });
    const page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForTimeout(2500);
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.waitForTimeout(2700);
    const href = await page.evaluate(() =>
      [...document.querySelectorAll("#site-menu a")].find((a) => /principal/i.test(a.textContent))?.getAttribute("href"),
    );
    ok('menu: "Principal’s Welcome" points to /principals-welcome', href === "/principals-welcome", String(href));
    await page
      .locator("#site-menu a", { hasText: /principal/i })
      .first()
      .click();
    await page.waitForTimeout(1500);
    ok("menu: following it opens the Principal's Welcome page", new URL(page.url()).pathname === "/principals-welcome", page.url());
    await context.close();
  }
}

// ---------------------------------------------------------------- 13. The hero below 1024px is a normal swipe slider; the LPS 360 Framework is hidden on phones (owner, 2026-11-02)
// Phones and tablets: the hero is not pinned, a finger drags the slides and they snap, a vertical swipe scrolls the page, the dots and autoplay work,
// and the scroll-driven scene comes right after it. From 1024px nothing changed (pinned hero). The Framework is display:none below 768px only.
{
  const touch = (cdp, type, x, y) =>
    cdp.send("Input.dispatchTouchEvent", { type, touchPoints: type === "touchEnd" ? [] : [{ x, y, id: 1 }] });
  const swipe = async (cdp, from, to, ms = 220) => {
    await touch(cdp, "touchStart", from[0], from[1]);
    for (let i = 1; i <= 12; i++) {
      await touch(cdp, "touchMove", from[0] + ((to[0] - from[0]) * i) / 12, from[1] + ((to[1] - from[1]) * i) / 12);
      await new Promise((resolve) => setTimeout(resolve, ms / 12));
    }
    await touch(cdp, "touchEnd", to[0], to[1]);
  };
  const HERO = 'section[aria-roledescription="carousel"]';
  const DOTS = `${HERO} button[aria-label^="Go to slide"]`;

  for (const [label, width, height, framework] of [
    ["phone 390", 390, 844, "none"],
    ["tablet 768", 768, 1024, "block"],
    ["tablet landscape 1000", 1000, 700, "block"],
  ]) {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 140)));
    const cdp = await context.newCDPSession(page);
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForTimeout(2500);
    const state = () =>
      page.evaluate(
        ([hero, dots]) => {
          const section = document.querySelector(hero);
          return {
            slide: [...document.querySelectorAll(dots)].findIndex((d) => d.getAttribute("aria-current") === "true"),
            x: Math.round(new DOMMatrix(getComputedStyle(section.firstElementChild).transform).m41),
            scrollY: Math.round(scrollY),
            pinned: Boolean(section.closest(".pin-spacer")),
          };
        },
        [HERO, DOTS],
      );
    const settle = (ms = 1200) => page.waitForTimeout(ms);
    const toFirst = async () => {
      await page.evaluate((dots) => document.querySelectorAll(dots)[0].click(), DOTS);
      await settle(1000);
    };

    await toFirst();
    ok(`${label}: the hero is not pinned (it is an ordinary slider)`, !(await state()).pinned);

    await swipe(cdp, [width * 0.8, height * 0.5], [width * 0.2, height * 0.5]);
    await settle();
    let now = await state();
    ok(
      `${label}: swiping left shows the next slide, which sits exactly on the screen`,
      now.slide === 1 && now.x === -width,
      JSON.stringify(now),
    );
    await swipe(cdp, [width * 0.2, height * 0.5], [width * 0.8, height * 0.5]);
    await settle();
    now = await state();
    ok(`${label}: swiping right goes back`, now.slide === 0 && now.x === 0, JSON.stringify(now));

    await swipe(cdp, [width * 0.5, height * 0.5], [width * 0.5 - width * 0.08, height * 0.5], 600);
    await settle();
    now = await state();
    ok(`${label}: a short, slow drag springs back to the same slide`, now.slide === 0 && now.x === 0, JSON.stringify(now));

    await swipe(cdp, [width * 0.2, height * 0.5], [width * 0.8, height * 0.5]);
    await settle(1000);
    now = await state();
    ok(`${label}: swiping right on the first slide goes nowhere`, now.slide === 0 && now.x === 0, JSON.stringify(now));

    await swipe(cdp, [width * 0.5, height * 0.75], [width * 0.5, height * 0.2], 300);
    await settle();
    now = await state();
    ok(
      `${label}: a vertical swipe scrolls the page and does not change the slide`,
      now.slide === 0 && now.scrollY > 100,
      JSON.stringify(now),
    );
    await page.evaluate(() => window.scrollTo(0, 0));
    await settle(800);

    // a slide change is under way (a dot, half way through) when a finger goes down on the hero and starts scrolling the page: the slider must
    // still end up ON a slide, not between two (it used to stay half way until autoplay skipped one)
    await page.evaluate((dots) => document.querySelectorAll(dots)[1].click(), DOTS);
    await page.waitForTimeout(170);
    await swipe(cdp, [width * 0.5, height * 0.7], [width * 0.5, height * 0.3], 200);
    await settle(1500);
    now = await state();
    ok(
      `${label}: a finger that starts scrolling in the middle of a slide change does not leave the slider between two slides`,
      Math.abs(now.x) % width === 0,
      JSON.stringify(now),
    );
    await page.evaluate(() => window.scrollTo(0, 0));
    await settle(800);

    await page.evaluate((dots) => document.querySelectorAll(dots)[2].click(), DOTS);
    await settle();
    now = await state();
    ok(`${label}: a dot goes to its slide`, now.slide === 2 && now.x === -2 * width, JSON.stringify(now));

    await toFirst();
    await page.waitForTimeout(6000);
    now = await state();
    ok(`${label}: autoplay moves on by itself`, now.slide !== 0, JSON.stringify(now));

    const fw = await page.evaluate(() => {
      const section = [...document.querySelectorAll("section")].find((el) =>
        /LPS 360 framework/i.test(el.getAttribute("aria-label") ?? ""),
      );
      return section ? getComputedStyle(section).display : null;
    });
    ok(`${label}: the LPS 360 Framework is ${framework === "none" ? "hidden" : "shown"}`, fw === framework, String(fw));
    ok(`${label}: no page errors`, errors.length === 0, JSON.stringify(errors));
    await context.close();
  }

  // a desktop screen: the hero is still the pinned, scroll-controlled one, and the Framework is shown
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 993 } });
    const page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForTimeout(2500);
    const desktop = await page.evaluate((hero) => {
      const section = [...document.querySelectorAll("section")].find((el) =>
        /LPS 360 framework/i.test(el.getAttribute("aria-label") ?? ""),
      );
      return {
        pinned: Boolean(document.querySelector(hero)?.closest(".pin-spacer")),
        framework: section ? getComputedStyle(section).display : null,
      };
    }, HERO);
    ok(
      "desktop 1920: the hero is still pinned and the LPS 360 Framework is shown",
      desktop.pinned && desktop.framework === "block",
      JSON.stringify(desktop),
    );
    await context.close();
  }
}

// ---------------------------------------------------------------- 14. The menu does not twitch the page when it opens (owner, 2026-11-02)
// The menu locks the page's scroll, which removes the page's scrollbar. On a desktop with classic scrollbars the page behind used to jump 7.5px
// sideways in the first frame and the menu panel changed width by 15px (the whole canvas twitched). The page now reserves the scrollbar's space
// (scrollbar-gutter: stable), so nothing changes width. This check needs REAL scrollbars, so it has its own browser, and no gutter override.
{
  const real = await chromium.launch({ channel: "chrome", ignoreDefaultArgs: ["--hide-scrollbars"] });
  for (const path of ["/", "/contact-us"]) {
    const context = await real.newContext({ viewport: { width: 1920, height: 993 } });
    const page = await context.newPage();
    await page.goto(BASE + path, { waitUntil: "load" });
    await page.mouse.move(1000, 600);
    await page.waitForTimeout(3500);
    const scrollbar = await page.evaluate(() => innerWidth - document.documentElement.clientWidth);
    const widths = new Set();
    const headerX = new Set();
    for (let round = 0; round < 3; round++) {
      const seen = await page.evaluate(
        () =>
          new Promise((resolve) => {
            const header = document.querySelector("header [class*=px-gutter]") ?? document.querySelector("header");
            const dialog = document.querySelector('[role="dialog"]');
            const frames = [];
            const t0 = performance.now();
            document.querySelector('button[aria-haspopup="dialog"]').click();
            let closed = false;
            const read = () => {
              const t = performance.now() - t0;
              frames.push([Math.round(dialog.getBoundingClientRect().width), +header.getBoundingClientRect().left.toFixed(1)]);
              if (t > 2200 && !closed) {
                closed = true;
                document.querySelector("[data-menu-close]").click();
              }
              if (t < 3600) requestAnimationFrame(read);
              else resolve(frames);
            };
            read();
          }),
      );
      for (const [w, x] of seen) {
        widths.add(w);
        headerX.add(x);
      }
      await page.waitForTimeout(1200);
    }
    ok(
      `menu on ${path}: opening and closing it three times never changes the menu's width or moves the page behind it (a classic page scrollbar of ${scrollbar}px is on)`,
      scrollbar > 0 && widths.size === 1 && headerX.size === 1,
      JSON.stringify({ scrollbar, widths: [...widths], headerX: [...headerX] }),
    );
    await context.close();
  }
  await real.close();
}

// ---------------------------------------------------------------- 15. The Partnerships page (owner, 2026-11-03): the text-only hero, the partner cards, the call to action and the photo strip
{
  const quiet = (errors, m) => {
    if (["error", "warning"].includes(m.type()) && !/preloaded using link preload|Download the React/.test(m.text()))
      errors.push(m.text().slice(0, 140));
  };
  const box = (page, selector) =>
    page.evaluate((s) => {
      const b = document.querySelector(s).getBoundingClientRect();
      return { x: +b.left.toFixed(1), y: +(b.top + scrollY).toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) };
    }, selector);
  const HERO = "section[aria-label='Our partnerships']";

  // Where Figma (node 5751:769) puts, inside each of the eight 494px cards: the logo box (x, y, w, h) and the label's top
  const FIGMA_CARDS = [
    { logo: [108, 35, 278, 46], label: 124 },
    { logo: [118.5, 35, 257, 62], label: 133 },
    { logo: [155, 35, 184, 72], label: 137 },
    { logo: [143, 35, 208, 63.3], label: 137.5 },
    { logo: [178, 21, 138, 94], label: 138 },
    { logo: [123.5, 35, 247, 56], label: 131 },
    { logo: [134, 23, 226, 78], label: 126.5 },
    { logo: [159, 25, 176, 65], label: 122 },
  ];

  // desktop 1920 x 993: the geometry of the Figma frame (node 5748:505), measured from the page top (the header is the first 74px)
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 993 } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 140)));
    page.on("console", (m) => quiet(errors, m));
    await page.goto(BASE + "/partnerships", { waitUntil: "load" });
    await page.waitForTimeout(3500);

    const pill = await box(page, `${HERO} p`);
    const h1 = await box(page, "h1");
    const rule = await box(page, `${HERO} [aria-hidden='true']`);
    ok(
      "partnerships (1920): the text-only hero: pill, heading on one line and the crest rule are where Figma has them",
      near(pill.y, 166, 3) &&
        near(pill.x + pill.w / 2, 960, 2) &&
        near(h1.y, 215, 3) &&
        near(h1.h, 58, 2) &&
        near(rule.y, 377, 3) &&
        near(rule.h, 46, 1),
      JSON.stringify({ pill, h1, rule }),
    );
    ok(
      "partnerships: the hero has no photo",
      (await page.evaluate((s) => document.querySelectorAll(`${s} [data-hero-photo]`).length, HERO)) === 0,
    );

    await page.evaluate(() => window.scrollTo(0, 560));
    await page.waitForTimeout(3200);
    const intro = await box(page, "[data-partners-intro]");
    ok(
      "partnerships (1920): the introduction is 1520px wide, three lines, 489px from the top (36px under the hero)",
      near(intro.x, 200, 2) && near(intro.w, 1520, 2) && near(intro.y, 489, 3) && near(intro.h, 81, 2),
      JSON.stringify(intro),
    );

    const cards = await page.evaluate(() =>
      [...document.querySelectorAll("[data-partner]")].map((card) => {
        const c = card.getBoundingClientRect();
        const rel = (el) => {
          const b = el.getBoundingClientRect();
          return [+(b.left - c.left).toFixed(1), +(b.top - c.top).toFixed(1), +b.width.toFixed(1), +b.height.toFixed(1)];
        };
        return {
          x: +c.left.toFixed(1),
          y: +(c.top + scrollY).toFixed(1),
          w: +c.width.toFixed(1),
          h: +c.height.toFixed(1),
          logo: rel(card.querySelector("img[alt]:not([alt=''])").parentElement),
          label: rel(card.querySelector("p"))[1],
          loaded: [...card.querySelectorAll("img")].every((img) => img.complete && img.naturalWidth > 0),
        };
      }),
    );
    ok("partnerships (1920): eight cards", cards.length === 8, String(cards.length));
    const rows = [630, 630, 630, 861, 861, 861, 1092, 1092];
    const xs = [200, 712, 1224, 200, 712, 1224, 457, 969];
    ok(
      "partnerships (1920): the cards are 494 x 187, 3 + 3 + 2 (the last row centred), 18px across and 44px down, as Figma has them",
      cards.every((c, i) => near(c.w, 494, 1.5) && near(c.h, 187, 1.5) && near(c.y, rows[i], 3) && near(c.x, xs[i], 3)),
      JSON.stringify(cards.map((c) => [c.x, c.y, c.w, c.h])),
    );
    ok(
      "partnerships (1920): every logo, and every label, sits inside its card where Figma puts it (within 2px)",
      cards.every((c, i) => FIGMA_CARDS[i].logo.every((v, k) => near(c.logo[k], v, 2)) && near(c.label, FIGMA_CARDS[i].label, 2.5)),
      JSON.stringify(cards.map((c, i) => ({ logo: c.logo, label: c.label, figma: FIGMA_CARDS[i] }))),
    );
    ok(
      "partnerships: every logo and divider file has loaded",
      cards.every((c) => c.loaded),
      JSON.stringify(cards.map((c) => c.loaded)),
    );

    const cta = await box(page, "section[aria-label='Admissions']");
    const strip = await page.evaluate(() => {
      const b = document.querySelector("[data-marquee-list] li").getBoundingClientRect();
      return { y: Math.round(b.top + scrollY), h: Math.round(b.height) };
    });
    ok(
      "partnerships (1920): the call to action band starts 131px under the cards (y 1410) and is 335px high, the photo strip is 120px under it (y 1865)",
      near(cta.y + 120, 1410, 3) && near(cta.h - 120, 335, 2) && near(strip.y, 1865, 3) && strip.h === 320,
      JSON.stringify({ cta, strip }),
    );
    ok(
      "partnerships (1920): no sideways overflow, no console errors or warnings",
      (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0 && errors.length === 0,
      JSON.stringify(errors.slice(0, 2)),
    );

    // a card lifts a little under the pointer
    await page.evaluate(() => window.scrollTo(0, 560));
    await page.waitForTimeout(800);
    await page.locator("[data-partner-card]").first().hover();
    await page.waitForTimeout(600);
    const lifted = await page.evaluate(() => getComputedStyle(document.querySelector("[data-partner-card]")).translate);
    ok("partnerships: a card lifts 4px under the pointer", /-4px/.test(lifted), lifted);
    await context.close();
  }

  // every width: no sideways overflow, 3 cards a row from 1024px, 2 from 640px, 1 below; everything of a card stays inside it
  for (const [width, height] of [
    [320, 640],
    [360, 740],
    [390, 844],
    [768, 1024],
    [1024, 768],
    [1280, 720],
    [1536, 864],
  ]) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 140)));
    page.on("console", (m) => quiet(errors, m));
    await page.goto(BASE + "/partnerships", { waitUntil: "load" });
    await page.waitForTimeout(2500);
    const layout = await page.evaluate(() => {
      const cards = [...document.querySelectorAll("[data-partner]")];
      const rects = cards.map((c) => c.getBoundingClientRect());
      const rowTops = [...new Set(rects.map((r) => Math.round(r.top)))];
      const perRow = rowTops.map((t) => rects.filter((r) => Math.round(r.top) === t));
      const last = perRow[perRow.length - 1];
      const lastLeft = Math.min(...last.map((r) => r.left));
      const lastRight = Math.max(...last.map((r) => r.right));
      const inside = cards.every((card, i) => {
        const c = rects[i];
        return [...card.querySelectorAll("img, p")].every((el) => {
          const b = el.getBoundingClientRect();
          return b.left >= c.left - 1 && b.right <= c.right + 1 && b.bottom <= c.bottom + 1;
        });
      });
      const grid = document.querySelector("[data-partner]").parentElement.getBoundingClientRect();
      return {
        overflow: document.documentElement.scrollWidth - innerWidth,
        perRow: perRow.map((r) => r.length),
        lastCentred: Math.abs(lastLeft - grid.left - (grid.right - lastRight)) < 3,
        inside,
        cardW: Math.round(rects[0].width),
        screen: innerWidth,
      };
    });
    const per = width >= 1024 ? 3 : width >= 640 ? 2 : 1;
    const expectedRows = [];
    for (let left = 8; left > 0; left -= per) expectedRows.push(Math.min(per, left));
    ok(
      `partnerships (${width}): no sideways overflow, ${per} card${per > 1 ? "s" : ""} a row${per > 1 ? ", a short last row centred" : ""}, everything of a card inside it`,
      layout.overflow <= 0 && JSON.stringify(layout.perRow) === JSON.stringify(expectedRows) && layout.lastCentred && layout.inside,
      JSON.stringify(layout),
    );
    ok(`partnerships (${width}): no console errors or warnings`, errors.length === 0, JSON.stringify(errors.slice(0, 2)));
    await context.close();
  }

  // reduced motion: nothing is hidden, nothing lifts
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 993 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(BASE + "/partnerships", { waitUntil: "load" });
    await page.waitForTimeout(3000);
    const state = await page.evaluate(() => ({
      hidden: [...document.querySelectorAll("[data-partner], [data-partners-intro]")].filter(
        (el) => Number(getComputedStyle(el).opacity) < 1,
      ).length,
      count: document.querySelectorAll("[data-partner]").length,
    }));
    ok(
      "partnerships (reduced motion): every card and the introduction are shown at once",
      state.count === 8 && state.hidden === 0,
      JSON.stringify(state),
    );
    await context.close();
  }

  // the menu's "Partnerships" link leads here
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 993 } });
    const page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForTimeout(2500);
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.waitForTimeout(2700);
    const href = await page.evaluate(() =>
      [...document.querySelectorAll("#site-menu a")].find((a) => /^partnerships$/i.test(a.textContent.trim()))?.getAttribute("href"),
    );
    ok('menu: "Partnerships" points to /partnerships', href === "/partnerships", String(href));
    await page
      .locator("#site-menu a", { hasText: /^Partnerships$/ })
      .first()
      .click();
    await page.waitForTimeout(1500);
    ok("menu: following it opens the Partnerships page", new URL(page.url()).pathname === "/partnerships", page.url());
    await context.close();
  }
}

// ---------------------------------------------------------------- 16. The Awards & Recognition page (owner, 2026-11-03): the text-only hero and the three award blocks
{
  // (the page is scrolled by script from block to block before any input, so the browser takes each new photo for the page's largest paint and Next.js warns that it is not eager: only a test artefact, the first photo is eager)
  const quiet = (errors, m) => {
    if (
      ["error", "warning"].includes(m.type()) &&
      !/preloaded using link preload|Download the React|Largest Contentful Paint/.test(m.text())
    )
      errors.push(m.text().slice(0, 140));
  };
  const box = (page, selector) =>
    page.evaluate((s) => {
      const b = document.querySelector(s).getBoundingClientRect();
      return { x: +b.left.toFixed(1), y: +(b.top + scrollY).toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) };
    }, selector);
  const HERO = "section[aria-label='Awards and recognition']";

  // desktop 1920 x 993: the geometry of the Figma frame (node 5893:1651), measured from the page top (the header is the first 74px)
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 993 } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 140)));
    page.on("console", (m) => quiet(errors, m));
    await page.goto(BASE + "/awards-recognition", { waitUntil: "load" });
    await page.waitForTimeout(3500);

    const pill = await box(page, `${HERO} p`);
    const h1 = await box(page, "h1");
    const rule = await box(page, `${HERO} [aria-hidden='true']`);
    ok(
      "awards (1920): the text-only hero: pill, heading on one line (about 1131px) and the crest rule are where Figma has them",
      near(pill.y, 166, 3) &&
        near(pill.x + pill.w / 2, 960, 2) &&
        near(h1.y, 215, 3) &&
        near(h1.w, 1131, 14) &&
        near(h1.h, 58, 2) &&
        near(rule.y, 377, 3) &&
        near(rule.h, 46, 1),
      JSON.stringify({ pill, h1, rule }),
    );
    ok(
      "awards: the hero has no photo",
      (await page.evaluate((s) => document.querySelectorAll(`${s} [data-hero-photo]`).length, HERO)) === 0,
    );

    // measure each block while it is on the screen with its entrance finished (a block that scrolls out of view is put back to its hidden start)
    const blocks = [];
    for (let index = 0; index < 3; index++) {
      await page.evaluate((i) => {
        const top = document.querySelectorAll("article")[i].getBoundingClientRect().top + scrollY;
        window.scrollTo(0, top - 80);
      }, index);
      await page.waitForTimeout(2600);
      blocks.push(
        await page.evaluate(
          (i) =>
            [document.querySelectorAll("article")[i]].map((article) => {
              const rect = (el) => {
                const b = el.getBoundingClientRect();
                return [+b.left.toFixed(1), +(b.top + scrollY).toFixed(1), +b.width.toFixed(1), +b.height.toFixed(1)];
              };
              const title = article.querySelector("h2");
              const text = article.querySelector("p");
              const lines = Math.round(text.getBoundingClientRect().height / parseFloat(getComputedStyle(text).lineHeight));
              return {
                photo: rect(article.querySelector("[data-award-photo]")),
                left: rect(article.querySelector("[data-award-laurel='left']")),
                right: rect(article.querySelector("[data-award-laurel='right']")),
                title: rect(title),
                titleSize: getComputedStyle(title).fontSize,
                titleSlant: getComputedStyle(title.firstElementChild).transform,
                text: rect(text),
                lines,
                visible: [...article.querySelectorAll("[data-award-photo], [data-award-laurel], [data-award-text]")].every(
                  (el) => Number(getComputedStyle(el).opacity) === 1,
                ),
                loaded: [...article.querySelectorAll("img")].every((img) => img.complete && img.naturalWidth > 0),
              };
            })[0],
          index,
        ),
      );
    }
    ok("awards (1920): three blocks", blocks.length === 3, String(blocks.length));
    const photoY = [543, 1478, 2401];
    ok(
      "awards (1920): each photo is 924 x 585, centred (x 498), at y 543, 1478 and 2401 (60px between the blocks), as Figma has them",
      blocks.every(
        (b, i) => near(b.photo[0], 498, 2) && near(b.photo[2], 924, 2) && near(b.photo[3], 585, 2) && near(b.photo[1], photoY[i], 3),
      ),
      JSON.stringify(blocks.map((b) => b.photo)),
    );
    const laurelY = [1202, 2125, 3048];
    ok(
      "awards (1920): the two laurels of each block are 78 x 216, 32px in from the photo's edges (x 530 and 1312), at the heights Figma has them",
      blocks.every(
        (b, i) =>
          near(b.left[0], 530, 2) &&
          near(b.right[0], 1312, 2) &&
          near(b.left[2], 78, 1.5) &&
          near(b.left[3], 216, 1.5) &&
          near(b.left[1], laurelY[i], 3) &&
          near(b.right[1], laurelY[i], 3),
      ),
      JSON.stringify(blocks.map((b) => [b.left, b.right])),
    );
    const titleY = [1190, 2138, 3055];
    ok(
      "awards (1920): the titles are 40px type, slanted, centred 7.5px right of the middle (x 469.5 + ...), at the heights Figma has them",
      blocks.every(
        (b, i) =>
          b.titleSize === "40px" &&
          b.titleSlant !== "none" &&
          near(b.title[1], titleY[i], 3) &&
          near(b.title[0] + b.title[2] / 2, 969.5, 4),
      ),
      JSON.stringify(blocks.map((b) => [b.title, b.titleSize, b.titleSlant])),
    );
    const textY = [1268.5, 2216.5, 3133.5];
    ok(
      "awards (1920): the paragraphs break their lines where the design's do (5, 3 and 4 lines), 643, 642 and 659px wide, 31px under the title",
      JSON.stringify(blocks.map((b) => b.lines)) === JSON.stringify([5, 3, 4]) &&
        near(blocks[0].text[2], 643, 2) &&
        near(blocks[1].text[2], 642, 2) &&
        near(blocks[2].text[2], 659, 2) &&
        blocks.every((b, i) => near(b.text[1], textY[i], 3)),
      JSON.stringify(blocks.map((b) => [b.lines, b.text])),
    );
    ok(
      "awards: every photo and laurel has loaded, and every entrance has finished",
      blocks.every((b) => b.loaded && b.visible),
      JSON.stringify(blocks.map((b) => [b.loaded, b.visible])),
    );
    const footer = await page.evaluate(() => Math.round(document.querySelector("footer").getBoundingClientRect().top + scrollY));
    ok("awards (1920): the footer starts at y 3375, 111px under the last block", near(footer, 3375, 4), String(footer));
    ok(
      "awards (1920): no sideways overflow, no console errors or warnings",
      (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0 && errors.length === 0,
      JSON.stringify(errors.slice(0, 2)),
    );
    await context.close();
  }

  // every width: no sideways overflow; from 640px the laurels frame the text and the text never reaches them; below it the laurels are left out
  for (const [width, height] of [
    [320, 640],
    [360, 740],
    [390, 844],
    [768, 1024],
    [1024, 768],
    [1280, 720],
    [1536, 864],
  ]) {
    const context = await browser.newContext({ viewport: { width, height } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 140)));
    page.on("console", (m) => quiet(errors, m));
    await page.goto(BASE + "/awards-recognition", { waitUntil: "load" });
    await page.waitForTimeout(2500);
    const layout = await page.evaluate(() => {
      const framed = innerWidth >= 640;
      const blocks = [...document.querySelectorAll("article")].map((article) => {
        const a = article.getBoundingClientRect();
        const photo = article.querySelector("[data-award-photo]").getBoundingClientRect();
        const text = article.querySelector("p").getBoundingClientRect();
        const left = article.querySelector("[data-award-laurel='left']");
        const right = article.querySelector("[data-award-laurel='right']");
        const laurelsShown = getComputedStyle(left).display !== "none";
        const l = left.getBoundingClientRect();
        const r = right.getBoundingClientRect();
        return {
          shape: Math.abs(photo.width / photo.height - 924 / 585) < 0.01,
          inside: photo.left >= -1 && photo.right <= innerWidth + 1 && text.left >= a.left - 1 && text.right <= a.right + 1,
          laurels: framed
            ? laurelsShown && l.left >= a.left - 1 && r.right <= a.right + 1 && text.left >= l.right - 1 && text.right <= r.left + 1
            : !laurelsShown,
        };
      });
      return { overflow: document.documentElement.scrollWidth - innerWidth, blocks };
    });
    ok(
      `awards (${width}): no sideways overflow, the photos keep their shape, the text stays inside the block${width >= 640 ? " and between the laurels" : ", the laurels are left out"}`,
      layout.overflow <= 0 && layout.blocks.length === 3 && layout.blocks.every((b) => b.shape && b.inside && b.laurels),
      JSON.stringify(layout),
    );
    ok(`awards (${width}): no console errors or warnings`, errors.length === 0, JSON.stringify(errors.slice(0, 2)));
    await context.close();
  }

  // reduced motion: nothing is hidden
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 993 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(BASE + "/awards-recognition", { waitUntil: "load" });
    await page.waitForTimeout(3000);
    const state = await page.evaluate(() => ({
      hidden: [...document.querySelectorAll("[data-award-photo], [data-award-laurel], [data-award-text]")].filter(
        (el) => Number(getComputedStyle(el).opacity) < 1 || getComputedStyle(el).clipPath !== "none",
      ).length,
      blocks: document.querySelectorAll("article").length,
    }));
    ok(
      "awards (reduced motion): every photo, laurel and text is shown at once",
      state.blocks === 3 && state.hidden === 0,
      JSON.stringify(state),
    );
    await context.close();
  }

  // the menu's "Awards & Recognition" link leads here
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 993 } });
    const page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForTimeout(2500);
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.waitForTimeout(2700);
    const href = await page.evaluate(() =>
      [...document.querySelectorAll("#site-menu a")]
        .find((a) => /^awards\s*&\s*recognition$/i.test(a.textContent.trim()))
        ?.getAttribute("href"),
    );
    ok('menu: "Awards & Recognition" points to /awards-recognition', href === "/awards-recognition", String(href));
    await page
      .locator("#site-menu a", { hasText: /^Awards & Recognition$/ })
      .first()
      .click();
    await page.waitForTimeout(1500);
    ok("menu: following it opens the Awards & Recognition page", new URL(page.url()).pathname === "/awards-recognition", page.url());
    await context.close();
  }
}

// ---------------------------------------------------------------- 17. Entrances ask the browser for a smooth move (owner, 2026-11-03: "whenever we show anything with a fade it shakes a little")
// Without will-change Chrome draws a moving element's text on whole pixels (it rises in steps, stalls and snaps at the end). The shared reveal hook
// (src/lib/useScrollReveal.ts) puts will-change on what an entrance animates when it plays and keeps it while the section is on the screen (taking it off at the
// end of the entrance made the CTA button's label jump 1px: the owner saw the button "grow"); it takes it off when the section is out of sight. The smoothness
// itself was measured in the browser's own frames (docs/06-changelog.md); this checks the wiring in a real page.
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(BASE + "/partnerships", { waitUntil: "load" });
  await page.waitForTimeout(3000);
  const samples = await page.evaluate(async () => {
    const band = document.querySelector("[data-cta-item]").closest("div.relative.overflow-clip");
    const heading = band.querySelector("h2");
    const top = band.getBoundingClientRect().top + scrollY;
    window.scrollTo(0, top - innerHeight * 0.95); // just above it: not played yet
    await new Promise((r) => setTimeout(r, 1200));
    const before = getComputedStyle(heading).willChange;
    const out = [];
    const t0 = performance.now();
    window.scrollTo(0, top - innerHeight * 0.35); // lands on it: the entrance plays
    await new Promise((resolve) => {
      const tick = () => {
        const style = getComputedStyle(heading);
        out.push([style.willChange, +style.opacity]);
        if (performance.now() - t0 < 3500) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
    // then scroll far away from the band (it is put back to its hidden start, nobody sees it) and read it again
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 1500));
    return { before, out, after: getComputedStyle(heading).willChange };
  });
  const fading = samples.out.filter(([, opacity]) => opacity > 0.02 && opacity < 0.98);
  ok("entrance: the CTA heading is not promoted before its entrance plays", samples.before === "auto", samples.before);
  ok(
    "entrance: the CTA heading has will-change: transform, opacity for the whole time it fades in",
    fading.length > 4 && fading.every(([w]) => /transform/.test(w) && /opacity/.test(w)),
    `${fading.length} frames, ${[...new Set(fading.map(([w]) => w))].join(" | ")}`,
  );
  ok(
    "entrance: ... and it is still on when the entrance is over and the band is on the screen (dropping it makes the text jump by a pixel)",
    /transform/.test(samples.out.at(-1)[0]) && samples.out.at(-1)[1] === 1,
    JSON.stringify(samples.out.at(-1)),
  );
  ok(
    "entrance: ... and it is taken off when the band has been scrolled out of sight (no layers kept for the whole page)",
    samples.after === "auto",
    samples.after,
  );
  await context.close();
}

// ---------------------------------------------------------------- 18. No animated text is left without its own layer (owner, 2026-11-03: "the same thing may be happening on other sections")
// Text that script moves is drawn on whole pixels and snaps when the move ends, unless it is on its own layer (will-change: transform): docs/04-animation-guidelines.md.
// Scroll each inner page like a visitor; at every stop, every text element that GSAP has animated and that is on the screen must have will-change with transform.
// (Any new animated text that skips the shared reveal fails here. The home page's pinned, scroll-driven scenes are not checked: their text moves with the wheel.)
{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  for (const path of ["/partnerships", "/awards-recognition", "/principals-welcome"]) {
    await page.goto(BASE + path, { waitUntil: "load" });
    await page.waitForTimeout(3000);
    await page.mouse.move(720, 450);
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    const offenders = new Set();
    let seen = 0;
    for (let i = 0, y = 0; y < height - 900 && i < 30; i++) {
      await page.mouse.wheel(0, 500);
      await page.waitForTimeout(1700); // the entrance plays and settles
      y = await page.evaluate(() => scrollY);
      const stop = await page.evaluate(() => {
        const bad = [];
        let animated = 0;
        for (const el of document.querySelectorAll("main *")) {
          if (!/translate: none; rotate: none; scale: none/.test(el.getAttribute("style") ?? "")) continue; // never touched by GSAP
          const r = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          if (r.bottom < 0 || r.top > innerHeight || !r.width || !r.height || style.visibility === "hidden" || +style.opacity === 0)
            continue;
          if (!(el.innerText ?? "").trim()) continue; // only text shows the snap
          animated++;
          if (!/transform/.test(style.willChange))
            bad.push(`<${el.tagName.toLowerCase()}> ${(el.innerText ?? "").trim().slice(0, 24).replace(/\s+/g, " ")}`);
        }
        return { animated, bad };
      });
      seen += stop.animated;
      for (const b of stop.bad) offenders.add(b);
    }
    ok(
      `animated text (${path}): every animated text element on the screen has its own layer`,
      offenders.size === 0 && seen > 0,
      offenders.size ? `${offenders.size} without: ${[...offenders].slice(0, 3).join(" ; ")}` : `${seen} sightings, none without`,
    );
  }
  await context.close();
}

// ---------------------------------------------------------------- 19. The Ecosystem tabs on a cold start: a slow or failing photo never leaves an empty box (owner, 2026-11-03)
// "On the first load, switching tabs fast, the images do not change and I have to refresh." The photos of the tabs come through a serverless function that can be
// cold (one took 15 s). The old code waited 2 s, then showed the tab anyway, dropped the old photo and left an empty box, for good when the request failed.
// Now the old photo stays until the new one has loaded (src/lib/loadPhoto.ts: no time limit, three attempts). Here every photo of the section is held back
// (slow) or fails twice before it works; the box must show a loaded photo at every moment after the first one, and end on the photo of the chosen tab.
{
  for (const mode of ["slow", "fails twice"]) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    const tries = new Map();
    await page.route("**/*ecosystem*.avif*", async (route) => {
      const url = route.request().url();
      tries.set(url, (tries.get(url) ?? 0) + 1);
      if (mode === "slow") await new Promise((r) => setTimeout(r, 4500));
      else if (tries.get(url) <= 2) return route.abort("failed");
      await route.continue();
    });
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForTimeout(2500);
    await page.mouse.move(720, 450);
    for (let i = 0; i < 150; i++) {
      const top = await page.evaluate(() => {
        const s = [...document.querySelectorAll("section")].find((x) => /ecosystem/i.test(x.getAttribute("aria-label") ?? ""));
        window.__eco = s;
        return s ? s.getBoundingClientRect().top : 99999;
      });
      if (top < 120) break;
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(60);
    }
    // the first photo has to be there before the test starts (it is held back too)
    const shown = () =>
      page.evaluate(() => {
        const layers = [...window.__eco.querySelectorAll("[data-eco-layer] img")];
        return layers.some((img) => img.complete && img.naturalWidth > 0);
      });
    for (let i = 0; i < 80 && !(await shown()); i++) await page.waitForTimeout(250);
    await page.waitForTimeout(1500);
    // the last tab, clicked at once; then the box is looked at every 250 ms for a while
    await page.evaluate(() => {
      const tabs = [...window.__eco.querySelectorAll("[role=tab]")];
      tabs[tabs.length - 1].click();
    });
    let emptyMoments = 0;
    for (let i = 0; i < 48; i++) {
      await page.waitForTimeout(250);
      if (!(await shown())) emptyMoments++;
    }
    const end = await page.evaluate(() => {
      const tabs = [...window.__eco.querySelectorAll("[role=tab]")];
      const top = window.__eco.querySelector("[data-eco-photo] img");
      const wanted = window.__eco.querySelector("[data-eco-row][data-active] h3")?.textContent ?? "";
      return {
        selected: tabs.findIndex((t) => t.getAttribute("aria-selected") === "true") === tabs.length - 1,
        topLoaded: !!top && top.complete && top.naturalWidth > 0,
        topSrc: top?.getAttribute("src")?.split("/").pop() ?? "",
        title: wanted.slice(0, 24),
        layers: window.__eco.querySelectorAll("[data-eco-layer]").length,
      };
    });
    ok(
      `ecosystem tabs (${mode} photos): the photo box is never empty while the new photo comes`,
      emptyMoments === 0,
      `${emptyMoments} empty moments of 48`,
    );
    ok(
      `ecosystem tabs (${mode} photos): it ends on the chosen tab's photo, loaded, without a refresh`,
      end.selected && end.topLoaded && end.layers === 1,
      JSON.stringify(end),
    );
    await context.close();
  }
}

// ---------------------------------------------------------------- 20. The Student Council page (owner, 2026-11-04): the text-only hero, the wide photo, the three rows and the group photo
{
  const quiet = (errors, m) => {
    if (["error", "warning"].includes(m.type()) && !/preloaded using link preload|Download the React/.test(m.text()))
      errors.push(m.text().slice(0, 140));
  };
  const box = (page, selector) =>
    page.evaluate((s) => {
      const b = document.querySelector(s).getBoundingClientRect();
      return { x: +b.left.toFixed(1), y: +(b.top + scrollY).toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) };
    }, selector);
  const HERO = "section[aria-label='Student council']";
  const INTRO = "section[aria-label='Early leadership']";
  const ROWS = "section[aria-label='How the Student Council works']";
  const GALLERY = "section[aria-label='The Student Council']";

  // desktop 1920 x 993: the geometry of the Figma frame (node 5896:2063), measured from the page top (the header is the first 74px)
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 993 } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 140)));
    page.on("console", (m) => quiet(errors, m));
    await page.goto(BASE + "/student-council", { waitUntil: "load" });
    await page.waitForTimeout(3500);

    const pill = await box(page, `${HERO} p`);
    const h1 = await box(page, "h1");
    const rule = await box(page, `${HERO} [aria-hidden='true']`);
    ok(
      "student council (1920): the text-only hero: pill, heading on one line and the crest rule are where Figma has them",
      near(pill.y, 166, 3) &&
        near(pill.x + pill.w / 2, 960, 2) &&
        near(h1.y, 215, 3) &&
        near(h1.h, 58, 2) &&
        near(rule.y, 377, 3) &&
        near(rule.h, 46, 1),
      JSON.stringify({ pill, h1, rule }),
    );
    ok(
      "student council: the hero has no photo",
      (await page.evaluate((s) => document.querySelectorAll(`${s} [data-hero-photo]`).length, HERO)) === 0,
    );

    // each part is measured while it is on the screen with its entrance finished (a part that scrolls out of view is put back to its hidden start)
    const measure = async (selector, fn, arg) => {
      await page.evaluate((s) => {
        const top = document.querySelector(s).getBoundingClientRect().top + scrollY;
        window.scrollTo(0, top - 80);
      }, selector);
      await page.waitForTimeout(2600);
      return page.evaluate(fn, arg);
    };

    const intro = await measure(
      INTRO,
      (s) => {
        const rect = (el) => {
          const b = el.getBoundingClientRect();
          return [+b.left.toFixed(1), +(b.top + scrollY).toFixed(1), +b.width.toFixed(1), +b.height.toFixed(1)];
        };
        const root = document.querySelector(s);
        const p = root.querySelector("p");
        return {
          photo: rect(root.querySelector("[data-banner-photo]")),
          title: rect(root.querySelector("h2")),
          titleSize: getComputedStyle(root.querySelector("h2")).fontSize,
          slant: getComputedStyle(root.querySelector("h2 span")).transform,
          text: rect(p),
          lines: Math.round(p.getBoundingClientRect().height / parseFloat(getComputedStyle(p).lineHeight)),
          visible: [...root.querySelectorAll("[data-banner-photo], [data-banner-text]")].every(
            (el) => Number(getComputedStyle(el).opacity) === 1,
          ),
          loaded: [...root.querySelectorAll("img")].every((img) => img.complete && img.naturalWidth > 0),
        };
      },
      INTRO,
    );
    ok(
      "student council (1920): the wide photo is 1520 x 723 at x 200, y 483, as Figma has it",
      near(intro.photo[0], 200, 2) && near(intro.photo[1], 483, 3) && near(intro.photo[2], 1520, 2) && near(intro.photo[3], 723, 2),
      JSON.stringify(intro.photo),
    );
    ok(
      "student council (1920): under it the title (40px, 60px below the photo, blue part slanted) and a 1221px paragraph of 3 lines, 16px under the title, centred",
      intro.titleSize === "40px" &&
        intro.slant !== "none" &&
        near(intro.title[1], 1266, 3) &&
        near(intro.title[3], 48, 2) &&
        near(intro.text[1], 1330, 3) &&
        near(intro.text[2], 1221, 2) &&
        near(intro.text[0], 349.5, 2) &&
        intro.lines === 3,
      JSON.stringify({ title: intro.title, text: intro.text, lines: intro.lines }),
    );
    ok(
      "student council: the wide photo and the text have appeared and the photo has loaded",
      intro.visible && intro.loaded,
      JSON.stringify([intro.visible, intro.loaded]),
    );

    // the three rows
    const rows = [];
    for (let i = 0; i < 3; i++) {
      rows.push(
        await measure(
          `${ROWS} article:nth-of-type(${i + 1})`,
          ([s, i]) => {
            const rect = (el) => {
              const b = el.getBoundingClientRect();
              return [+b.left.toFixed(1), +(b.top + scrollY).toFixed(1), +b.width.toFixed(1), +b.height.toFixed(1)];
            };
            const row = document.querySelectorAll(`${s} article`)[i];
            const p = row.querySelector("p");
            return {
              photo: rect(row.querySelector("[data-feature-photo]")),
              title: rect(row.querySelector("h2")),
              titleSize: getComputedStyle(row.querySelector("h2")).fontSize,
              slant: getComputedStyle(row.querySelector("h2 span")).transform,
              rule: rect(row.querySelector("span[aria-hidden='true']")),
              text: rect(p),
              lines: Math.round(p.getBoundingClientRect().height / parseFloat(getComputedStyle(p).lineHeight)),
              visible: [...row.querySelectorAll("[data-feature-photo], [data-feature-text]")].every(
                (el) => Number(getComputedStyle(el).opacity) === 1,
              ),
              loaded: [...row.querySelectorAll("img")].every((img) => img.complete && img.naturalWidth > 0),
            };
          },
          [ROWS, i],
        ),
      );
    }
    const photoY = [1531, 2156, 2781];
    ok(
      "student council (1920): each row's photo is 777 x 565 at x 241.5, at y 1531, 2156 and 2781 (60px between the rows), as Figma has them",
      rows.every(
        (r, i) => near(r.photo[0], 241.5, 2) && near(r.photo[2], 777, 2) && near(r.photo[3], 565, 2) && near(r.photo[1], photoY[i], 3),
      ),
      JSON.stringify(rows.map((r) => r.photo)),
    );
    const titleY = [1664.5, 2276, 2901];
    const ruleY = [1793.5, 2405, 3030];
    const textY = [1827.5, 2439, 3064];
    const textX = [1099.5, 1099.5, 1106.5];
    const textW = [532, 532, 572];
    ok(
      "student council (1920): the headings are 40px type, slanted, in a two-line box (95px), at the heights Figma has them",
      rows.every((r, i) => r.titleSize === "40px" && r.slant !== "none" && near(r.title[1], titleY[i], 3) && near(r.title[3], 95, 3)),
      JSON.stringify(rows.map((r) => [r.title, r.titleSize])),
    );
    ok(
      "student council (1920): the thin rule is 517px wide, 34px under the heading box, and the paragraph 34px under the rule, at the places Figma has them",
      rows.every(
        (r, i) => near(r.rule[2], 517, 2) && near(r.rule[1], ruleY[i], 3) && near(r.text[1], textY[i], 3) && near(r.rule[0], textX[i], 2),
      ),
      JSON.stringify(rows.map((r) => [r.rule, r.text[1]])),
    );
    ok(
      "student council (1920): the text columns are 532, 532 and 572px wide, 81, 81 and 88px from the photo, and the paragraphs break into 5, 6 and 6 lines like the design's",
      rows.every((r, i) => near(r.text[2], textW[i], 2) && near(r.text[0], textX[i], 2)) &&
        JSON.stringify(rows.map((r) => r.lines)) === JSON.stringify([5, 6, 6]),
      JSON.stringify(rows.map((r) => [r.text[0], r.text[2], r.lines])),
    );
    ok(
      "student council: every row's photo has loaded and every entrance has finished",
      rows.every((r) => r.loaded && r.visible),
      JSON.stringify(rows.map((r) => [r.loaded, r.visible])),
    );

    const gallery = await measure(
      GALLERY,
      (s) => {
        const rect = (el) => {
          const b = el.getBoundingClientRect();
          return [+b.left.toFixed(1), +(b.top + scrollY).toFixed(1), +b.width.toFixed(1), +b.height.toFixed(1)];
        };
        const root = document.querySelector(s);
        const title = root.querySelector("h2");
        return {
          title: rect(title),
          titleCentre: Math.round(title.getBoundingClientRect().left + title.getBoundingClientRect().width / 2),
          photo: rect(root.querySelector("[data-banner-photo]")),
          visible: [...root.querySelectorAll("[data-banner-photo], [data-banner-text]")].every(
            (el) => Number(getComputedStyle(el).opacity) === 1,
          ),
          loaded: [...root.querySelectorAll("img")].every((img) => img.complete && img.naturalWidth > 0),
        };
      },
      GALLERY,
    );
    ok(
      "student council (1920): the title is centred at y 3466 and the group photo is 1520 x 782 at y 3543, 29px under it, as Figma has it",
      near(gallery.title[1], 3466, 3) &&
        near(gallery.title[3], 48, 2) &&
        near(gallery.titleCentre, 960, 3) &&
        near(gallery.photo[0], 200, 2) &&
        near(gallery.photo[1], 3543, 3) &&
        near(gallery.photo[2], 1520, 2) &&
        near(gallery.photo[3], 782, 2),
      JSON.stringify(gallery),
    );
    ok(
      "student council: the group photo has loaded and appeared",
      gallery.visible && gallery.loaded,
      JSON.stringify([gallery.visible, gallery.loaded]),
    );
    const footer = await page.evaluate(() => Math.round(document.querySelector("footer").getBoundingClientRect().top + scrollY));
    ok("student council (1920): the footer starts at y 4445, 120px under the group photo", near(footer, 4445, 4), String(footer));
    ok(
      "student council (1920): no sideways overflow, no console errors or warnings",
      (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0 && errors.length === 0,
      JSON.stringify(errors.slice(0, 2)),
    );
    await context.close();
  }

  // every width: no sideways overflow; the photos keep their shape; from 1024px the rows are a photo and a column of text side by side, below it the text is under the photo
  for (const [width, height] of [
    [320, 640],
    [360, 740],
    [390, 844],
    [768, 1024],
    [1024, 768],
    [1280, 720],
    [1536, 864],
  ]) {
    // (reduced motion: no hidden start positions, so the layout itself is measured)
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 140)));
    page.on("console", (m) => quiet(errors, m));
    await page.goto(BASE + "/student-council", { waitUntil: "load" });
    await page.waitForTimeout(2500);
    const layout = await page.evaluate(() => {
      const side = innerWidth >= 1024;
      const rows = [...document.querySelectorAll("article")].map((row) => {
        const photo = row.querySelector("[data-feature-photo]").getBoundingClientRect();
        const title = row.querySelector("h2").getBoundingClientRect();
        const text = row.querySelector("p").getBoundingClientRect();
        const a = row.getBoundingClientRect();
        return {
          shape: Math.abs(photo.width / photo.height - 777 / 565) < 0.01,
          inside:
            photo.left >= -1 &&
            photo.right <= innerWidth + 1 &&
            text.left >= a.left - 1 &&
            text.right <= a.right + 1 &&
            title.right <= a.right + 1,
          arrangement: side
            ? text.left >= photo.right - 1 && Math.abs(photo.top + photo.height / 2 - (title.top + (text.bottom - title.top) / 2)) < 4
            : text.top >= photo.bottom - 1,
        };
      });
      const banners = [...document.querySelectorAll("[data-banner-photo]")].map((photo) => {
        const b = photo.getBoundingClientRect();
        return { shape: b.width / b.height > 1.9 && b.width / b.height < 2.2, inside: b.left >= -1 && b.right <= innerWidth + 1 };
      });
      return { overflow: document.documentElement.scrollWidth - innerWidth, rows, banners };
    });
    ok(
      `student council (${width}): no sideways overflow, the photos keep their shape, ${width >= 1024 ? "each row is a photo with its text beside it, centred on it" : "each row's text is under its photo"}`,
      layout.overflow <= 0 &&
        layout.rows.length === 3 &&
        layout.banners.length === 2 &&
        layout.rows.every((r) => r.shape && r.inside && r.arrangement) &&
        layout.banners.every((b) => b.shape && b.inside),
      JSON.stringify(layout),
    );
    ok(`student council (${width}): no console errors or warnings`, errors.length === 0, JSON.stringify(errors.slice(0, 2)));
    await context.close();
  }

  // reduced motion: nothing is hidden
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 993 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(BASE + "/student-council", { waitUntil: "load" });
    await page.waitForTimeout(3000);
    const state = await page.evaluate(() => ({
      hidden: [...document.querySelectorAll("[data-banner-photo], [data-banner-text], [data-feature-photo], [data-feature-text]")].filter(
        (el) => Number(getComputedStyle(el).opacity) < 1 || getComputedStyle(el).clipPath !== "none",
      ).length,
      parts: document.querySelectorAll("[data-banner-photo], [data-feature-photo]").length,
    }));
    ok(
      "student council (reduced motion): every photo and text is shown at once",
      state.parts === 5 && state.hidden === 0,
      JSON.stringify(state),
    );
    await context.close();
  }

  // the menu's "Student Council" link leads here
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 993 } });
    const page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForTimeout(2500);
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.waitForTimeout(2700);
    const href = await page.evaluate(() =>
      [...document.querySelectorAll("#site-menu a")].find((a) => /^student council$/i.test(a.textContent.trim()))?.getAttribute("href"),
    );
    ok('menu: "Student Council" points to /student-council', href === "/student-council", String(href));
    await page
      .locator("#site-menu a", { hasText: /^Student Council$/ })
      .first()
      .click();
    await page.waitForTimeout(1500);
    ok("menu: following it opens the Student Council page", new URL(page.url()).pathname === "/student-council", page.url());
    await context.close();
  }
}

// ---------------------------------------------------------------- 21. The Signature Events page (owner, 2026-11-04): the text-only hero and the nine events, the photo changing sides
{
  const quiet = (errors, m) => {
    if (["error", "warning"].includes(m.type()) && !/preloaded using link preload|Download the React/.test(m.text()))
      errors.push(m.text().slice(0, 140));
  };
  const box = (page, selector) =>
    page.evaluate((s) => {
      const b = document.querySelector(s).getBoundingClientRect();
      return { x: +b.left.toFixed(1), y: +(b.top + scrollY).toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) };
    }, selector);
  const HERO = "section[aria-label='Signature events']";
  const EVENTS = "section[aria-label='The signature events of Learning Paths School']";

  // desktop 1920 x 993: the geometry of the Figma frame (node 5894:1875), measured from the page top (the header is the first 74px)
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 993 } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 140)));
    page.on("console", (m) => quiet(errors, m));
    await page.goto(BASE + "/signature-events", { waitUntil: "load" });
    await page.waitForTimeout(3500);

    const pill = await box(page, `${HERO} p`);
    const h1 = await box(page, "h1");
    const rule = await box(page, `${HERO} [aria-hidden='true']`);
    ok(
      "signature events (1920): the text-only hero: pill, heading on one line and the crest rule are where Figma has them",
      near(pill.y, 166, 3) &&
        near(pill.x + pill.w / 2, 960, 2) &&
        near(h1.y, 215, 3) &&
        near(h1.h, 58, 2) &&
        near(rule.y, 377, 3) &&
        near(rule.h, 46, 1),
      JSON.stringify({ pill, h1, rule }),
    );
    ok(
      "signature events: the hero has no photo",
      (await page.evaluate((s) => document.querySelectorAll(`${s} [data-hero-photo]`).length, HERO)) === 0,
    );

    // each row is measured while it is on the screen with its entrance finished (a part that scrolls out of view is put back to its hidden start)
    const rows = [];
    for (let i = 0; i < 9; i++) {
      await page.evaluate(
        ([s, i]) => {
          const top = document.querySelectorAll(`${s} article`)[i].getBoundingClientRect().top + scrollY;
          window.scrollTo(0, top - 80);
        },
        [EVENTS, i],
      );
      await page.waitForTimeout(2600);
      rows.push(
        await page.evaluate(
          ([s, i]) => {
            const rect = (el) => {
              const b = el.getBoundingClientRect();
              return [+b.left.toFixed(1), +(b.top + scrollY).toFixed(1), +b.width.toFixed(1), +b.height.toFixed(1)];
            };
            const row = document.querySelectorAll(`${s} article`)[i];
            const p = row.querySelector("p");
            const h2 = row.querySelector("h2");
            return {
              photo: rect(row.querySelector("[data-row-photo]")),
              title: rect(h2),
              titleSize: getComputedStyle(h2).fontSize,
              slant: getComputedStyle(h2.querySelector("span")).transform,
              text: rect(p),
              lines: Math.round(p.getBoundingClientRect().height / parseFloat(getComputedStyle(p).lineHeight)),
              visible: [...row.querySelectorAll("[data-row-photo], [data-row-text]")].every(
                (el) => Number(getComputedStyle(el).opacity) === 1,
              ),
              loaded: [...row.querySelectorAll("img")].every((img) => img.complete && img.naturalWidth > 0),
            };
          },
          [EVENTS, i],
        ),
      );
    }
    ok(
      "signature events (1920): nine photos of 818 x 523, touching, from y 523, on the right in the first row and then alternating, as Figma has them",
      rows.every(
        (r, i) =>
          near(r.photo[0], i % 2 === 0 ? 902 : 200, 2) &&
          near(r.photo[2], 818, 2) &&
          near(r.photo[3], 523, 2) &&
          near(r.photo[1], 523 + 523 * i, 3),
      ),
      JSON.stringify(rows.map((r) => r.photo)),
    );
    const groupTop = [682.2, 1195, 1704.5, 2251.2, 2764, 3297.2, 3833.7, 4343.2, 4825.7];
    const titleLines = [1, 2, 2, 1, 2, 1, 1, 1, 1];
    ok(
      "signature events (1920): the headings are 40px type, slanted, one or two lines (48 or 95px) as Figma breaks them, at the heights Figma has them",
      rows.every(
        (r, i) =>
          r.titleSize === "40px" && r.slant !== "none" && near(r.title[1], groupTop[i], 3) && near(r.title[3], titleLines[i] * 47.5, 3),
      ),
      JSON.stringify(rows.map((r) => [r.title, r.titleSize])),
    );
    const textX = [200, 1156, 200, 1156, 200, 1156, 200, 1156, 200];
    const paragraphLines = [5, 4, 5, 5, 4, 5, 4, 5, 8];
    ok(
      "signature events (1920): the paragraphs are 564px wide, 22px under the heading, in the column beside the photo (138px away), and break into 5, 4, 5, 5, 4, 5, 4, 5 and 8 lines like the design's",
      rows.every((r, i) => near(r.text[2], 564, 2) && near(r.text[0], textX[i], 2) && near(r.text[1], r.title[1] + r.title[3] + 22, 3)) &&
        JSON.stringify(rows.map((r) => r.lines)) === JSON.stringify(paragraphLines),
      JSON.stringify(rows.map((r) => [r.text[0], r.text[2], r.lines])),
    );
    ok(
      "signature events (1920): each column of text is centred on its photo's height",
      rows.every((r) => Math.abs(r.photo[1] + r.photo[3] / 2 - (r.title[1] + (r.text[1] + r.text[3] - r.title[1]) / 2)) < 3),
      JSON.stringify(rows.map((r) => [r.photo[1] + r.photo[3] / 2, r.title[1] + (r.text[1] + r.text[3] - r.title[1]) / 2])),
    );
    ok(
      "signature events: every photo has loaded and every entrance has finished",
      rows.every((r) => r.loaded && r.visible),
      JSON.stringify(rows.map((r) => [r.loaded, r.visible])),
    );

    const footer = await page.evaluate(() => Math.round(document.querySelector("footer").getBoundingClientRect().top + scrollY));
    ok("signature events (1920): the footer starts at y 5357, 127px under the last photo", near(footer, 5357, 4), String(footer));
    ok(
      "signature events (1920): no sideways overflow, no console errors or warnings",
      (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0 && errors.length === 0,
      JSON.stringify(errors.slice(0, 2)),
    );
    await context.close();
  }

  // every width: no sideways overflow; the photos keep their shape; from 1024px the rows are a photo and a column of text side by side, alternating, below it the text is under the photo
  for (const [width, height] of [
    [320, 640],
    [360, 740],
    [390, 844],
    [768, 1024],
    [1024, 768],
    [1280, 720],
    [1536, 864],
  ]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 140)));
    page.on("console", (m) => quiet(errors, m));
    await page.goto(BASE + "/signature-events", { waitUntil: "load" });
    await page.waitForTimeout(2500);
    const layout = await page.evaluate(() => {
      const side = innerWidth >= 1024;
      const rows = [...document.querySelectorAll("article")].map((row, i) => {
        const photo = row.querySelector("[data-row-photo]").getBoundingClientRect();
        const title = row.querySelector("h2").getBoundingClientRect();
        const text = row.querySelector("p").getBoundingClientRect();
        const a = row.getBoundingClientRect();
        const photoRight = i % 2 === 0;
        return {
          shape: Math.abs(photo.width / photo.height - 818 / 523) < 0.01,
          inside: photo.left >= -1 && photo.right <= innerWidth + 1 && text.left >= a.left - 1 && text.right <= a.right + 1,
          arrangement: side
            ? (photoRight ? photo.left >= text.right - 1 : text.left >= photo.right - 1) &&
              Math.abs(photo.top + photo.height / 2 - (title.top + (text.bottom - title.top) / 2)) < 4
            : text.top >= photo.bottom - 1,
        };
      });
      return { overflow: document.documentElement.scrollWidth - innerWidth, rows };
    });
    ok(
      `signature events (${width}): no sideways overflow, the photos keep their shape, ${width >= 1024 ? "each row is a photo with its text beside it (sides alternating), centred on it" : "each row's text is under its photo"}`,
      layout.overflow <= 0 && layout.rows.length === 9 && layout.rows.every((r) => r.shape && r.inside && r.arrangement),
      JSON.stringify(layout),
    );
    ok(`signature events (${width}): no console errors or warnings`, errors.length === 0, JSON.stringify(errors.slice(0, 2)));
    await context.close();
  }

  // reduced motion: nothing is hidden
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 993 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(BASE + "/signature-events", { waitUntil: "load" });
    await page.waitForTimeout(3000);
    const state = await page.evaluate(() => ({
      hidden: [...document.querySelectorAll("[data-row-photo], [data-row-text]")].filter(
        (el) => Number(getComputedStyle(el).opacity) < 1 || getComputedStyle(el).clipPath !== "none",
      ).length,
      parts: document.querySelectorAll("[data-row-photo]").length,
    }));
    ok(
      "signature events (reduced motion): every photo and text is shown at once",
      state.parts === 9 && state.hidden === 0,
      JSON.stringify(state),
    );
    await context.close();
  }

  // the menu's "Signature Events" link leads here
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 993 } });
    const page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForTimeout(2500);
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.waitForTimeout(2700);
    const href = await page.evaluate(() =>
      [...document.querySelectorAll("#site-menu a")].find((a) => /^signature events$/i.test(a.textContent.trim()))?.getAttribute("href"),
    );
    ok('menu: "Signature Events" points to /signature-events', href === "/signature-events", String(href));
    await page
      .locator("#site-menu a", { hasText: /^Signature Events$/ })
      .first()
      .click();
    await page.waitForTimeout(1500);
    ok("menu: following it opens the Signature Events page", new URL(page.url()).pathname === "/signature-events", page.url());
    await context.close();
  }
}

// ---------------------------------------------------------------- 22. The Welcome to LPS page (owner, 2026-11-04): the photo hero, the introduction, the wide photo, Vision and Mission, the Principal's welcome, the values (active on hover), the pinned story
{
  const quiet = (errors, m) => {
    if (["error", "warning"].includes(m.type()) && !/preloaded using link preload|Download the React/.test(m.text()))
      errors.push(m.text().slice(0, 140));
  };
  const rectOf = (page, selector, inside) =>
    page.evaluate(
      ([s, i]) => {
        const root = i ? document.querySelector(i) : document;
        const b = root.querySelector(s).getBoundingClientRect();
        return { x: +b.left.toFixed(1), y: +(b.top + scrollY).toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) };
      },
      [selector, inside ?? null],
    );
  const HERO = "section[aria-label='About us']";
  const INTRO = "section[aria-label='About Learning Paths School']";
  const BANNER = "section[aria-label='The LPS community']";
  const CRESTS = "section[aria-label='Our vision and mission']";
  const WELCOME = "section[aria-label='Welcome to Learning Paths School']";
  const VALUES = "section[aria-label='Our values']";
  const STORY = "section[aria-label='Our story']";
  // the Figma frame (node 5688:14367) has its hero photo at y 72, this site's under the 74px header: every y below is the design's + 2
  const Y0 = 2;

  // desktop 1920 x 993: the geometry of the Figma frame
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 993 } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 140)));
    page.on("console", (m) => quiet(errors, m));
    await page.goto(BASE + "/welcome-to-lps", { waitUntil: "load" });
    await page.waitForTimeout(3500);

    // each part is measured while it is on the screen with its entrance finished (a part that scrolls out of view is put back to its hidden start)
    const show = async (selector) => {
      await page.evaluate((s) => window.scrollTo(0, document.querySelector(s).getBoundingClientRect().top + scrollY - 80), selector);
      await page.waitForTimeout(2600);
    };

    const photo = await rectOf(page, "[data-hero-photo]", HERO);
    const pill = await rectOf(page, "p", HERO);
    const h1 = await rectOf(page, "h1", HERO);
    const rule = await rectOf(page, "[aria-hidden='true']", HERO);
    ok(
      "welcome (1920): the hero photo is 1920 x 736 under the header, the pill, the heading (one line) and the crest rule are where Figma has them",
      near(photo.x, 0) &&
        near(photo.y, 74, 2) &&
        near(photo.w, 1920) &&
        near(photo.h, 736, 2) &&
        near(pill.y, 728 + Y0, 3) &&
        near(pill.x + pill.w / 2, 960, 2) &&
        near(h1.y, 776 + Y0, 3) &&
        near(h1.h, 58, 2) &&
        near(rule.y, 933 + Y0, 3) &&
        near(rule.h, 46, 1),
      JSON.stringify({ photo, pill, h1, rule }),
    );
    const card = await rectOf(page, ".bg-brand-snow", HERO);
    ok(
      "welcome (1920): the hero's card is the roomy one: 371px high, 60px under the rule",
      near(card.h, 371, 2.5) && near(card.y + card.h - (rule.y + rule.h), 60, 2),
      JSON.stringify({ card, rule }),
    );

    await show(INTRO);
    const paragraphs = await page.evaluate(
      (s) =>
        [...document.querySelectorAll(`${s} p`)].map((p) => {
          const b = p.getBoundingClientRect();
          return {
            x: +b.left.toFixed(1),
            y: +(b.top + scrollY).toFixed(1),
            w: +b.width.toFixed(1),
            h: +b.height.toFixed(1),
            opacity: getComputedStyle(p).opacity,
          };
        }),
      INTRO,
    );
    ok(
      "welcome (1920): the two paragraphs are 1185px wide, centred, at y 1099 and 1165, 2 and 4 lines (54px and 108px)",
      paragraphs.length === 2 &&
        paragraphs.every((p) => near(p.w, 1185, 2) && near(p.x + p.w / 2, 960, 2) && p.opacity === "1") &&
        near(paragraphs[0].y, 1099 + Y0, 3) &&
        near(paragraphs[1].y, 1165 + Y0, 3) &&
        near(paragraphs[0].h, 54, 2) &&
        near(paragraphs[1].h, 108, 2),
      JSON.stringify(paragraphs),
    );

    await show(BANNER);
    const banner = await rectOf(page, "[data-banner-photo]", BANNER);
    ok(
      "welcome (1920): the wide photo is 1520 x 737 at x 200, y 1335, 60px under the text, with no title under it",
      near(banner.x, 200, 2) &&
        near(banner.y, 1335 + Y0, 3) &&
        near(banner.w, 1520, 2) &&
        near(banner.h, 737, 2) &&
        (await page.evaluate((s) => document.querySelectorAll(`${s} h2, ${s} p`).length, BANNER)) === 0,
      JSON.stringify(banner),
    );

    await show(CRESTS);
    const crests = await page.evaluate(
      (s) =>
        [...document.querySelectorAll(`${s} li`)].map((li) => {
          const rect = (el) => {
            const b = el.getBoundingClientRect();
            return { x: +b.left.toFixed(1), y: +(b.top + scrollY).toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) };
          };
          const h2 = li.querySelector("h2");
          return {
            li: rect(li),
            crest: rect(li.querySelector("[data-crest]")),
            h2: rect(h2),
            p: rect(li.querySelector("p")),
            size: getComputedStyle(h2).fontSize,
            slant: getComputedStyle(h2.querySelector("span")).transform,
            loaded: [...li.querySelectorAll("img")].every((img) => img.complete && img.naturalWidth > 0),
          };
        }),
      CRESTS,
    );
    ok(
      "welcome (1920): Our Vision and Our Mission are cards 485px wide, 138px apart, with the crest 365 x 313 (x 466 and 1089, y 2192), the title centred over it on two lines (40px, slanted, 95px box) and the paragraph 24px under it",
      crests.length === 2 &&
        crests.every(
          (c) =>
            near(c.li.w, 485, 2) &&
            near(c.crest.w, 365, 2) &&
            near(c.crest.h, 313, 2) &&
            near(c.crest.y, 2192 + Y0, 3) &&
            c.size === "40px" &&
            c.slant !== "none" &&
            near(c.h2.h, 95, 3) &&
            near(c.p.y, c.crest.y + 313 + 24, 3) &&
            c.loaded,
        ) &&
        near(crests[0].crest.x, 466, 2.5) &&
        near(crests[1].crest.x, 1089, 2.5) &&
        near(crests[0].h2.y, 2192 + Y0 + 145, 3) &&
        near(crests[0].h2.w, 132.4, 2) &&
        near(crests[1].h2.w, 200.8, 2) &&
        near(crests[0].p.w, 423, 2) &&
        near(crests[1].p.w, 365, 2) &&
        near(crests[0].p.h, 81, 2),
      JSON.stringify(crests),
    );

    // the entrance moves the titles (GSAP): a resize AFTER it must leave them centred over their crests (an earlier version centred them with a transform, whose
    // percentages GSAP froze in pixels at the first width: 28px off centre at 360px after the window had been wider)
    {
      const wideContext = await browser.newContext({ viewport: { width: 1920, height: 993 } });
      const wide = await wideContext.newPage();
      await wide.goto(BASE + "/welcome-to-lps", { waitUntil: "load" });
      await wide.evaluate((s) => document.querySelector(s).scrollIntoView(), CRESTS);
      await wide.waitForTimeout(2500);
      const off = [];
      for (const width of [360, 320, 390, 800, 1200]) {
        await wide.setViewportSize({ width, height: 700 });
        await wide.waitForTimeout(1500);
        const offsets = await wide.evaluate(
          (s) =>
            [...document.querySelectorAll(`${s} [data-crest]`)].map((crest) => {
              const c = crest.getBoundingClientRect();
              const t = crest.querySelector("[data-crest-text]").getBoundingClientRect();
              return +(t.left + t.width / 2 - (c.left + c.width / 2)).toFixed(1);
            }),
          CRESTS,
        );
        off.push({ width, offsets });
      }
      await wideContext.close();
      ok(
        "welcome: after a resize from 1920 to 360, 320, 390, 800 and 1200 the titles of Vision and Mission are still centred over their crests (within 1.5px)",
        off.every((o) => o.offsets.length === 2 && o.offsets.every((v) => Math.abs(v) <= 1.5)),
        JSON.stringify(off),
      );
    }

    await show(WELCOME);
    const welcome = await page.evaluate((s) => {
      const root = document.querySelector(s);
      const rect = (el) => {
        const b = el.getBoundingClientRect();
        return { x: +b.left.toFixed(1), y: +(b.top + scrollY).toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) };
      };
      const h2 = root.querySelector("h2");
      return {
        section: rect(root),
        bg: getComputedStyle(root).backgroundColor,
        photo: rect(root.querySelector("[data-message-photo]")),
        h2: rect(h2),
        accent: rect(h2.firstElementChild),
        rule: rect(root.querySelector("[aria-hidden='true']")),
        p: rect(root.querySelector("p")),
        name: rect(root.querySelector("p.italic")),
        loaded: [...root.querySelectorAll("img")].every((img) => img.complete && img.naturalWidth > 0),
      };
    }, WELCOME);
    ok(
      "welcome (1920): the Principal's welcome is a white band 1142px high (y 2730), the portrait 859 x 902 at y 2850, the 512px column 147px from it, centred on it",
      near(welcome.section.y, 2730 + Y0, 3) &&
        near(welcome.section.h, 1142, 2.5) &&
        welcome.bg === "rgb(255, 255, 255)" &&
        near(welcome.photo.y, 2850 + Y0, 3) &&
        near(welcome.photo.w, 859, 2) &&
        near(welcome.photo.h, 902, 2) &&
        near(welcome.h2.x - (welcome.photo.x + welcome.photo.w), 147, 2) &&
        near(welcome.h2.w, 512, 2) &&
        welcome.loaded,
      JSON.stringify(welcome),
    );
    ok(
      "welcome (1920): in the column: the heading on two lines (y 3113), the 493px rule 47px under it, the 515px paragraph 47px under that (3 lines), the name 35px under the paragraph",
      near(welcome.h2.y, 3113.2 + Y0, 3) &&
        near(welcome.h2.h, 108.5, 3) &&
        near(welcome.accent.y - (welcome.h2.y + 48), 13, 3) &&
        near(welcome.rule.w, 493, 1.5) &&
        near(welcome.rule.y + 2 - (welcome.h2.y + welcome.h2.h), 47, 3) &&
        near(welcome.p.y - (welcome.rule.y + 2), 47, 3) &&
        near(welcome.p.w, 515, 3) &&
        near(welcome.p.h, 81, 2) &&
        near(welcome.name.y - (welcome.p.y + welcome.p.h), 35, 2),
      JSON.stringify(welcome),
    );

    // the values: the band is 131px high at y 3872 with "Guided by", the first value active on it, the others listed under it
    await show(VALUES);
    const readValues = () =>
      page.evaluate((s) => {
        const root = document.querySelector(s);
        const rect = (el) => {
          const b = el.getBoundingClientRect();
          return { x: +b.left.toFixed(1), y: +(b.top + scrollY).toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) };
        };
        const band = root.querySelector(".bg-brand-navy");
        const rows = [...root.querySelectorAll("li")].map((li) => {
          const button = li.querySelector("button");
          const text = document.getElementById(button.getAttribute("aria-controls"));
          const line = li.querySelector("span[aria-hidden='true']");
          return {
            button: rect(button),
            color: getComputedStyle(button).color,
            expanded: button.getAttribute("aria-expanded"),
            text: rect(text.firstElementChild),
            textOpacity: getComputedStyle(text).opacity,
            lineOpacity: getComputedStyle(line).opacity,
          };
        });
        return { section: rect(root), band: rect(band), label: rect(root.querySelector("h2")), rows };
      }, VALUES);
    // wait for the band's slide (0.5 s) and the colours (0.3 s) to end
    const settle = (ms = 800) => page.waitForTimeout(ms);
    let v = await readValues();
    ok(
      "welcome (1920): the navy band is 131px high at y 3872 and the first value is the active one on it: white, its text 544px wide at the right (y 3897), no line under it",
      near(v.band.y, 3872 + Y0, 3) &&
        near(v.band.h, 131, 1) &&
        near(v.band.w, 1920, 1) &&
        near(v.label.x, 200, 2) &&
        v.rows[0].expanded === "true" &&
        v.rows[0].color === "rgb(255, 255, 255)" &&
        v.rows[0].textOpacity === "1" &&
        v.rows[0].lineOpacity === "0" &&
        near(v.rows[0].text.w, 544, 2) &&
        near(v.rows[0].text.x + v.rows[0].text.w, 1720, 2) &&
        near(v.rows[0].text.y, 3897 + Y0, 3) &&
        v.rows
          .slice(1)
          .every((r) => r.expanded === "false" && r.textOpacity === "0" && r.lineOpacity === "1" && r.color === "rgb(18, 59, 122)"),
      JSON.stringify(v),
    );
    const titleY = [3914, 4063, 4218.5, 4374];
    ok(
      "welcome (1920): the values are 40px titles 393px in (x 593), 48px high, at y 3914, 4063, 4218.5 and 4374, the list ending 597.6px under the band's top",
      v.rows.every((r, i) => near(r.button.y, titleY[i] + Y0, 3) && near(r.button.x, 593, 2.5) && near(r.button.h, 48, 1.5)) &&
        near(v.section.h, 597.6, 3),
      JSON.stringify(v.rows.map((r) => r.button)),
    );

    // hovering a value (a mouse): the band slides to it, it turns white, its text shows beside it, the first one goes back to blue with its line
    await page.mouse.move(960, 5);
    await page.locator(`${VALUES} li`).nth(2).hover();
    await settle();
    v = await readValues();
    ok(
      "welcome (1920): hovering 'Courage & Excellence' makes it the active one: the band is centred on it (y 4176.5), it is white, its text shows at the right (y 4201.5), the first value is blue again with its line",
      v.rows[2].expanded === "true" &&
        v.rows[0].expanded === "false" &&
        near(v.band.y, 4218.5 + Y0 - 42, 4) &&
        near(v.band.h, 131, 1) &&
        v.rows[2].color === "rgb(255, 255, 255)" &&
        v.rows[2].textOpacity === "1" &&
        near(v.rows[2].text.y, 4201.5 + Y0, 3) &&
        v.rows[0].color === "rgb(18, 59, 122)" &&
        v.rows[0].textOpacity === "0" &&
        v.rows[0].lineOpacity === "1" &&
        v.rows[2].lineOpacity === "0",
      JSON.stringify({ band: v.band, rows: v.rows.map((r) => [r.expanded, r.color, r.textOpacity]) }),
    );
    await page.locator(`${VALUES} li`).nth(3).hover();
    await settle();
    v = await readValues();
    ok(
      "welcome (1920): hovering the last value moves the band to it (y 4332) and leaving the list keeps it active",
      near(v.band.y, 4374 + Y0 - 42, 4) && v.rows[3].expanded === "true",
      JSON.stringify(v.band),
    );
    await page.mouse.move(960, 5);
    await settle(500);
    v = await readValues();
    ok(
      "welcome (1920): the pointer leaving the list changes nothing",
      v.rows[3].expanded === "true" && near(v.band.y, 4374 + Y0 - 42, 4),
      JSON.stringify(v.band),
    );

    // the keyboard: focus makes a value active, ArrowUp and ArrowDown move between them
    await page.locator(`${VALUES} li button`).nth(1).focus();
    await page.keyboard.press("ArrowDown");
    await settle(600);
    v = await readValues();
    ok(
      "welcome (1920): focusing a value makes it active, ArrowDown moves the focus (and the band) to the next one",
      v.rows[2].expanded === "true" && v.rows[1].expanded === "false" && near(v.band.y, 4218.5 + Y0 - 42, 4),
      JSON.stringify(v.rows.map((r) => r.expanded)),
    );

    // the story, in its place before the pin: the Figma geometry
    const storyTop = await page.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + scrollY, STORY);
    await page.evaluate((y) => window.scrollTo(0, y), storyTop - 700);
    await page.waitForTimeout(2200);
    const story = await page.evaluate((s) => {
      const root = document.querySelector(s);
      const rect = (el) => {
        const b = el.getBoundingClientRect();
        return { x: +b.left.toFixed(1), y: +(b.top + scrollY).toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) };
      };
      const first = root.querySelector("[data-slide]");
      const h2 = root.querySelector("h2");
      const lines = [...root.querySelectorAll("[data-slide]")].map(
        (li) =>
          +(
            // the laid-out width (the entrance may be scaling the line from its previous step)
            (li.querySelector("[data-slide-fill]").offsetWidth / li.querySelector("[data-slide-fill]").parentElement.offsetWidth).toFixed(3)
          ),
      );
      const p = first.querySelector("p");
      return {
        section: rect(root),
        bg: getComputedStyle(root).backgroundColor,
        h2: rect(h2),
        h2Centre: Math.round(h2.getBoundingClientRect().left + h2.getBoundingClientRect().width / 2 - 0),
        titleCentre: Math.round(
          (() => {
            const r = document.createRange();
            r.selectNodeContents(h2);
            const b = r.getBoundingClientRect();
            return b.left + b.width / 2;
          })(),
        ),
        photo: rect(first.querySelector("[data-slide-photo]")),
        year: rect(first.querySelector("h3")),
        yearColor: getComputedStyle(first.querySelector("h3")).color,
        p: rect(p),
        tallest: Math.max(...[...root.querySelectorAll("[data-slide-text]")].map((el) => el.getBoundingClientRect().bottom + scrollY)),
        lines,
        slides: root.querySelectorAll("[data-slide]").length,
        pinned: Boolean(root.querySelector(".pin-spacer")),
        loaded: [...first.querySelectorAll("img")].every((img) => img.complete && img.naturalWidth > 0),
      };
    }, STORY);
    ok(
      "welcome (1920): the story is a white band at y 4589.6 with the heading at y 4709.6 centred over the slide (about 1071), the photo 840 x 450 at x 200 (its bottom level with the tallest story), the first story column as in the design",
      near(story.section.y, 4589.6 + Y0, 3) &&
        story.bg === "rgb(255, 255, 255)" &&
        near(story.h2.y, 4709.6 + Y0, 3) &&
        near(story.titleCentre, 1071, 16) &&
        near(story.photo.x, 200, 2) &&
        near(story.photo.y + story.photo.h, story.tallest, 3) &&
        near(story.photo.w, 840, 2) &&
        near(story.photo.h, 450, 2) &&
        near(story.year.x, 1104, 3) &&
        near(story.year.y, 4869.6 + Y0, 3) &&
        story.yearColor === "rgb(51, 136, 69)" &&
        near(story.p.x, 1094, 3) &&
        near(story.p.y, 5024.6 + Y0, 3) &&
        near(story.p.w, 760, 3) &&
        near(story.p.h, 243, 3) &&
        story.loaded,
      JSON.stringify(story),
    );
    ok(
      "welcome: the green part of each slide's timeline is its step of the whole: a third, two thirds, the whole (of three slides)",
      story.slides === 3 && near(story.lines[0], 1 / 3, 0.01) && near(story.lines[1], 2 / 3, 0.01) && near(story.lines[2], 1, 0.01),
      JSON.stringify(story.lines),
    );

    // the pin: the stage is held in the middle of the screen and does NOT move; the photo and the story change in place and the green part of the line grows
    const pin = await page.evaluate((s) => {
      const spacer = document.querySelector(`${s} .pin-spacer`);
      const stage = spacer?.firstElementChild;
      if (!spacer || !stage) return null;
      return {
        top: Math.round(spacer.getBoundingClientRect().top + scrollY),
        length: spacer.offsetHeight - stage.offsetHeight,
        stage: stage.offsetHeight,
      };
    }, STORY);
    ok(
      "welcome (1920): from lg the story is pinned (a pin spacer, about a screen of scrolling per step)",
      Boolean(pin) && pin.length > 1500,
      JSON.stringify(pin),
    );
    if (pin) {
      const start = pin.top - Math.round((993 - pin.stage) / 2);
      const at = async (y) => {
        await page.evaluate((v) => window.scrollTo(0, v), y);
        await page.waitForTimeout(1800);
        return page.evaluate((s) => {
          const root = document.querySelector(s);
          const stage = root.querySelector(".pin-spacer").firstElementChild;
          const slides = [...root.querySelectorAll("[data-slide]")].map((li) => {
            const photo = li.querySelector("[data-slide-photo]");
            const body = li.querySelector("[data-slide-body]");
            const box = photo.getBoundingClientRect();
            const shown = (el) => (getComputedStyle(el).visibility === "hidden" ? 0 : Number(getComputedStyle(el).opacity));
            return { x: Math.round(box.left), bottom: Math.round(box.bottom), photo: shown(photo), body: shown(body) };
          });
          const fill = root.querySelector("[data-slide-fill]");
          const bar = stage.getBoundingClientRect();
          return {
            fixed: getComputedStyle(stage).position === "fixed",
            top: Math.round(bar.top),
            height: Math.round(bar.height),
            fill: fill.getBoundingClientRect().width / fill.parentElement.getBoundingClientRect().width,
            slides,
          };
        }, STORY);
      };
      const first = await at(start + 40);
      ok(
        "welcome (1920): at the start of the pin the stage is held in the middle of the screen (97px from the top and the bottom), only the first slide's photo and story show, the line is a third green",
        first.fixed &&
          near(first.top, (993 - pin.stage) / 2, 3) &&
          first.slides[0].photo > 0.9 &&
          first.slides[0].body > 0.7 &&
          first.slides[1].photo < 0.15 &&
          first.slides[2].photo === 0 &&
          near(first.fill, 1 / 3, 0.03),
        JSON.stringify(first),
      );
      const half = await at(start + pin.length / 2);
      ok(
        "welcome (1920): half way the second slide's photo and story show (the first's are gone), the line is two thirds green, and the stage and the photos have not moved",
        half.fixed &&
          half.top === first.top &&
          half.slides[1].photo > 0.95 &&
          half.slides[1].body > 0.95 &&
          half.slides[0].photo === 0 &&
          half.slides[0].body === 0 &&
          half.slides[2].photo < 0.05 &&
          near(half.fill, 2 / 3, 0.03) &&
          half.slides.every((slide, i) => slide.x === first.slides[i].x && slide.bottom === first.slides[i].bottom),
        JSON.stringify(half),
      );
      const end = await at(start + pin.length);
      ok(
        "welcome (1920): at the end the third slide's photo and story show, the others are gone, the whole line is green, nothing has moved",
        end.slides[2].photo > 0.95 &&
          end.slides[2].body > 0.95 &&
          end.slides[0].photo === 0 &&
          end.slides[1].photo === 0 &&
          near(end.fill, 1, 0.03) &&
          end.slides.every((slide, i) => slide.x === first.slides[i].x && slide.bottom === first.slides[i].bottom),
        JSON.stringify(end),
      );
      const after = await at(start + pin.length + 700);
      ok(
        "welcome (1920): after the last slide the pin is released and the page goes on",
        !after.fixed && after.top < 0,
        JSON.stringify(after),
      );
      const back = await at(start + 40);
      ok(
        "welcome (1920): scrolling back puts the first slide back, with its story, and the line a third green",
        back.fixed && back.slides[0].photo > 0.9 && back.slides[0].body > 0.7 && back.slides[2].photo === 0 && near(back.fill, 1 / 3, 0.03),
        JSON.stringify(back),
      );
    }
    const calls = await page.evaluate(() => ({
      cta: Boolean(document.querySelector("section[aria-label='Admissions']")),
      overflow: document.documentElement.scrollWidth - innerWidth,
    }));
    ok(
      "welcome (1920): the standard call to action follows the story, no sideways overflow, no console errors or warnings",
      calls.cta && calls.overflow <= 0 && errors.length === 0,
      JSON.stringify({ calls, errors: errors.slice(0, 2) }),
    );
    await context.close();
  }

  // every width (reduced motion, so that nothing is mid-entrance): no overflow; the arrangements; the values open on a tap; the story is a swipe row below 1024px and stacked from it
  for (const [width, height] of [
    [320, 640],
    [360, 740],
    [390, 844],
    [768, 1024],
    [1024, 768],
    [1280, 720],
    [1536, 864],
  ]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce", hasTouch: width < 1024 });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 140)));
    page.on("console", (m) => quiet(errors, m));
    await page.goto(BASE + "/welcome-to-lps", { waitUntil: "load" });
    await page.waitForTimeout(2500);
    const side = width >= 1024;
    const layout = await page.evaluate(
      ([side, S]) => {
        const rect = (el) => el.getBoundingClientRect();
        const crests = [...document.querySelectorAll(`${S.crests} li`)].map(rect);
        const welcome = document.querySelector(S.welcome);
        const photo = rect(welcome.querySelector("[data-message-photo]"));
        const text = rect(welcome.querySelector("h2"));
        const values = document.querySelector(S.values);
        const band = rect(values.querySelector(".bg-brand-navy"));
        const firstRow = rect(values.querySelector("li button"));
        const slider = document.querySelector(`${S.story} [data-slide]`).closest("div[class*='overflow']");
        const slides = [...document.querySelectorAll(`${S.story} [data-slide]`)].map(rect);
        const hero = rect(document.querySelector(`${S.hero} [data-hero-photo]`));
        return {
          overflow: document.documentElement.scrollWidth - innerWidth,
          hero: { w: Math.round(hero.width), inside: hero.left >= -1 && hero.right <= innerWidth + 1 },
          crestsRow: side
            ? crests[1].left >= crests[0].right - 1 && Math.abs(crests[0].top - crests[1].top) < 2
            : crests[1].top >= crests[0].bottom - 1,
          crestsInside: crests.every((c) => c.left >= -1 && c.right <= innerWidth + 1),
          welcomeArrangement: side
            ? text.left >= photo.right - 1 &&
              Math.abs(
                photo.top +
                  photo.height / 2 -
                  (text.top + ([...welcome.querySelectorAll("p")].at(-1).getBoundingClientRect().bottom - text.top) / 2),
              ) < 6
            : text.top >= photo.bottom - 1,
          bandOnTop: side ? band.height > 129 && band.height < 133 : firstRow.top >= band.bottom - 1,
          sliderScrolls: slider.scrollWidth > slider.clientWidth + 1,
          sliderTab: slider.getAttribute("tabindex"),
          sliderOverflow: getComputedStyle(slider).overflowX,
          slidesInRow: side
            ? slides[1].top >= slides[0].bottom - 1
            : Math.abs(slides[0].top - slides[1].top) < 2 && slides[1].left >= slides[0].right - 1,
          slideWidth: Math.round(slides[0].width),
        };
      },
      [side, { crests: CRESTS, welcome: WELCOME, values: VALUES, story: STORY, hero: HERO }],
    );
    ok(
      `welcome (${width}): no sideways overflow, the hero photo within the screen, the cards ${side ? "side by side" : "stacked"}, the welcome ${side ? "beside its portrait" : "under its portrait"}, the values ${side ? "on the band" : "listed under the band"}`,
      layout.overflow <= 0 &&
        layout.hero.inside &&
        layout.crestsRow &&
        layout.crestsInside &&
        layout.welcomeArrangement &&
        layout.bandOnTop,
      JSON.stringify(layout),
    );
    ok(
      `welcome (${width}): the story is ${side ? "stacked, one slide under the other (reduced motion)" : "a row to swipe: snapping, a tab stop, each slide at most 86% of the screen wide"}`,
      layout.slidesInRow &&
        (side
          ? layout.sliderOverflow !== "auto" || !layout.sliderScrolls
          : layout.sliderScrolls && layout.sliderTab === "0" && layout.slideWidth <= Math.round(width * 0.86) + 1),
      JSON.stringify({ slidesInRow: layout.slidesInRow, scrolls: layout.sliderScrolls, tab: layout.sliderTab, w: layout.slideWidth }),
    );
    if (!side) {
      // a tap on a value opens it (and closes the one that was open)
      const before = await page.evaluate((s) => document.querySelector(`${s} li button[aria-expanded="true"]`)?.textContent, VALUES);
      await page.locator(`${VALUES} li button`).nth(2).scrollIntoViewIfNeeded();
      await page.locator(`${VALUES} li button`).nth(2).tap();
      await page.waitForTimeout(700);
      const after = await page.evaluate((s) => {
        const buttons = [...document.querySelectorAll(`${s} li button`)];
        const text = (b) => document.getElementById(b.getAttribute("aria-controls")).firstElementChild.getBoundingClientRect().height;
        return { expanded: buttons.map((b) => b.getAttribute("aria-expanded")), heights: buttons.map((b) => Math.round(text(b))) };
      }, VALUES);
      ok(
        `welcome (${width}): the first value is open at the start, a tap opens another and closes it (its text opens under its title)`,
        before === "Courage & Commitment" &&
          after.expanded[2] === "true" &&
          after.expanded[0] === "false" &&
          after.heights[2] > 20 &&
          after.heights[0] === 0,
        JSON.stringify(after),
      );
    }
    ok(`welcome (${width}): no console errors or warnings`, errors.length === 0, JSON.stringify(errors.slice(0, 2)));
    await context.close();
  }

  // reduced motion at 1920: nothing pinned, nothing hidden
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 993 }, reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto(BASE + "/welcome-to-lps", { waitUntil: "load" });
    await page.waitForTimeout(3000);
    const state = await page.evaluate(() => ({
      pins: document.querySelectorAll(".pin-spacer").length,
      hidden: [
        ...document.querySelectorAll(
          "[data-hero-item], [data-intro-item], [data-banner-photo], [data-crest], [data-crest-text], [data-message-item], [data-value-row], [data-slide-text]",
        ),
      ].filter((el) => Number(getComputedStyle(el).opacity) < 1 || getComputedStyle(el).clipPath !== "none").length,
      parts: document.querySelectorAll("[data-crest], [data-value-row], [data-slide]").length,
    }));
    ok(
      "welcome (reduced motion): nothing is pinned or hidden, every part is shown at once",
      state.pins === 0 && state.hidden === 0 && state.parts === 9,
      JSON.stringify(state),
    );
    await context.close();
  }

  // the menu's "Welcome to LPS" link (under About Us) leads here
  {
    const context = await browser.newContext({ viewport: { width: 1920, height: 993 } });
    const page = await context.newPage();
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForTimeout(2500);
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.waitForTimeout(2700);
    const href = await page.evaluate(() =>
      [...document.querySelectorAll("#site-menu a")].find((a) => /^welcome to lps$/i.test(a.textContent.trim()))?.getAttribute("href"),
    );
    ok('menu: "Welcome to LPS" points to /welcome-to-lps', href === "/welcome-to-lps", String(href));
    await page
      .locator("#site-menu a", { hasText: /^Welcome to LPS$/ })
      .first()
      .click();
    await page.waitForTimeout(1500);
    ok("menu: following it opens the Welcome to LPS page", new URL(page.url()).pathname === "/welcome-to-lps", page.url());
    await context.close();
  }
}

console.log(fails ? `\n${fails} CHECK(S) FAILED` : "\nALL INTERACTION CHECKS PASSED");
await browser.close();
process.exitCode = fails ? 1 : 0;
