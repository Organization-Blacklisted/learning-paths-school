# Home: The Ecosystem Behind LPS 360

Figma: "Frame 1618876359", node `6282:975`, 1520 x 1036px. Code: `src/components/sections/home/EcosystemSection/`. Content: `src/data/home-ecosystem.ts`. Types: `EcosystemContent`, `EcosystemTab` in `src/types/home.ts`. Photo: `public/images/home/ecosystem/choir.avif`. On the home page it comes right after the LPS 360 Framework section and before What's New (the owner's canvas screenshot shows it below the Framework). **Since 2026-10-22 it is the first panel of the second sideways scene**: the view pans right from it to the alumni section ([21-home-alumni.md](21-home-alumni.md)). As a panel it has no `Section` of its own (the scene gives the container and spacing) and, being about 1026px high, it is scaled to fit on screens shorter than that.

## What it is

The green pill **The Ecosystem Behind LPS 360**, the heading **Five Foundations That Bring The *Vision To Life*** (grey Lexend Regular 40px, blue slanted Lexend Medium part), an 871px intro paragraph, a **tab bar** with five tabs, a 1520 x 531 photo, and a text row: bold title (20px SemiBold) and paragraph (485px) on the left, five bullets (485px) on the right. The tabs are: Academic Excellence Framework, Sports and Well-Being Ecosystem, Co-Scholastic Programmes, Capstone Projects, Social Impact and Advocacy Initiatives. The bar has a hairline (black at 13%) above and below, 14px and 11px of padding; the active tab is a blue `#123b7a` rounded button (8px corners, white text), the others have blue text. Every tab has its own width in Figma (325, 326, 274, 198, 360px, 1483px in all, centred).

## The content of the five tabs (real since 2026-10-23)

- **Text:** the school's own text for all five tabs (title, paragraph, four or five bullets each), pasted by the owner on 2026-10-23, is in `src/data/home-ecosystem.ts` exactly as written. (Before that, tabs 2 to 5 showed the first tab's text as a placeholder.)
- **Photos:** Figma now has a photo for each tab (frames `6651:585`, `6651:586`, `6651:588`, `6651:590`, each a 1520 x 531 crop). They were exported at 2x and compressed with `npm run images:optimize` to **AVIF 1900 x 664 at the lowest quality that keeps 45 dB**: `sports.avif` 173 KB (45.1 dB), `coscholastic.avif` 382 KB (45.5 dB), `capstone.avif` 263 KB (45.4 dB), `social-impact.avif` 223 KB (45.2 dB). The first tab keeps `choir.avif`. Alt texts are descriptions written for the site.
- **Tab labels are the school's names (owner decision, 2026-10-23),** not Figma's, for three tabs (the widths stay Figma's and the shorter names fit). The Figma names were: "Academic Framework" (Figma: "Academic Excellence Framework"), "Overall Well-Being Ecosystem" (Figma: "Sports and Well-Being Ecosystem"), "Social Impact and Initiatives" (Figma: "Social Impact and Advocacy Initiatives"). To confirm which names the school wants; changing a label is one line in the data file (its width may need adjusting).
- **The panel is as tall as the tallest tab.** The five texts differ in length (the Capstone tab is 27px taller: a four-line paragraph). They sit stacked in ONE grid cell and only the chosen one is visible (the others are `invisible`, `inert` and `aria-hidden`), so the panel never changes height when you switch tab, and the sideways scene fits that one height to the screen. Before this, a taller tab would have been cut off at the bottom on a short screen (about 25px at 1440 x 900 and 20px on a phone) and the panel would have jumped. Tested at 1920, 1440 and 390px: every tab's last bullet is inside the pinned screen.

## The tabs work

Click, or the keyboard as for any tab list: **Left and Right arrows** move and select (wrapping from the last tab to the first), **Home** and **End** jump to the ends; only the active tab is in the Tab order (roving `tabindex`). Markup: `role="tablist"`, `role="tab"` with `aria-selected` and `aria-controls`, and one `role="tabpanel"` labelled by the active tab.

## Animation (the owner: "as you think will suit it", plus "make it with animations")

- **Entrance, once**, when the section scrolls into view (top at 70% of the screen), about 1.5 s: the pill and heading rise in, the tab bar fades in, the photo is wiped open from the left while it settles from a 1.12 zoom, and the title, text and bullets rise in one after another.
- **The blue highlight slides.** It is one shape behind the tabs that glides to the clicked tab (position and size; 0.45 s. It is measured in the bar’s own pixels, so it stays exact when the panel is scaled down to fit a short window).
- **On a tab change** the photo is wiped open again from the left (0.8 s, with a zoom settle) and the title, text and bullets of the chosen tab rise in.
- **Reduced motion:** no animation, the highlight jumps, everything shown. Without JavaScript everything is shown, and the active tab paints its own blue background (the highlight takes over on the same rectangle one frame after load).

## Layout and responsive behaviour

- **1600px and up** (container 1520px): the design, each tab at its Figma width, **less 6.4px** so that 8px fit between neighbours (see "Gap between the tabs" below); the five tabs still add up to 1483px.
- **1024 to 1599px** (my interpretation, only desktop exists in Figma): **always one row.** The tabs keep their natural width with 16px padding (25px elsewhere); all five fit from about 1450px wide. When they do not fit, the bar scrolls sideways like on a phone (see below), with a fade at an end that has hidden tabs.
- **When the tabs do not fit (any width, below 1450px or so):** the tab bar is **one row that scrolls sideways** (no scrollbar; a fade shows the end with hidden tabs) and **scrolls by itself when you choose a tab**: the chosen tab slides smoothly to the left edge of the bar (14px in), so the tabs after it come into view; choosing the second one shows the start of the third (about 33% of it on a 390px phone, all of it on a tablet). Near the end the bar simply stops at its end. It also happens with the arrow keys, Home and End. Below 640px the tab text is 14px with 16px side padding (16px and 25px from 640px up) so that more of the next tab fits; the photo is 16:9, and the text and the bullets stack. (The bullet list uses padding, not margin, so it never pushes the page wider.)
- **Gap between the tabs (owner request, 2026-10-22):** the tabs are 8px apart at every width, so the blue active tab and the grey hover background of a neighbour never touch. Figma has them touching (each tab 325, 326, ... wide, one after the other); the owner wanted the gap, so from 1600px each fixed width is trimmed by 6.4px (4 gaps of 8px shared by 5 tabs) and the row keeps the design's total width and its centring.

## Image

Source: the Figma photo (a school choir, 4096 x 2734 JPEG, 15 MB). The design shows it cropped and shifted inside the 1520 x 531 slot, so the file is **cropped to that slot and resized to 1900 x 664 (1.25x), AVIF quality 85**: 359 KB, 39 dB. This is **a placeholder photo** and a dark, noisy one, so it is compressed harder than the other photos in the project (which are 45 dB or better); re-compress the real photos at about 45 dB (probably 500 to 700 KB each at this size, or serve a smaller file to phones). Served as it is (`unoptimized`), requested after the page has loaded (`useIdleReady`); the box keeps its size meanwhile. On a phone the 16:9 box shows the middle of the wide image.

## Fidelity

Verified in Chrome at 1920px (frame 1520 wide) against the Figma render, using a temporary test page (the home sections are switched off; the page was deleted afterwards):

- Pill at y 0 (35 high), heading at y 50, intro at y 126 to 127.5 (871 wide, two lines, centred), tab bar at y 219 (76 high, 1520 wide), all five tabs at the Figma width (325, 326, 274, 198, 360) and 52 high (checked before the 8px gap was added; since then each is 6.4px narrower and 8px apart, 1483px in all, centred as before), photo at y 328.5 (1520 x 531), text row: title and paragraph columns and the 485px list at x 1035 with five bullets. All within about 1.5px.
- The highlight sits exactly on the active tab (x and width within 0.6px), and slides through several positions on the way to a clicked tab. Keyboard: ArrowRight, End, wrapping, Home, ArrowLeft all behave.
- The whole render is about 20 dB: the photo is compressed harder, it sits half a pixel off Figma's, and text anti-aliasing differs. With the photo shifted by 1px the photo area is 31.7 dB, so the crop itself matches. (Figma's frame is 10px taller than its content, so the section is 1026px high here.)
- Responsive checks at 1700, 1440, 1100, 768 and 390px and with reduced motion at 390 and 1920px: no horizontal page overflow, everything visible, photo loaded, the highlight on the active tab; at 768 and 390px the highlight follows the fifth tab inside the swiped bar. The entrance was checked from hidden (7 of 7 parts) to fully shown. No console messages.

## Known issues and open items

- **Content:** real text and photos for all five tabs since 2026-10-23 (see above). Nothing open: the tab names are the school's (owner decision) and "LPS" in the intro is confirmed.
- **Figma typo corrected:** the intro says "across a child's journey at **PLS**"; it is written as **LPS** here (confirmed by the owner, 2026-10-23).
- Alt text of the photo is mine.
- **Owner feedback (2026-10-22): the photo animation (the wipe that opens from the left) is not good.** Kept as it is for now; the owner will review all home page animations together once the home page is complete. Ideas to try then: a fade with a slight zoom, a slide that follows the tab order, or a vertical reveal.
- The tab-change wipe plays from the left whatever the direction of the change; a slide direction that follows the tab order would be an easy addition if wanted.
- Text weight may look heavier in the browser than in the Figma render (see the Proxima Nova note in [08-footer.md](08-footer.md)).
