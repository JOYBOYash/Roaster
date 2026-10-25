# Roastie Design System

This document is the visual and interaction source of truth for **Roastie**. Use it when building the marketing homepage, roast results, export preview, checkout states and any future product surface. The supplied palette image defines the three accent colours. The supplied Klyro presentation reference defines the visual language: deep teal canvases, vivid lime blocks, oversized condensed typography, thin framed headers, editorial grids, compact metadata and deliberately varied panels.

The reference is directional, not a template to copy. Do not use Klyro's name, agency content, people, statistics, layouts verbatim or brand assets. Translate its design principles into Roastie's own identity and roast-focused product experience.

## 1. Product and design character

Roastie is an entertainment product that gives a website a score, generates a funny roast and lets the user pay to export a designed roast artifact.

The product promise is:

> Drop a URL. Get a score. Get absolutely cooked.

The experience should feel like a mash-up of a satirical internet publication, a creative studio's presentation deck and an official-looking report card. It is punchy, confident, visually loud in controlled places and funny without feeling childish.

The visual language combines:

- a deep teal canvas inspired by the presentation reference;
- Wasabi lime as the main action and headline-highlight colour;
- Cool Blue as the crisp, airy colour for panels and alternate surfaces;
- Orange Topaze as the high-energy roast, verdict and warning accent;
- oversized condensed display type, often in uppercase;
- fine rules and compact, almost editorial metadata;
- asymmetrical grids, framed content and selected clipped corners;
- strong contrast between large colour blocks and quiet neutral surfaces;
- export cards that resemble collectible posters, not screenshots of a SaaS dashboard.

Roastie should look designed, not generated from a generic SaaS template. It must remain readable, accessible and usable when the decorative treatments are removed.

## 2. Product boundaries

Roastie does only three things:

1. Gives a website an entertainment score.
2. Writes a funny, site-specific roast.
3. Sells a premium export of that roast.

Do not add SEO audits, issue detection, accessibility assessments, conversion advice, design recommendations, repair instructions or improvement checklists. Do not present the score as a validated measure of website quality. The comedy is the product.

The free result must show the score and the roast. Payment unlocks a beautifully designed export, not the basic result.

## 3. Brand and copy

- Product name: **Roastie**. Preserve this spelling and capitalisation in normal copy.
- The wordmark may use uppercase styling: **ROASTIE**.
- Primary tagline: “Drop a URL. Get a score. Get absolutely cooked.”
- Alternate hero headline: “YOUR WEBSITE. ON TRIAL.”
- Alternate CTA-oriented headline: “LET'S SEE WHAT YOU'VE PUT ON THE INTERNET.”
- Tone: sharp, playful, self-aware, internet-native and concise.
- Copy should sound like a witty roast writer, not a product consultant.
- Avoid generic AI phrases such as “Unlock your potential” or “Take your website to the next level.”
- Use short, confident labels: “Roast this site”, “The verdict”, “Score”, “Get the roast card”, “Export the damage”.
- Use comedy to roast the website, its public-facing copy or its design choices. Do not turn the experience into personal harassment of an identifiable individual.
- Do not fabricate evidence, visitor counts, customer statistics, endorsements or technical facts about the site.

## 4. Typography

Use a two- or three-font system, and keep it consistent throughout the site.

| Role | Recommended family | Weights | Use |
|---|---|---:|---|
| Display headlines | `Barlow Condensed` | 700, 800, 900 | Hero, verdicts, poster titles, large score-adjacent copy |
| Body and controls | `DM Sans` | 400, 500, 600, 700 | Paragraphs, form fields, buttons and navigation |
| Micro metadata | `IBM Plex Mono` | 400, 500, 600 | Report ID, section indexes, score labels, small data-like labels |

If these fonts are unavailable, choose close fallbacks: a condensed sans-serif for display, a neutral sans-serif for body, and a monospaced face for metadata.

### Type scale

| Element | Desktop | Mobile | Treatment |
|---|---:|---:|---|
| Hero H1 | 76–104px | `clamp(44px, 13vw, 68px)` | Extra bold, condensed, tight leading, uppercase may be used |
| Results verdict | 56–88px | 42–60px | Heavy display, short line breaks |
| Section H2 | 48–64px | 34–44px | Condensed, bold |
| Score number | 96–160px | 76–112px | Large, compact, mono or condensed display |
| Card H3 | 22–30px | 20–24px | Bold, condensed where appropriate |
| Body copy | 16–18px | 16px | Comfortable line-height, typically 1.5 |
| Labels and metadata | 11–13px | 11–12px | Monospaced, uppercase, deliberate tracking |
| Buttons | 15–17px | 15–16px | Bold and direct |

Headlines may be broken across multiple short lines, but do not force awkward line breaks on narrow screens. Keep long paragraphs relatively narrow and legible. Condensed uppercase type is a display device, not the default for every sentence.

## 5. Colour

The three colours from the supplied palette image are the only branded accent colours. Use deep teal, white and near-black as structural colours drawn from the design reference, not as additional accent colours.

### Brand palette

| Token | Value | Role |
|---|---|---|
| `--roastie-wasabi` | `#E9F056` | Primary CTA, key highlights, positive/attention-grabbing score moments |
| `--roastie-cool-blue` | `#D7EFFF` | Light feature panels, cards, secondary poster theme and calm contrast |
| `--roastie-orange-topaze` | `#FF5C34` | Roast severity accents, verdict stamps, premium details and high-energy emphasis |
| `--roastie-teal` | `#086672` | Structural canvas and large background panels inspired by the visual reference |
| `--roastie-teal-deep` | `#064D57` | Deep contrast panels, footer and dark text on light surfaces when needed |
| `--roastie-ink` | `#132F32` | Primary text on light panels and poster copy |
| `--roastie-white` | `#FFFFFF` | Type and clean panels where contrast requires it |
| `--roastie-paper` | `#F7F8F4` | Quiet neutral surface and readable content panels |

### Colour usage rules

- Teal is the primary page canvas or large section colour. It should create the same rich, immersive base as the reference image.
- Wasabi is the primary action colour. Use it for the main CTA and a few major headline or score highlights.
- Cool Blue is the primary light contrasting surface. Use it to make results, cards and content feel crisp against teal.
- Orange Topaze is a punctuation colour. Use it for verdict stamps, select score details and key export accents; do not paint every section orange.
- Use dark teal or ink text on Wasabi, Cool Blue and paper surfaces. Use white text on deep teal only when contrast is sufficient.
- Do not use the three accent colours at equal strength in every section. Give each panel one dominant colour and one secondary accent.
- Avoid unrelated purple, blue gradients, random status colours, and additional saturated accents.
- Do not apply orange text to small body copy on the teal canvas if contrast is poor. Use a solid orange surface with dark text or reserve orange for large type and decorative accents.
- Colour alone must never communicate the only meaning of a state; use words, icons, shape or placement as well.

## 6. Layout and spacing

### Widths

- Main marketing container: 1160–1240px.
- Text-heavy content: 620–760px maximum.
- Roast result composition: 1080–1160px.
- Export preview area: allow poster art to dominate; avoid reducing it to a tiny thumbnail.
- Header content aligns to the same container as the hero.

### Spacing rhythm

Use a consistent spacing scale: 4, 8, 12, 16, 24, 32, 40, 48, 64, 80 and 104px.

- Desktop section padding: 72–96px vertically, 28–40px horizontally.
- Mobile section padding: 48–64px vertically, 20px horizontally.
- Gap between a section heading and its main content: 32–44px desktop, 24–28px mobile.
- Keep form labels, inputs and helper text close together.
- Use generous breathing room around the hero and result score. Dense content should be placed inside a deliberate grid rather than scattered.

### Grid principles

- Use a mix of two-column editorial compositions and asymmetric card grids.
- A hero can pair a large typographic block with an oversized sample roast card or input panel.
- Create visual rhythm by alternating dark teal, Wasabi, Cool Blue and white/paper panels.
- Use shared edges, thin divider lines, corner cuts and framed headers to connect related cards.
- Avoid making every section a collection of identical rounded cards.

## 7. Shape, borders and surfaces

The visual reference uses rectangular panels, thin outlines and selected clipped corners. Follow that character rather than a fully rounded modern SaaS style.

- Main panels: 4–10px radius depending on density; use square or slightly rounded geometry.
- Inputs and buttons: 6–10px radius for comfortable interaction.
- Export posters and large feature panels: generally 4–8px radius or sharp corners, depending on composition.
- Use clipped or chamfered corners sparingly on report cards, poster frames and numbered info panels.
- Prefer 1px borders in white, deep teal or a low-opacity version of the current panel colour.
- Use horizontal rules and outlined micro-header bars to create structure.
- Use shadows only when needed to separate a floating preview or dropdown; do not place a heavy shadow on every card.
- Avoid glassmorphism, excessive blur, glowing outlines, stacked floating cards and pill-shaped everything.

## 8. Signature interface patterns

### Framed header strip

Translate the presentation reference's slim top labels into a Roastie signature component:

- ROASTIE wordmark on the left;
- section label such as `WEBSITE VERDICT` or `ROAST REPORT` in the centre when useful;
- compact index or status on the right, such as `REPORT / 01`;
- thin outline and a small Wasabi dot or mark;
- keep the strip quiet so the display typography remains dominant.

Do not number every website section artificially. Use this pattern on the hero, results panel and export preview where it supports the editorial/presentation aesthetic.

### Modular poster blocks

Use large coloured rectangles as meaningful content panels rather than decoration. Each block should have a purpose: input, score, verdict, roast quote, export preview or CTA. Let panel colour and typography carry the hierarchy.

### Cut-corner cards

Selected cards may have one clipped corner, like a printed poster or presentation page. Use CSS `clip-path` only where the content still has sufficient internal padding and does not crop focus outlines or text. Provide a rectangular fallback.

### Section number and metadata

Use small mono labels like `01 / ENTER URL`, `02 / THE VERDICT` and `03 / TAKE IT WITH YOU` where they help the page feel like a designed editorial sequence. Keep the main reading order obvious to assistive technology.

## 9. Homepage composition

The homepage should make the product immediately understandable and let users start roasting without navigating through a long marketing funnel.

### Navigation

- Brand mark/wordmark on the left.
- One or two quiet links at most, such as “How it works” and “Sample roast”.
- Main CTA on the right: “Roast a website”.
- Use a thin outlined bar or dark teal background with high-contrast type.
- On small screens, keep the brand and primary action visible; collapse secondary navigation cleanly.
- Do not invent user accounts, a leaderboard or social proof that does not exist.

### Hero

Primary headline:

> YOUR WEBSITE. ON TRIAL.

Supporting line:

> Drop a URL. Get a score. Get absolutely cooked.

Include:

- URL input with a clear example placeholder;
- primary Wasabi action, “Roast this site”;
- concise helper text that makes clear this is for entertainment;
- one eye-catching sample roast card beside or below the form;
- a framed header strip with subtle section metadata.

The URL field and CTA are the main interaction. Avoid competing with several secondary buttons. The hero must remain usable without animation or decorative artwork.

### Sample roast panel

Show a clearly fictional sample so visitors understand the output before submitting a URL. Example content:

- `SAMPLE VERDICT`;
- score `23 / 100`;
- verdict: `CERTIFIED INTERNET CRIME`;
- a short original roast sentence;
- small report ID or issue label.

Mark the sample as fictional. Never present illustrative copy as a real analysis of a real site.

### How it works

Use three compact stages:

1. `DROP THE URL` — enter a public website URL.
2. `GET COOKED` — receive an entertainment score and a roast.
3. `EXPORT THE DAMAGE` — pay to download the designed roast artifact.

Present them as connected editorial blocks, not three generic floating white cards. Keep explanations short.

### Final CTA and footer

- Close with one bold line and one obvious action.
- A Wasabi panel on the teal canvas is appropriate for the closing CTA.
- Footer should be dark teal or a deeper teal shade, with a thin top divider and quiet links.
- Include a short entertainment disclaimer, privacy and terms links when those pages exist, and a simple copyright line.
- Do not create non-working footer links or fictional company details.

## 10. Roast results experience

After a successful roast, the result page should feel like a reveal or a verdict, not an analytics dashboard.

### Information hierarchy

1. Submitted website domain.
2. Large score out of 100.
3. Verdict label.
4. Roast paragraph.
5. One short, quotable punchline.
6. Premium export preview and purchase action.

Use a bold, high-contrast results composition. A possible desktop layout is a large score/verdict block next to a light roast quote panel. On mobile, stack the score, verdict, roast and export in a clear reading order.

### Score presentation

- Give the number substantial visual weight.
- Always label it as an entertainment score.
- Include `/100` and a text verdict so it is not colour-only.
- Use Wasabi or Cool Blue for the primary score treatment; Orange Topaze may accent particularly dramatic roast states.
- Do not imply that the score is objective, scientific or a verified measure of website quality.

### Roast content

- Keep the roast paragraph to a readable line length.
- Highlight the punchline in a separate panel, pull quote or oversize type.
- Do not add advice, identified-problem lists, fixes or recommendations below the roast.
- Include a “Roast another website” action that resets the experience cleanly.

### States

Design and implement loading, validation error, fetch failure, generation failure, empty input, and retry states. Loading text can be playful, but should accurately describe the action. If website retrieval fails, offer a clear path to paste visible website copy rather than pretending the site was successfully inspected.

## 11. Premium export experience

The export is the paid product. It must feel like a collectible poster or designed report, not a screenshot of the web app.

### Export preview

- Show the artifact large enough to assess before buying.
- Use a visible but tasteful preview watermark or a restrained locked treatment.
- Never obscure the entire design; the user should understand what they are paying for.
- Keep the score, verdict, domain and punchline visible in the preview when practical.
- Clearly disclose what the download contains and the final price before checkout.

### Export themes

Design three distinct visual themes using the same Roastie system:

1. **Certified Cooked** — Wasabi dominant, deep teal typography, large score and a sharp editorial composition.
2. **Crime Scene** — Orange Topaze dominant, deep teal or ink text, verdict-stamp treatment and restrained report metadata.
3. **Cold Verdict** — Cool Blue dominant, deep teal typography, a cleaner and more clinical satirical layout.

The themes must remain recognisably Roastie. Do not add unrelated colours, random gradients or decorative imagery that competes with the roast.

### Artifact composition

Each export should contain:

- Roastie wordmark;
- website domain;
- entertainment score out of 100;
- verdict label;
- roast paragraph;
- punchline;
- unique report identifier;
- generation date when available;
- tasteful edge details or a framed header strip.

Preferred initial artifact: 1080 × 1350 PNG, with PDF as a later enhancement if it can be implemented reliably. The exported file should be sharp, correctly aligned and legible on mobile social feeds.

### Paywall and price

- Suggested starting price: `$0.99` per export, configurable in trusted server-side settings.
- The free score and roast must remain visible and useful.
- Explain the unlock in one sentence; do not use aggressive countdown timers, fake scarcity, or misleading urgency.
- The paid CTA can say `Unlock the roast card — $0.99`.
- Show payment and currency details clearly before checkout.
- After confirmed payment, reveal a clear download action and a success state.
- A frontend flag or client-side success screen must never count as proof of payment.

## 12. Buttons, fields and interaction states

### Primary action

- Wasabi fill with deep teal/ink label.
- Bold, readable text and strong hover/focus treatment.
- Minimum height around 48–54px.
- Use a compact arrow or simple outline icon only if it improves clarity.
- Avoid an elaborate button animation that delays the user's action.

### Secondary action

- Transparent or paper-coloured surface with a clear border.
- Use white/near-white text on teal backgrounds or dark text on light surfaces.
- Must remain visibly secondary to the Wasabi action.

### URL field

- Prominent, high contrast and at least 48px high.
- Include an accessible label; placeholder text is not a replacement for a label.
- Clearly show focus, invalid input and disabled states.
- Preserve the submitted URL in the field if an error occurs so the user can retry.

### Micro-interactions

- Small changes in colour, position or scale are sufficient.
- Prefer crisp 120–220ms transitions for controls.
- A score count-up or roast reveal may be used once per result, but the final content should not be delayed for spectacle.
- Respect `prefers-reduced-motion`.

## 13. Imagery, symbols and illustration

- Typography and the roast artifact should be the primary visual content.
- Prefer original poster treatments, score typography, ruled frames and simple geometric marks over generic stock imagery.
- A small custom spark, scorch mark, seal or roast-stamp motif may become a signature mark. Keep it simple and reusable.
- Avoid default emoji as interface icons; they can be inconsistent across platforms.
- Avoid decorative imagery that makes the website feel like a food delivery app. “Roast” is the tone, not a requirement to fill the UI with flames, peppers or cooked-food illustrations.
- If screenshots are used in sample output, mark them as fictional or illustrative.
- Keep interface icons consistent in stroke weight and style.

## 14. Motion

Motion should make the verdict feel lively without distracting from the copy.

Appropriate treatments:

- slight score count-up;
- quick reveal of the roast quote;
- subtle button press feedback;
- gentle entrance of the export preview;
- short hover shifts on poster theme selection.

Avoid:

- looping attention animations;
- shaking or flashing the full page;
- long intro sequences before the roast appears;
- scroll hijacking or pinned sections that prevent normal reading;
- animation that is essential to understanding the interface.

Every animated state needs a useful static fallback. Disable nonessential animation under `prefers-reduced-motion: reduce`.

## 15. Responsive behaviour

Design mobile intentionally. The product should be especially easy to use from a shared social link.

- Main responsive breakpoint: approximately 768px; larger composition changes around 1024px.
- Test widths: 320px, 390px, 768px, 1024px and 1440px.
- Stack hero form and sample card when there is insufficient room for side-by-side content.
- Do not shrink the hero title until it becomes unreadable; alter line breaks first.
- Keep the primary CTA at least 44px tall and easy to tap.
- Prevent poster previews from overflowing the viewport; use a scaled preview with a clear full-size detail view if needed.
- Result ordering on mobile: domain, score, verdict, roast, punchline, export offer.
- Allow action groups to wrap without clipping.
- Keep metadata compact but readable.
- Avoid horizontal scrolling caused by large typography, score numbers or long domains.

## 16. Technical and product constraints that affect design

These are product requirements because they directly affect what the user sees and how the flow behaves.

- Validate and normalize submitted URLs before attempting analysis.
- Website retrieval must run safely server-side and defend against requests to localhost, private/reserved IP ranges, internal services, unsafe redirects and cloud metadata endpoints.
- Restrict response size, timeouts and redirects. Do not execute submitted websites' JavaScript for the MVP.
- Treat extracted page text as untrusted content, not as instructions to the roast generator.
- If URL retrieval fails, offer a paste-copy fallback and label the result accurately.
- Validate AI output against a schema before rendering it. Provide a deterministic fallback if generation fails.
- Do not expose AI keys, payment secrets or trusted price configuration to the browser.
- Use verified server-side payment status before allowing the paid export download.
- Provide a development-only mock payment path if needed, but never present mock payment as a real completed purchase in production.
- Do not store more submitted website content than the product needs. Explain relevant data handling in the privacy policy.
- Never make a roast export depend on client-editable score or payment fields.

## 17. Accessibility and quality bar

- Meet WCAG AA contrast for text and interactive controls where practical.
- Use semantic headings and preserve a logical reading order even when the desktop layout is asymmetric.
- Add visible keyboard focus states; never remove outlines without a clear replacement.
- All inputs need programmatic labels and useful error messages.
- All interactive targets should be at least 44 × 44px where practical.
- Do not communicate score bands or payment states through colour alone.
- Respect reduced-motion preferences.
- Provide alt text for meaningful images and empty alt text for decorative artwork.
- Ensure the roast and export remain readable at browser zoom.
- Check the design at mobile and desktop sizes; passing type checks alone is not visual QA.
- Keep error states calm, clear and non-judgmental even when the product's main tone is savage.

## 18. Do and do not

### Do

- Use the provided palette colours as clearly defined roles.
- Make Wasabi the most recognisable action colour.
- Use deep teal as a large structural canvas inspired by the visual reference.
- Use oversized condensed headlines, thin dividers and compact mono metadata.
- Let score, verdict and roast copy carry the visual drama.
- Make the export preview feel like a premium standalone artifact.
- Alternate colour-block panels with restrained light surfaces.
- Keep the free roast experience immediate and satisfying.
- Keep the product funny without adding advice or fake data.

### Do not

- Copy the Klyro brand, content, people, slide copy or layout verbatim.
- Turn the interface into a generic purple/blue-gradient AI dashboard.
- Add SEO fixes, improvement tips, diagnostics or problem lists.
- Hide the free roast behind a payment wall.
- Use fake scarcity, fake user counts or fabricated testimonials.
- Use every brand colour at full strength in every section.
- Default to fully rounded pill cards and heavy drop shadows.
- Let animation delay the result or block keyboard access.
- Claim a website was fetched or analyzed when it was not.
- Treat client-side state as proof of payment.

## 19. Review checklist

Before shipping any Roastie surface, confirm:

- [ ] It reads as Roastie even before the wordmark is noticed.
- [ ] It uses Wasabi `#E9F056`, Cool Blue `#D7EFFF` and Orange Topaze `#FF5C34` in their defined roles.
- [ ] Deep teal is structural and does not become a fourth competing accent colour.
- [ ] Typography follows the condensed display, readable body and mono metadata system.
- [ ] The page uses framed headers, editorial grids and intentional colour blocks from the reference language.
- [ ] The score and roast are the core of the free result.
- [ ] No recommendations, fixes or issue lists have crept into the product.
- [ ] The export preview is a designed artifact, not just a screenshot of the UI.
- [ ] Price and payment state are clear and verified server-side.
- [ ] Mobile layouts work at 320px and 390px widths.
- [ ] Focus, contrast, accessible labels and reduced motion have been checked.
- [ ] Loading and failure states do not claim work succeeded when it did not.
- [ ] No Klyro-specific brand assets or copy have been reused.
