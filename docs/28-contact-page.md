# Contact page and the reusable page hero

Figma: file `vmveiWg8pCIGYCrlaqrRLw`, node `5644:9493` ("Contact Us", 1920 x 3223px). The header and the footer of the frame are the site's own (already built). Route: **`/contact-us`** (the CMS global and its cache tag keep the internal name `contact`: `/admin/globals/contact`, `/api/globals/contact`). Built 2026-11-02, **local, not pushed yet** (see "Before it goes live").

| Part | Code |
| --- | --- |
| Route | `src/app/(frontend)/contact-us/page.tsx` (server, static, `revalidate = 3600`) and `ContactPageClient.tsx` (Live Preview) |
| **Reusable hero** | `src/components/sections/shared/PageHero/`, type `src/types/page-hero.ts`, CMS fields `src/globals/shared/page-hero.ts`, mapper `src/lib/api/page-hero-map.ts` |
| Details and form | `src/components/sections/contact/ContactSection/`, `ContactForm/`, rules `src/lib/contact-form.ts`, action `src/lib/actions/contact.ts` |
| Map | `src/components/sections/contact/ContactMap/`, `src/lib/map-embed.ts` |
| Content (defaults) | `src/data/contact.ts`, types `src/types/contact.ts` |
| CMS | global `contact` (`src/globals/Contact.ts`), reader `src/lib/api/contact.ts` (tag `contact`), mapper `contact-map.ts`, seed `scripts/seed-contact.ts` (`npm run seed:contact`), migration `20261102_062534_contact_page` |
| Assets | `public/images/contact/` (`hero.avif`, `flag-in.avif`, two icons), `public/images/page-hero/crest.svg` |

## The page, top to bottom (1920px; all of it scales down with the screen)

1. **Hero** (see below): the photo (736px high), and over its lower edge the card with the green pill "CONTACT US", the heading "Let's Begin a *Conversation*" (the `<h1>`), "Reach out for admissions, enquiries and assistance", and the rule with the crest.
2. **Details and form** (87px under the hero card): left, three groups 51px apart (Email, Contact, Location; heading 20px bold, lines 18px, navy at 80%; each address and number is a link: `mailto:`, `tel:`); right, the form (784px). From 1024px the two sit side by side (452 : 784, the gap, 285px at 1920, shrinks with the screen); below that **the form comes first, at the full width of the column, and the details go under it** (owner, 2026-11-02; CSS `order`) (my interpretation: only desktop is designed).
3. **Map** (125px under the form): the Google Maps embed, 1520 x 516px (the Figma rectangle holds a screenshot of the map; the live embed replaces it), then 84px, then the footer.

The design's page colour is a very light grey, `#f9f9f9` (token `brand-snow`): the hero card and the labels of the form fields use it to blend in. The form's field borders are `#b8b8b8` (`brand-fog`).

**Checked against Figma at 1920 x 993** (the page measured in Chrome against the exported frame): the photo, the pill, the heading, the form, the fields (378 / 784 wide, 53px high, the message 213px) and the button (176px) are within 1 to 3px; the page is 3224px high (Figma 3223). Pixel difference with the Figma export (text anti-aliasing included): 2.8 on a 0 to 255 scale for the photo, 3.8 for the card, 1.9 for the details and form. **One thing in the design is not as it looks:** the form's frame is 629px high but its Send button hangs 19px out of it, so the real gap to the map is 125px, not the 144px the frames suggest.

## The reusable hero (`<PageHero content={…} />`)

Since 2026-11-02 the photo is optional: without `image` it is the **text-only look** of the Principal's Welcome page ([29-principals-welcome.md](29-principals-welcome.md)).

The pattern of the Contact page's top is the pattern of the inner pages (owner, 2026-11-02), so it is one component. **To use it on a new page:** give it a `PageHeroContent` (`label`, `badge`, `titleLead`, `titleAccent`, `subtitle`, `image`), from the page's data file or from its CMS global:

```tsx
<PageHero content={content.hero} />
```
and for the CMS, `{ name: "hero", label: "Hero", fields: pageHeroFields() }` as a tab of the page's global, read back with `pageHeroFromDoc(doc.hero, defaultHero)`.

- The heading is the page's `<h1>` (`text-h1`, 48px at 1280px and up; the design's "subpage hero H1"); the accent word is the shared `<Accent>`; the pill is `<Badge size="eyebrow">` (new size: bold 17px, uppercase, 33px).
- The photo: `next/image` with `priority` (it is the first thing on the page), served as the file in `/public` (already AVIF). It is **1920 x 736** at 1920px and follows the width (`38.33vw`, never under 300px); `object-cover`, so the middle of a wide photo is what shows on a narrow screen. The file in `public/images/contact/hero.avif` is the Figma photo cut to the visible area (the Figma layer is a crop: 245 KB, 45.1 dB, made with `npm run images:optimize`).
- The crest rule is two CSS lines and the Figma crest vector (`crest.svg`, unmodified) between them: the exported "line, crest, line" SVG stretches (its `preserveAspectRatio` is `none`), which would squash the crest on every other width.
- **Animation** (the site's rule: interactive, once, quick): when the hero comes into view the photo settles from a 1.06 zoom (1.4 s) and the pill, heading, line and rule rise one after the other (0.6 s, 0.1 s apart). Reduced motion: nothing moves. Everything is hidden by JS only, so without it all shows.
- What an editor changes in the CMS: the pill, the two parts of the heading, the line under it and the photo. The photo's alt text comes from the media library. Sizes and positions are design (in code).

## The form

Fields, from the design: First Name, Last Name, Email, Phone Number (optional, with a fixed `+91` and the flag), Subject (a plain text field: the drop-down of the first Figma frame is out of date, owner 2026-11-02, so there are no subject choices and no "+" icon), Message, and the green "Send Message" button (176 x 48px, square corners as drawn). Each field's label sits on its top border (the label has the page colour behind it). Required: everything but the phone number.

- **Checks** (`src/lib/contact-form.ts`, applied in the browser as the visitor leaves a field and again on the server): names up to 60 characters; an email address of the form `a@b.cc`; a phone number, if given, of 7 to 15 digits (spaces, dashes and brackets are ignored); a subject; a message of 10 to 2000 characters. Errors are written under the field (`aria-describedby`, `aria-invalid`), the first wrong field gets the focus, the result is announced in an `aria-live` area.
- **A hidden field (`website`)** catches robots: out of sight, out of the tab order, `aria-hidden`. A robot that fills it is told "sent" and nothing is sent.
- **NOT CONNECTED TO AN E-MAIL HOST YET (owner: "we will connect it with an email host later").** `src/lib/actions/contact.ts` is the one place to finish: it checks the form, and then answers `not-configured`. **Until it is connected the form tells the visitor the truth**: "Sorry, this form cannot send messages just yet. Please email us at … or call …" with the first email address and the first phone number as links, and keeps what was typed. It never says the message was sent. When the action sends and answers `{ ok: true }` the form shows "Thank you" and empties itself (that path is tested). The browser check (`tests/interactions.mjs`, section 11) expects the "cannot send" wording and has to be changed with the action.
- To connect it: send `values` to the school's address (the Subject is free text now, so route by it only if the school wants to, or send everything to one address) with the host's SDK or SMTP, reply-to `values.email`, return `{ ok: true }`. The host's key goes in an environment variable (Vercel and `.env.local`), never in the code.

## The map

`ContactMap` shows a Google Maps `<iframe>` (`loading="lazy"`, `referrerpolicy="strict-origin-when-cross-origin"`, a `title` for screen readers, 1518 x 516 aspect, 300px high at the least). The address (`src`) is the one from the owner's iframe (Learning Paths School, Sector 67, Mohali). In the CMS an editor pastes Google's whole "Embed a map" code, or just its address: `src/lib/map-embed.ts` takes the `src` out of the tag and **lets only an address that starts with `https://www.google.com/maps/embed` through** (anything else is refused by the field, and ignored by the page: the default map is shown). There is no Content-Security-Policy yet (open item of the site), so this rule is what keeps other pages out of the iframe.

## In the CMS (the "Contact page" global, group Pages)

Tabs: **Hero** (the reusable fields), **Contact details** (email addresses 1 to 5 with an optional note, phone numbers 1 to 4 with an optional note, the address), **Map** (the embed), and the **SEO** tab (the plugin). Drafts, Live Preview (the real `/contact-us` next to the form), Save draft and Publish work as on the home page; editors may publish. There is no Form tab (it held only the subject choices, which went when the Subject became a text field). The two lists are `required` as well as `minRows: 1`: with `minRows` alone Payload let an EMPTY list through (found in the CMS test). A published change clears the cache tag `contact` (also cleared by a changed or deleted photo, and by `POST /api/revalidate` with `{"tag":"contact"}`), so it is live within seconds.

Same rule as the home page: the defaults (`src/data/contact.ts`) are the base, the CMS overrides what an editor wrote, and anything it lacks (an empty field, an empty list, no document, the database down) is the default for that field, so the page is never blank. The inverse (`contact-seed.ts`) is proved to give the defaults back.

**Tested on the dev branch** with a throwaway admin and editor (deleted afterwards): a draft stays private (also with `?draft=true`); an editor can publish; the page then shows the new heading, pill, details and map (a pasted iframe gives only its address), the photo from the media library with its alt text and the SEO title; an address that is not a Google Maps embed, an e-mail address that is not one, an empty email list and an over-long pill are refused; a visitor cannot write or read versions; the originals are restored. In the admin (both roles): the dashboard lists the page, its tabs, the Hero tab's fields, the Map field, and Live Preview loads `/contact-us` in a frame, with no console errors.

## Tests

- **Unit (50 new, 218 in all):** `map-embed.test.ts`, `contact-form.test.ts`, `actions/contact.test.ts` (what the action answers until it sends), `api/contact-map.test.ts` (defaults, overrides, fallbacks, the pasted iframe, the seed round trip), `PageHero.test.tsx`, `ContactForm.test.tsx` (errors and focus, the "cannot send" and "Thank you" paths, a server complaint, a failure, the robot field), `ContactSection.test.tsx` (details, links, the map iframe), `globals/Contact.test.ts` (draft privacy, the fields, the validators, the lists required) and the revalidate route's two tags.
- **Browser, on a clean production build (CI style):** `npm run qa` 29 of 29 (4 new, section 7) and `npm run qa:interact` 107 of 107 (23 new, section 11). The one axe finding on the page is the known white-on-green contrast of the Send button and the pill ([16-production-readiness.md](16-production-readiness.md)).
- **CMS:** tested on the dev branch (above), not on production.

## Before it goes live

1. **Deploy runs the migration** (`vercel-build` applies `src/migrations`): it adds 8 tables for the global (no existing table is changed).
2. **Production has no Contact content until it is seeded** (`SEED_PRODUCTION=1 npm run seed:contact`, only when the owner says; step H of [26-cms-home-plan.md](26-cms-home-plan.md) did the same for the home page). **Until then the live page shows the defaults** (the same content, the photo from `/public`), so nothing is missing.
3. The e-mail host (above), the **links** to the page (the mega menu's two "Contact us" links, the footer's "Contact info") and a share image for the SEO tab are open.

## Open items

- The e-mail host for the form.
- The address has a double space and no comma in the design ("Plot No 3  Sec 67"): kept as written (a browser shows one space).
- Tablet and phone layouts are mine (only desktop is designed): the form first and the details under it below 1024px, the hero card narrower, the heading wrapping onto two lines on a phone.
- The photos budget (`npm run images:check`) was raised from 6 MB to **10 MB** on 2026-11-02 (owner), because this page's photo left 0.2 MB. It is the whole site's total, not one page's: a visitor only loads the photos of the page they open. The rule that protects speed is the 400 KB limit per photo.
- Production-readiness items that apply here too: no Content-Security-Policy, no Open Graph image.

## Fix 2026-11-03: the form on a phone

The form used to stick out of the screen on phones (a one-column grid never shrinks below the minimum content width of its items, and the phone row asked for more than a phone has). The outer grid is now `grid-cols-1` (`minmax(0, 1fr)`) below 1024px, the form and its fields are `min-w-0`, and the phone input is `w-0 min-w-0 flex-1`. A test widens the text fields to 20, 30 and 40 characters at 320, 360 and 390px and checks that nothing leaves the screen. See [06-changelog.md](06-changelog.md).
