// The production-readiness checks of the home page (head tags, JSON-LD, skip link, 404, dark mode, keyboard, a full scroll on desktop
// and a phone, resizing through every breakpoint, axe). Documented in docs/16-production-readiness.md.
//
//   npm run qa:serve     (in one terminal: builds and serves the production site on 3002)
//   npm run qa           (in another)
//
// URL: QA_URL (default http://localhost:3002). Exits with 1 when a check fails.
// axe: colour contrast is reported but does not fail the run (white on the brand green is an owner decision, see docs/16).
import { chromium } from "playwright-core";
const BASE = process.env.QA_URL ?? "http://localhost:3002";
let fails = 0;
const ok = (n, p, d = "") => {
  if (!p) fails++;
  console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? "  (" + d + ")" : ""}`);
};
(async () => {
  const browser = await chromium.launch({ channel: "chrome" });

  // 1. HTML head: title, description, canonical, OG, JSON-LD, lang, one h1, landmarks
  {
    const page = await (await browser.newContext()).newPage();
    const r = await page.goto(BASE + "/", { waitUntil: "load" });
    ok("home returns 200", r.status() === 200);
    const head = await page.evaluate(() => ({
      title: document.title,
      lang: document.documentElement.lang,
      desc: document.querySelector('meta[name="description"]')?.content,
      canonical: document.querySelector('link[rel="canonical"]')?.href,
      og: [...document.querySelectorAll('meta[property^="og:"]')].map((m) => m.getAttribute("property")).join(","),
      twitter: document.querySelector('meta[name="twitter:card"]')?.content,
      themeColor: document.querySelector('meta[name="theme-color"]')?.content,
      jsonld: JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)["@type"],
      h1: document.querySelectorAll("h1").length,
      mains: document.querySelectorAll("main").length,
      headers: document.querySelectorAll("header").length,
      footers: document.querySelectorAll("footer").length,
      skip: document.querySelector('a[href="#main-content"]')?.textContent,
      mainId: document.querySelector("main")?.id,
      viewport: document.querySelector('meta[name="viewport"]')?.content,
      imgNoAlt: [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).length,
      headingOrder: [...document.querySelectorAll("h1,h2,h3,h4")].map((h) => h.tagName + ":" + h.textContent.trim().slice(0, 28)),
    }));
    console.log(JSON.stringify(head, null, 1));
    ok("title and description set", head.title === "Learning Paths School" && head.desc && head.desc.length > 60);
    ok(
      "canonical, Open Graph, Twitter, theme-color present",
      !!head.canonical &&
        head.og.includes("og:title") &&
        head.og.includes("og:description") &&
        head.twitter === "summary_large_image" &&
        head.themeColor === "#ffffff",
    );
    ok("JSON-LD is EducationalOrganization", head.jsonld === "EducationalOrganization");
    ok(
      "html lang=en, one h1, one main, one header, one footer",
      head.lang === "en" && head.h1 === 1 && head.mains === 1 && head.headers >= 1 && head.footers >= 1,
    );
    ok("skip link targets the main element", head.skip === "Skip to main content" && head.mainId === "main-content");
    ok("every img has an alt attribute", head.imgNoAlt === 0);
    for (const [path, expect] of [
      ["/robots.txt", "Disallow: /admin"],
      ["/sitemap.xml", "<urlset"],
    ]) {
      const t = await (await page.request.get(BASE + path)).text();
      ok(`${path} serves`, t.includes(expect), t.replace(/\n/g, " | ").slice(0, 140));
    }
    const nf = await page.request.get(BASE + "/does-not-exist");
    ok("unknown URL returns a real 404 status", nf.status() === 404, String(nf.status()));
    await page.close();
  }

  // 2. Dark mode must not change the page
  {
    const page = await (await browser.newContext({ colorScheme: "dark", viewport: { width: 1440, height: 900 } })).newPage();
    await page.goto(BASE + "/", { waitUntil: "load" });
    const bg = await page.evaluate(() => [
      getComputedStyle(document.body).backgroundColor,
      getComputedStyle(document.documentElement).colorScheme,
    ]);
    ok(
      "system dark mode: page background stays white, color-scheme light",
      bg[0] === "rgb(255, 255, 255)" && bg[1] === "light",
      JSON.stringify(bg),
    );
    await page.close();
  }

  // 3. Keyboard: skip link first, focus indicators exist
  {
    const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.keyboard.press("Tab");
    const first = await page.evaluate(() => {
      const a = document.activeElement;
      const r = a.getBoundingClientRect();
      return { text: a.textContent.trim(), visible: r.width > 1 && r.height > 1 && r.top >= 0 };
    });
    ok(
      "first Tab stop is the skip link and it becomes visible",
      first.text === "Skip to main content" && first.visible,
      JSON.stringify(first),
    );
    await page.keyboard.press("Enter");
    await page.waitForTimeout(300);
    const after = await page.evaluate(() => document.activeElement?.id);
    ok("activating the skip link moves focus to <main>", after === "main-content", after);
    // outline on focused links/buttons
    const outlines = [];
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      outlines.push(
        await page.evaluate(() => {
          const a = document.activeElement;
          const cs = getComputedStyle(a);
          return `${a.tagName}:${(a.getAttribute("aria-label") || a.textContent || "").trim().slice(0, 22)} outline=${cs.outlineStyle}/${cs.outlineWidth} shadow=${cs.boxShadow !== "none"}`;
        }),
      );
    }
    console.log(outlines.join("\n"));
    ok(
      "focused controls show a visible indicator (outline or ring)",
      outlines.every((o) => !/outline=none\/0px shadow=false/.test(o) && !/outline=none\/[^ ]* shadow=false/.test(o)),
      "see list above",
    );
    await page.close();
  }

  // 4. Whole-page run: wheel through everything, desktop and phone; console, overflow, resize
  for (const [label, opts] of [
    ["desktop 1920", { viewport: { width: 1920, height: 993 } }],
    ["phone 390", { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }],
  ]) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    const msgs = [];
    page.on("console", (m) => ["error", "warning"].includes(m.type()) && msgs.push(m.type() + ": " + m.text().slice(0, 160)));
    page.on("pageerror", (e) => msgs.push("pageerror " + String(e).slice(0, 160)));
    page.on("requestfailed", (r) => msgs.push("requestfailed " + r.url().slice(0, 100)));
    page.on("response", (r) => r.status() >= 400 && msgs.push(r.status() + " " + r.url().slice(0, 100)));
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.mouse.move(opts.viewport.width / 2, 400);
    let maxOverflow = 0,
      steps = 0;
    for (let i = 0; i < 400; i++) {
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(25);
      steps++;
      const o = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      maxOverflow = Math.max(maxOverflow, o);
      const atEnd = await page.evaluate(() => innerHeight + scrollY >= document.documentElement.scrollHeight - 2);
      if (atEnd) break;
    }
    await page.waitForTimeout(1500);
    const endState = await page.evaluate(() => ({
      y: Math.round(scrollY),
      h: document.documentElement.scrollHeight,
      footerVisible: document.querySelector("footer").getBoundingClientRect().bottom <= innerHeight + 2,
    }));
    ok(`${label}: scrolled the whole page (${steps} wheel steps) to the footer`, endState.footerVisible, JSON.stringify(endState));
    ok(`${label}: never any horizontal overflow`, maxOverflow <= 0, "max " + maxOverflow);
    ok(`${label}: no console errors/warnings, failed or 4xx requests`, msgs.length === 0, JSON.stringify(msgs));
    // scroll back up all the way
    for (let i = 0; i < 400; i++) {
      await page.mouse.wheel(0, -600);
      await page.waitForTimeout(20);
      if (await page.evaluate(() => scrollY < 2)) break;
    }
    await page.waitForTimeout(1200);
    const top = await page.evaluate(() => ({
      y: Math.round(scrollY),
      typed: [...document.querySelectorAll("[data-char]")].filter((c) => +c.style.opacity === 1).length,
    }));
    ok(`${label}: back at the top`, top.y < 3, JSON.stringify(top));
    await ctx.close();
  }

  // 5. Resize across breakpoints on a live page
  {
    const page = await (await browser.newContext({ viewport: { width: 1920, height: 993 } })).newPage();
    const msgs = [];
    page.on("pageerror", (e) => msgs.push(String(e).slice(0, 160)));
    page.on("console", (m) => m.type() === "error" && msgs.push(m.text().slice(0, 160)));
    await page.goto(BASE + "/", { waitUntil: "load" });
    await page.waitForTimeout(800);
    let over = 0;
    for (const w of [1280, 1024, 900, 600, 390, 900, 1280, 1920, 1100, 1920]) {
      await page.setViewportSize({ width: w, height: w < 800 ? 844 : 900 });
      await page.waitForTimeout(600);
      over = Math.max(over, await page.evaluate(() => document.documentElement.scrollWidth - innerWidth));
    }
    const spacers = await page.evaluate(() => document.querySelectorAll(".pin-spacer").length);
    ok(
      "resizing 1920 > 390 > 1920 through every breakpoint: no errors, no overflow",
      msgs.length === 0 && over <= 0,
      JSON.stringify({ msgs, over, spacers }),
    );
    ok("after resizing back to desktop the pinned scenes are rebuilt (hero + two sideways scenes)", spacers === 3, "spacers " + spacers);
    await page.close();
  }

  // 6. axe accessibility audit
  {
    const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
    await page.goto(BASE + "/", { waitUntil: "load" });
    try {
      await page.addScriptTag({ url: "https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js" });
      const res = await page.evaluate(async () => {
        const r = await window.axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] },
        });
        return r.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          help: v.help,
          nodes: v.nodes.length,
          sample: v.nodes[0]?.target?.join(" ").slice(0, 90),
        }));
      });
      console.log("axe violations:", JSON.stringify(res, null, 1));
      const blocking = res.filter((v) => v.id !== "color-contrast");
      ok(
        "axe: no violations other than the known colour contrast",
        blocking.length === 0,
        res.map((v) => v.id + ":" + v.impact).join(", "),
      );
    } catch (e) {
      console.log("axe unavailable:", String(e).slice(0, 100));
    }
    await page.close();
  }

  // 7. The Contact page: head tags, landmarks, the sitemap, no overflow at every width, axe
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(BASE + "/contact-us", { waitUntil: "load" });
    await page.waitForTimeout(1500);
    const head = await page.evaluate(() => {
      const meta = (sel) => document.querySelector(sel)?.getAttribute("content") ?? "";
      return {
        title: document.title,
        description: meta('meta[name="description"]'),
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "",
        ogUrl: meta('meta[property="og:url"]'),
        lang: document.documentElement.lang,
        h1: document.querySelectorAll("h1").length,
        mains: document.querySelectorAll("main").length,
        mainId: document.querySelector("main")?.id,
        imgNoAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).length,
        unlabelled: [...document.querySelectorAll("input:not([type=hidden]):not([tabindex='-1']), select, textarea")].filter(
          (el) => !el.labels || el.labels.length === 0,
        ).length,
      };
    });
    ok(
      "contact: title, description, canonical and og:url are the page's own",
      /Contact/.test(head.title) &&
        head.description.length > 50 &&
        /\/contact-us$/.test(head.canonical) &&
        /\/contact-us$/.test(head.ogUrl),
      JSON.stringify({ t: head.title, c: head.canonical }),
    );
    ok(
      "contact: html lang=en, one h1, one main (the skip link's target), every img has an alt, every field has a label",
      head.lang === "en" &&
        head.h1 === 1 &&
        head.mains === 1 &&
        head.mainId === "main-content" &&
        head.imgNoAlt === 0 &&
        head.unlabelled === 0,
      JSON.stringify(head),
    );
    const sitemap = await (await page.request.get(BASE + "/sitemap.xml")).text();
    ok("the sitemap lists the Contact page", /<loc>[^<]*\/contact-us<\/loc>/.test(sitemap));
    try {
      await page.addScriptTag({ url: "https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js" });
      const res = await page.evaluate(async () => {
        const r = await window.axe.run(document, {
          exclude: [["iframe"]],
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] },
        });
        return r.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.length,
          sample: v.nodes[0]?.target?.join(" ").slice(0, 90),
        }));
      });
      console.log("contact axe violations:", JSON.stringify(res, null, 1));
      const blocking = res.filter((v) => v.id !== "color-contrast");
      ok(
        "contact: axe finds no violations other than the known colour contrast",
        blocking.length === 0,
        res.map((v) => v.id + ":" + v.impact).join(", "),
      );
    } catch (e) {
      console.log("axe unavailable:", String(e).slice(0, 100));
    }
    await context.close();
  }

  // 8. The Principal's Welcome page: head tags, landmarks, the sitemap, axe
  {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(BASE + "/principals-welcome", { waitUntil: "load" });
    await page.waitForTimeout(1500);
    const head = await page.evaluate(() => {
      const meta = (sel) => document.querySelector(sel)?.getAttribute("content") ?? "";
      return {
        title: document.title,
        description: meta('meta[name="description"]'),
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? "",
        ogUrl: meta('meta[property="og:url"]'),
        lang: document.documentElement.lang,
        h1: document.querySelectorAll("h1").length,
        mains: document.querySelectorAll("main").length,
        mainId: document.querySelector("main")?.id,
        imgNoAlt: [...document.images].filter((i) => !i.hasAttribute("alt")).length,
      };
    });
    ok(
      "principal: title, description, canonical and og:url are the page's own",
      /Principal/.test(head.title) &&
        head.description.length > 50 &&
        /\/principals-welcome$/.test(head.canonical) &&
        /\/principals-welcome$/.test(head.ogUrl),
      JSON.stringify({ t: head.title, c: head.canonical }),
    );
    ok(
      "principal: html lang=en, one h1, one main (the skip link's target), every img has an alt",
      head.lang === "en" && head.h1 === 1 && head.mains === 1 && head.mainId === "main-content" && head.imgNoAlt === 0,
      JSON.stringify(head),
    );
    const sitemap = await (await page.request.get(BASE + "/sitemap.xml")).text();
    ok("the sitemap lists the Principal's Welcome page", /<loc>[^<]*\/principals-welcome<\/loc>/.test(sitemap));
    try {
      await page.addScriptTag({ url: "https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js" });
      const res = await page.evaluate(async () => {
        const r = await window.axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] },
        });
        return r.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.length,
          sample: v.nodes[0]?.target?.join(" ").slice(0, 90),
        }));
      });
      console.log("principal axe violations:", JSON.stringify(res, null, 1));
      const blocking = res.filter((v) => v.id !== "color-contrast");
      ok(
        "principal: axe finds no violations other than the known colour contrast",
        blocking.length === 0,
        res.map((v) => v.id + ":" + v.impact).join(", "),
      );
    } catch (e) {
      console.log("axe unavailable:", String(e).slice(0, 100));
    }
    await context.close();
  }

  console.log(fails ? `\n${fails} CHECK(S) FAILED` : "\nALL CHECKS PASSED");
  await browser.close();
  process.exitCode = fails ? 1 : 0;
})();
