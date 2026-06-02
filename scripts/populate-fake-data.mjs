/**
 * Populates fake-data.json with researched counterfeit indicators.
 * Run: node scripts/populate-fake-data.mjs
 * Outputs: public/data/fake-data.json
 *
 * Only generates entries for brands with documented counterfeiting risk.
 * Model-specific overrides take precedence over brand-level data.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ---------------------------------------------------------------------------
// BRAND DATA — researched from manufacturer sites, GolfWRX, MyGolfSpy forums,
// and independent authentication guides. Original content, multiple sources.
// ---------------------------------------------------------------------------

const BRAND_DATA = {

  Taylormade: {
    fakeIndicators: [
      'Serial number on the hosel should follow the format TM + 2-digit year + model letter + 7 digits (e.g. TM24D1234567) — fakes often have serials that are too short, wrong format, or shallowly scratched rather than laser-etched',
      'The "TaylorMade" wordmark uses a proprietary typeface — counterfeits often have subtly thicker or thinner lettering and incorrect spacing between letters, most visible on the sole',
      'Paint fill on sole markings (loft, flex, model name) should have crisp, uniform edges — fakes show paint bleeding outside the lines or a flat matte fill',
      'Clubhead weight should be within ±2g of the published specification — counterfeits routinely vary 5–10g due to cheaper casting metal',
      'Genuine drivers come with branded shafts (Fujikura, Mitsubishi, Project X) that have the shaft manufacturer\'s own serial code near the tip — fakes use plain, unbranded graphite blanks',
    ],
    authenticityNotes: 'Genuine TaylorMade clubs are manufactured under strict QC with noticeably better finishing than fakes. The crown graphics should be perfectly centred with zero print bleed. TaylorMade offer an authenticity check via taylormadegolf.com — contact their support with the serial number to verify. Clubheads should feel solid and weighty; counterfeits often feel slightly lighter or have a hollow rattle.',
    serialNumberFormat: '12 characters: TM + 2-digit year + model letter (D=driver, I=iron, W=wood) + 7-digit identifier. Located on the hosel. Example: TM24D1234567.',
  },

  Callaway: {
    fakeIndicators: [
      'Hold a magnet to the clubhead — genuine titanium/carbon composite heads will not attract a magnet, but most counterfeits use cheaper ferrous metal that sticks',
      'Tap the carbon composite crown with a fingernail — a genuine crown produces a dull, soft thud; a metallic ringing ping means it is fake steel painted to look like carbon',
      'Serial number is stamped on the hosel with uniform digit height and depth — crooked, faint, or absent serials are a red flag; Callaway can verify any serial via customer service',
      'The Callaway chevron logo should be crisp with precisely consistent stroke weight — counterfeits often show slightly thicker strokes, off-centre placement, or a subtly different shade',
      'Genuine Callaway grips have consistent compound texture with clearly embossed branding — counterfeit grips feel cheaper, may squeak on contact, or have blurry logos',
    ],
    authenticityNotes: 'Callaway maintains a counterfeit warning page at callawaygolf.com/help/counterfeit-warning and will verify clubs by serial number. The Face Cup technology on Epic/Rogue/Paradym drivers produces a distinctive higher-pitched sound on off-centre hits that is very difficult to replicate in counterfeits. Genuine clubs have no visible casting seams or mould lines.',
    serialNumberFormat: 'Alphanumeric code stamped on the hosel. Format varies by year; modern clubs (2018+) use a longer alphanumeric code. Contact Callaway Customer Service to verify by serial number.',
  },

  'Scotty Cameron': {
    fakeIndicators: [
      'The shaft label must be positioned on the BACK of the shaft (facing away at address) — if the label is on the front of the shaft, the putter is counterfeit',
      'Genuine putters have a 7-digit serial number precisely laser-etched on the shaft near the top, verifiable at scottycameron.com/authentication — missing, poorly etched, or wrongly formatted serials indicate a fake',
      'Face milling on genuine models is CNC-machined to exact tolerances, producing a tight and perfectly consistent pattern — fake milling looks rougher, less uniform, or appears cast rather than machined',
      'Paint fill on genuine models uses translucent, bright pigments that allow the underlying metal to show through slightly — fakes use opaque, flat paint and often have noticeably bolder, oversized fonts',
      'Genuine Scotty Cameron putters are manufactured in the USA and never arrive with cheap plastic wrap on the head — any putter shipping directly from China or with "Made in China" markings is counterfeit',
    ],
    authenticityNotes: 'Scotty Cameron putters are among the most counterfeited golf items in the world. The official Authentication Registry at scottycameron.com allows verification by 7-digit serial number. Genuine putters are machined from stainless steel or premium teryllium and weigh noticeably more than fake zinc-alloy counterparts. A genuine Newport 2 weighs approximately 355g; fakes commonly measure 320–340g.',
    serialNumberFormat: '7 digits, laser-etched on the shaft near the top. Format: XXXXXXX. Verifiable at scottycameron.com/authentication. Circle T and gallery special releases may have different serial placement.',
  },

  Ping: {
    fakeIndicators: [
      'Every genuine PING iron has a coloured dot on the hosel indicating custom lie angle fit — counterfeits often omit the dot entirely or use the wrong colour in the wrong position',
      'PING uses a distinctive proprietary typeface — fakes frequently substitute a generic sans-serif that looks subtly different in stroke weight and letter spacing',
      'On G-series drivers, genuine sole printing is gray-toned — fakes typically display a slightly brownish or yellowed tint that becomes obvious in side-by-side comparison',
      'Genuine G-series driver headcovers have gray-embroidered PING branding — counterfeits typically use white embroidery instead of the correct gray',
      'PING customer service can verify any club by serial number — always request the serial and check with PING before buying secondhand',
    ],
    authenticityNotes: 'PING operates a tightly controlled distribution network. Counterfeits exist primarily for G-series drivers and premium irons (Blueprint, i-series). The Cushin sound-dampening insert in genuine PING irons is visible as a distinct inlay on the back of the face — its absence produces a noticeably harder sound and feel. PING can authenticate clubs at ping.com.',
    serialNumberFormat: 'Alphanumeric code on the hosel. Iron sets have individual serials on each iron\'s hosel. PING customer service can verify by serial number.',
  },

  Titleist: {
    fakeIndicators: [
      'Genuine Titleist irons use a noticeably longer ferrule (the plastic collar between shaft and hosel) than counterfeits — almost all fake Titleist sets consistently use shorter ferrules',
      'The holographic security label on genuine clubs sits on the underside of the shaft near the grip — counterfeits place this sticker on the top of the shaft where it is easily visible, which is a clear giveaway',
      'Forged Titleist irons (T100, AP2, CB, MB) develop natural bag-chatter scuff marks on the topline from soft forged metal — a "used" set without any bag chatter may be harder cast metal counterfeits',
      'Font on counterfeit AP2 and T-series irons is noticeably larger than on genuine models, and the diagonal cavity lines run at different angles than the authentic design',
      'Titleist serial numbers on clubs from 2013 onwards are laser-etched — the engraving should be crisp with no shadow or double-image; a serial that looks stamped or pressed on a modern model suggests a fake',
    ],
    authenticityNotes: 'Titleist operates a serial number verification service via Team Titleist at titleist.com/teamtitleist. Genuine forged irons have a distinctive soft, dampened feel at impact that is very difficult to replicate in cast counterfeits. Grain-flow forging marks are visible under magnification on T100, CB, and MB models. For Vokey wedges, the dot vs dash between loft and bounce numbers is one of the clearest tells.',
    serialNumberFormat: 'Laser-etched on modern clubs (2013+). Irons: on each iron\'s hosel. Drivers/woods: on hosel or near grip. Vokey wedges: on the hosel near the ferrule. Verify via titleist.com/teamtitleist.',
  },

  Mizuno: {
    fakeIndicators: [
      'Inside the hosel of genuine Mizuno irons are distinct adhesive-aid grooves clearly visible with a torch — fake hosels are smooth inside with barely visible or no internal grooves',
      'Genuine Mizuno irons use a .355 taper-tip hosel; counterfeits often substitute the more common .370 parallel tip, detectable by measurement or a professional fitter',
      'The "Grain Flow Forged" stamp on the sole of forged models should be finely etched and precise — fakes reproduce this poorly with shallow or blurred lettering',
      'Head weights in a genuine iron set progress consistently by 7–8g from long to short irons — fakes show inconsistent, illogical weight distribution with no clear progression',
      'The Mizuno logo in the cavity should be slightly recessed into the metal with crisp, uniform edges — counterfeits have logos that sit flush or stand proud of the surface',
    ],
    authenticityNotes: 'Mizuno irons are widely considered the gold standard for forged quality. The feel difference between genuine and counterfeit is immediately apparent to experienced players — genuine Mizuno irons produce a butter-soft, dampened sensation at impact. The serial number is laser-etched on the hosel above the ferrule and should match the warranty card supplied with new clubs.',
    serialNumberFormat: 'Laser-etched on the hosel above the ferrule. Format: plant code (2 letters) + model/year code (4 digits) + unique sequence (4 digits). Example: JP2301-0578. Individual serial per iron on forged JP-branded models.',
  },

  PXG: {
    fakeIndicators: [
      'Any serial number beginning with "YIAA" is from a known counterfeit batch — genuine PXG serials begin with "PXG" followed by model-specific codes',
      'PXG clubs are sold exclusively through PXG directly or authorised PXG Fitting Specialists — "new" PXG on eBay, Amazon marketplace, or shipping from China is virtually guaranteed to be counterfeit',
      'The TPE particles (small circular elastomer inserts in iron cavities) on genuine PXG clubs feel slightly flexible when pressed and are precisely flush-aligned — fakes use rigid plastic inserts or omit them',
      'The finish quality on genuine PXG clubs is extremely refined — any visible casting seams, uneven chrome plating, bubbling, or rough edges on a "PXG" club confirm it as a counterfeit',
      'The PXG wordmark uses a specific military-stencil-inspired font — fake engravings often have slightly misaligned characters or different inter-character spacing',
    ],
    authenticityNotes: 'PXG offers serial number verification and will authenticate clubs directly via customer service. Genuine PXG clubs are exceptionally heavy for their size due to high-density tungsten weights — this weight difference is one of the clearest physical tells. PXG never discounts its products through standard channels; any price significantly below retail is a red flag. The 0311 and 0311P Gen series are the most widely faked.',
    serialNumberFormat: 'Begins with "PXG" followed by model code. Located on the back of the clubhead. Do NOT purchase if the serial begins with "YIAA" — this is a documented counterfeit batch prefix.',
  },

  Honma: {
    fakeIndicators: [
      'The serial number on genuine Honma clubs is stamped on the ferrule (the small plastic collar between shaft and hosel) — fakes often omit this entirely or stamp it elsewhere',
      'Honma Beres irons come in star ratings (1★ to 5★); genuine high-star models have gold-accented premium shafts — fake "4 or 5-star" Beres at suspiciously low prices are almost always counterfeit',
      'The finish on genuine Honma clubs is exceptionally refined, comparable to luxury watchmaking — any rough edges, inconsistent chrome, visible casting lines, or uneven plating confirm a fake',
      'Premium Honma models are manufactured in Sakata, Japan — clubs with no clear provenance or shipping directly from mainland China should be treated with extreme suspicion',
      'The Honma logo in both English and Japanese characters should be precisely and consistently engraved — counterfeits frequently have inconsistent character sizing or slightly incorrect kanji proportions',
    ],
    authenticityNotes: 'Honma is a Japanese premium brand with serious counterfeiting issues, particularly for the Beres and TW-747 series. Genuine Honma clubs are manufactured at their Sakata factory and are of noticeably superior quality. Always purchase through authorised Honma retailers and verify the serial number on the ferrule. Honma can authenticate clubs via their customer service team.',
    serialNumberFormat: 'Stamped on the ferrule (plastic collar at the top of the hosel). All genuine Honma products have a verifiable serial. Contact Honma Golf directly to authenticate.',
  },

  Miura: {
    fakeIndicators: [
      'Genuine Miura irons have the word "Genuine" stamped on the back of the hosel — if this stamp is absent, poorly executed, or in the wrong position, treat the club as counterfeit',
      'Sole iron-number stamps on genuine Miura clubs are finely machined with consistent depth and equal spacing — counterfeits have noticeably sloppy, inconsistent sole stampings',
      'Genuine Miura clubs are forged, leaving specific grain flow patterns visible under magnification on the face — cast counterfeits show a smooth, pore-free surface without these marks',
      'The CB-302 and MC-501 models are the most heavily counterfeited, with dozens of fake listings documented on eBay from Chinese sellers — prices below £250 per iron are a serious red flag',
      'Genuine Miura packaging is minimal and refined in the Japanese tradition with specific paper weight and precise printing — counterfeit packaging is visibly flimsier',
    ],
    authenticityNotes: 'Miura is a boutique Japanese forger whose clubs cost £200–£400 per iron new. The level of craftsmanship is immediately apparent on handling genuine clubs. GolfWRX forums have extensively documented the influx of fake MC-501s on eBay. Only purchase through authorised Miura dealers. Contact Miura Golf directly if in doubt.',
    serialNumberFormat: 'Laser-etched or stamped on the hosel. Individual serial per club. Contact your authorised Miura dealer or Miura Golf directly to verify.',
  },

  Cleveland: {
    fakeIndicators: [
      'On Cleveland iron sets manufactured after 2009, the serial number appears only on the 6 or 7 iron — if every iron in a set has an individual serial number, that is incorrect and a potential red flag',
      'Genuine Cleveland RTX wedges have a consistent, finely satin-finished sole with precise groove geometry — fake wedges frequently have an overly shiny or patchy finish with less defined groove edges',
      'Cleveland shaft bands on genuine clubs are perfectly straight and firmly adhered with no edge-lift — counterfeit shaft bands are commonly slightly crooked and begin peeling from the edges',
      'The Cleveland font on wedge soles and iron faces is a specific sans-serif — fakes reproduce it with slightly thinner strokes or different letter proportions',
      'Excess epoxy visible around the ferrule-hosel join is a common counterfeit tell — genuine Cleveland clubs have clean, tight assembly with no visible adhesive',
    ],
    authenticityNotes: 'Cleveland Golf/Srixon (owned by Dunlop Sports) can authenticate clubs by contacting an authorised dealer who can arrange an inspection with headquarters. RTX ZipCore wedges in particular have been faked due to their popularity. Contact Dunlop Sports UK to verify any club by serial number.',
    serialNumberFormat: 'On the hosel of each club. For iron sets post-2009, serial appears only on the 6 or 7 iron. Contact Dunlop Sports / Cleveland Golf to verify.',
  },

  Srixon: {
    fakeIndicators: [
      'Genuine Srixon Z-Forged and ZX-series forged irons show visible grain-flow patterns on the face under magnification — cast counterfeits have a smooth, uniform, pore-free surface',
      'Srixon uses a urethane microsphere in ZX iron cavities for sound and feel — fakes omit this, producing a noticeably harder feel and a higher-pitched clang at impact',
      'Serial numbers are stamped on the hosel of each iron — Dunlop Sports (Srixon\'s parent) can verify; take to an authorised dealer for confirmation',
      'The "Srixon" logo uses a specific italic typeface with a defined pitch angle — counterfeits frequently deviate in letter spacing or italic angle',
      'Genuine Srixon forged irons in used condition develop soft face indentations from ball impact — a "used" set with no face wear may indicate cast counterfeits',
    ],
    authenticityNotes: 'Srixon counterfeiting is less prevalent than TaylorMade or Titleist but does occur, particularly for the Z-Forged and ZX7 Mk II series. Cleveland and Srixon share parent company Dunlop Sports and the same authentication route. Purchase from authorised UK Srixon stockists for peace of mind.',
    serialNumberFormat: 'Stamped on the hosel of each club. Contact Dunlop Sports / Srixon to verify by serial number.',
  },

  Cobra: {
    fakeIndicators: [
      'Cobra serial numbers are located on the hosel — any club with no serial, a poorly etched serial, or characters in the wrong font should be avoided',
      'The KING logo on genuine KING-series drivers uses bold, consistent lettering with a specific yellow/amber colour — fakes often miss the correct colour weight or use flat yellow paint',
      'Genuine Cobra carbon crown models (Speedzone, LTDx) have a visually structured carbon weave — fakes substitute painted metal where the pattern looks printed and flat rather than textured',
      'The adjustable hosel sleeve on genuine Cobra drivers has COBRA-branded markings — fakes use generic, unbranded sleeves or omit the branding entirely',
      'Excess epoxy visible around the ferrule or hosel join is a common counterfeit tell — genuine Cobra clubs have clean, tight assembly with no visible adhesive',
    ],
    authenticityNotes: 'Cobra counterfeiting is less prevalent than TaylorMade or Callaway but the KING Speedzone and LTDx series have been faked. Genuine Cobra clubs are manufactured to Acushnet/PUMA group quality standards. Cobra customer service can verify authenticity by serial number.',
    serialNumberFormat: 'Alphanumeric code on the hosel. Contact Cobra Golf customer service to verify by serial number.',
  },

  XXIO: {
    fakeIndicators: [
      'XXIO clubs are exceptionally lightweight by design — genuine MP-1100 series driver shafts weigh under 45g; a noticeably heavier shaft indicates a counterfeit with a generic blank installed',
      'The XXIO wordmark uses a specific modern typeface with precise proportions — counterfeits reproduce it with subtly different letter proportions or inter-character spacing',
      'Genuine XXIO Premium and Prime models come with specifically badged custom premium shafts — fakes use generic graphite shafts that feel stiffer and heavier',
      'XXIO packaging is distinctively refined with Japanese text and high-quality printing — counterfeit boxes use lower-weight paper with incorrectly formatted or missing Japanese characters',
      'XXIO is primarily distributed through authorised Japanese and premium international retailers — deeply discounted "new" XXIO from unknown sellers carries significant counterfeiting risk',
    ],
    authenticityNotes: 'XXIO is a premium Japanese brand from Dunlop Sports, primarily targeting the senior/high-handicap luxury market. The ultralight construction is a key identifier — genuine clubs feel noticeably lighter than almost any other brand. Purchase through authorised XXIO retailers and verify with Dunlop Sports if uncertain.',
    serialNumberFormat: 'On the hosel. Contact Dunlop Sports / XXIO to verify by serial number.',
  },

};

// ---------------------------------------------------------------------------
// MODEL-SPECIFIC OVERRIDES
// Matched against model name (case-insensitive substring).
// Provided fields override brand defaults; omitted fields fall back to brand data.
// ---------------------------------------------------------------------------

const MODEL_OVERRIDES = [

  // --- TaylorMade ---
  {
    brand: 'Taylormade', match: 'stealth',
    data: {
      fakeIndicators: [
        'The "Carbonwood" face should show a distinct woven carbon fibre texture visible at an angle — fakes substitute painted metal; tap it with a fingernail and genuine carbon produces a dull soft thud, not a metallic ring',
        'Serial number on the hosel should be exactly 12 characters (TM22D/TM23D + 7 digits) — fakes have serials that are too short or shallowly scratched rather than laser-etched',
        'The red "Stealth" script on the sole uses a specific shade and stroke weight — counterfeit versions are frequently slightly brighter or thicker',
        'Clubhead weight should be within ±2g of the 198g published spec — counterfeits vary by 5–10g due to cheaper casting',
        'Genuine stock Fujikura Ventus Red shaft has Fujikura\'s own serial code near the tip — fakes use plain unbranded graphite blanks',
      ],
      authenticityNotes: 'The Stealth series is one of the most faked TaylorMade lines due to the distinctive carbon face. The carbon twist face is unique and very difficult to counterfeit convincingly — it should feel slightly warm to the touch (carbon insulates differently to metal) and produce a unique sound that experienced players recognise immediately.',
      serialNumberFormat: 'TM22D + 7 digits on the hosel for 2022 Stealth; TM23D + 7 digits for 2023 Stealth 2. Laser-etched, not stamped.',
    },
  },
  {
    brand: 'Taylormade', match: 'qi10',
    data: {
      fakeIndicators: [
        'The Qi10 uses a 60X Carbon Twist Face — tap the face with a fingernail; genuine carbon produces a dull thud, not a metallic ring',
        'The internal carbon rib structure visible through the aft section of the crown should form a bifurcated pattern — if the interior is solid or differently shaped, the club is counterfeit',
        'Serial should follow TM24D + 7-digit format on the hosel, precisely laser-etched — fakes often have shallowly stamped or incomplete serials',
        'Sole printing should be crisp with no paint bleed — counterfeits show bleeding edges on loft/flex/model markings',
        'Stock Fujikura Ventus shaft has manufacturer\'s serial code near tip — fakes use unbranded graphite blanks',
      ],
      serialNumberFormat: 'TM24D + 7 digits on the hosel. Laser-etched.',
    },
  },
  {
    brand: 'Taylormade', match: 'qi35',
    data: {
      fakeIndicators: [
        'The Qi35 carbon face should produce a soft thud when tapped with a fingernail — a metallic ring indicates painted metal rather than genuine carbon',
        'Serial TM25D + 7 digits on hosel, precisely laser-etched — shallow or incorrectly formatted serials are fake',
        'Sole printing must be crisp with no bleed on loft/flex markings — fakes show bleeding or matte fill',
        'Clubhead weight within ±2g of published spec — fakes vary 5–10g',
        'Stock shaft should carry the shaft manufacturer\'s own serial near the tip — fakes use unbranded blanks',
      ],
      serialNumberFormat: 'TM25D + 7 digits on the hosel. Laser-etched.',
    },
  },
  {
    brand: 'Taylormade', match: 'sim2',
    data: {
      fakeIndicators: [
        'The asymmetric sole weight in SIM2 Max should be a visibly distinct insert material — fakes omit this or use a painted-on rectangle',
        'The adjustable hosel sleeve should have "TaylorMade" micro-engraved on the collar ring — fakes use smooth, unbranded sleeves',
        'Serial TM21D + 7 digits on hosel, laser-etched — fakes have shallow or wrongly formatted serials',
        'Crown graphic must be perfectly centred with no print bleed — fakes frequently have off-centre logos or bleeding paint',
        'Genuine shafts (Fujikura or Mitsubishi stock) carry the shaft maker\'s own serial near the tip — fakes use unbranded graphite',
      ],
      serialNumberFormat: 'TM21D + 7 digits on the hosel. Laser-etched.',
    },
  },

  // --- Callaway ---
  {
    brand: 'Callaway', match: 'paradym',
    data: {
      fakeIndicators: [
        'The Paradym uses a triaxial carbon crown — tap it with a fingernail for a soft thud (genuine carbon) not a metallic ring (fake metal)',
        'Magnet test: genuine titanium/carbon head will not attract a magnet; counterfeits using ferrous metal will',
        'The "PARADYM" sole lettering uses a specific bold condensed font — fakes have subtly different letter proportions',
        'Serial number stamped uniformly on the hosel — faint, crooked, or missing serials are a red flag; verify via Callaway customer service',
        'Genuine Callaway grips have clear embossed branding with consistent compound texture — fakes feel cheaper and have blurry logos',
      ],
    },
  },
  {
    brand: 'Callaway', match: 'rogue',
    data: {
      fakeIndicators: [
        'The Rogue ST uses a Jailbreak Speed Frame — genuine clubs have two visible internal pillars through the face aperture (with a light source); fakes omit this internal structure',
        'Carbon crown tap test: genuine produces a dull soft sound; fake metal crown rings metallic',
        'Magnet test on the clubhead — genuine titanium/carbon does not attract a magnet',
        'Serial on hosel should be cleanly and uniformly stamped — verify via Callaway customer service',
        'Stock Aldila Rogue shaft has manufacturer\'s own serial/logo near tip — fakes use unbranded graphite',
      ],
    },
  },
  {
    brand: 'Callaway', match: 'mack daddy',
    data: {
      fakeIndicators: [
        'The "MD" logo engraving should be deep and crisp with consistent depth — fakes have shallow or poorly defined logo engraving',
        'Groove quality is critical: genuine Mack Daddy wedges have precisely machined grooves with sharp, uniform edges — fake grooves appear cast and less defined',
        'The satin finish is consistently matte — counterfeits are frequently shinier or patchily plated',
        'Serial number on hosel — verify via Callaway customer service',
        'Groove dimensions: genuine Mack Daddy uses USGA maximum groove dimensions that fakes rarely replicate accurately',
      ],
    },
  },
  {
    brand: 'Callaway', match: 'jaws',
    data: {
      fakeIndicators: [
        'JAWS groove quality is the critical indicator — genuine wedges have micro-milled grooves with razor-sharp edges; fakes have visibly less defined, cast-quality grooves',
        'The "JAWS" lettering uses a specific typeface — fakes have subtly different character proportions',
        'Satin or raw finish should be consistent across the entire head — counterfeits have patchy plating or areas of different sheen',
        'Serial number on hosel — verify via Callaway customer service',
        'Groove dimensions can be measured: genuine Jaws Raw uses USGA maximum permitted groove dimensions which fakes rarely replicate accurately',
      ],
    },
  },

  // --- Scotty Cameron ---
  {
    brand: 'Scotty Cameron', match: 'newport',
    data: {
      fakeIndicators: [
        'Shaft label must be on the BACK of the shaft (facing away at address) — any Newport with the label on the front is counterfeit',
        '7-digit serial laser-etched on the upper shaft — verify at scottycameron.com/authentication; missing or poorly etched serials indicate fake',
        'The Newport face milling is CNC-machined with a tight, perfectly uniform horizontal pattern — fake milling is rougher and less consistent in depth or spacing',
        'The paint fill in the Cameron wordmark should be translucent (you can just see the metal underneath) — fakes use opaque, flat paint',
        'Genuine Newport putters weigh approximately 355g; zinc-alloy fake counterparts typically measure 320–340g — weigh on kitchen scales if uncertain',
      ],
      authenticityNotes: 'The Newport is the most counterfeited Scotty Cameron model. Fakes range from obvious to extremely convincing. The official authentication registry at scottycameron.com is the most reliable verification route.',
    },
  },
  {
    brand: 'Scotty Cameron', match: 'phantom',
    data: {
      fakeIndicators: [
        'Shaft label on BACK of shaft — if on the front, it is a counterfeit',
        '7-digit serial laser-etched on upper shaft — verify at scottycameron.com/authentication',
        'The Phantom X uses a multi-material construction with a distinct milled aluminium/steel face insert — fakes omit the insert or use a single-piece casting',
        'Genuine Phantom series have very precise face milling with consistent dot or line patterns — fake milling is rougher and less uniform',
        'Counterfeit Phantom headcovers use white embroidery on the Scotty Cameron branding instead of the correct silver-grey tones',
      ],
    },
  },
  {
    brand: 'Scotty Cameron', match: 'special select',
    data: {
      fakeIndicators: [
        'Shaft label must be on BACK of shaft — front placement confirms counterfeit',
        '7-digit serial laser-etched on upper shaft — verify at scottycameron.com/authentication',
        'Special Select models have a distinctive hand-finished satin surface with fine, uniform machining marks — fakes look smoother and more mass-produced',
        'The "Special Select" cavity engraving is precisely executed — fakes have shallower, less crisp text',
        'Genuine Special Select comes in branded Cameron/Titleist packaging — arriving loose or in plain boxes is suspicious',
      ],
    },
  },
  {
    brand: 'Scotty Cameron', match: 'circle',
    data: {
      fakeIndicators: [
        'Circle T putters are extremely high-value limited releases and among the most aggressively faked — shaft label must still be on the BACK of the shaft',
        '7-digit serial laser-etched on upper shaft — verify at scottycameron.com/authentication',
        'Circle T stamp should be a perfectly formed circle with "T" precisely centred — fakes have slightly off-round circles or a misaligned T',
        'Genuine Circle T putters are sold exclusively through the Scotty Cameron Gallery — any other channel for "new" Circle T is suspicious',
        'The finish on genuine Circle T putters is hand-inspected to jewellery standards — any surface imperfection indicates a fake',
      ],
      authenticityNotes: 'Circle T putters sell for £2,000–£15,000+. The faking of these is extremely sophisticated. Always obtain authentication from the Scotty Cameron Gallery or through Team Titleist before any significant purchase.',
    },
  },

  // --- PING ---
  {
    brand: 'Ping', match: 'g430',
    data: {
      fakeIndicators: [
        'Sole printing should be gray-toned — genuine G430MAX has gray sole graphics; counterfeits display a slightly brownish or yellowed tint',
        'The tungsten weight inscription on the sole confirms internal weight placement — fakes often omit this marking entirely',
        'Genuine G430 headcovers have gray-embroidered PING branding — counterfeit covers use white embroidery instead',
        'The hexagonal wrench screw hole on the sole has a specific depth — fakes have a shallower or different-diameter hole',
        'PING customer service can verify any serial — request verification before secondhand purchase',
      ],
    },
  },
  {
    brand: 'Ping', match: 'g425',
    data: {
      fakeIndicators: [
        'The G425 MAX turbulator (raised alignment aid) on the crown should match the exact shape and size — fakes often have a simplified or differently proportioned turbulator',
        'Sole printing is gray-toned on genuine clubs — brownish-yellow tint indicates a fake',
        'PING typeface on sole markings — fakes use generic sans-serif with slightly different letter spacing',
        'Coloured dot on iron hosels must be present and in the correct position for lie angle',
        'PING customer service serial verification is the definitive check',
      ],
    },
  },
  {
    brand: 'Ping', match: 'blueprint',
    data: {
      fakeIndicators: [
        'Blueprint irons are blade-style forged irons — genuine models show visible grain flow patterns under magnification; cast fakes have a smooth, uniform surface',
        'The coloured dot on the hosel is essential — Blueprint is a custom-fit product and every genuine iron should have a lie-angle dot',
        'The PING typeface used in the cavity is precise — fakes use off-specification fonts with different letter proportions',
        'Weigh individual irons — genuine sets have consistent 7–8g progression from long to short; fakes are inconsistent',
        'PING customer service serial verification is the definitive check',
      ],
    },
  },

  // --- Titleist ---
  {
    brand: 'Titleist', match: 'vokey',
    data: {
      fakeIndicators: [
        'Between the loft and bounce numbers on genuine Vokey wedges there is a DOT separator — counterfeits use a DASH; this is one of the most reliable quick-checks',
        'Genuine SM-series Vokey wedges have a satin chrome finish that is consistently matte — fakes are noticeably shinier or have patchy plating',
        'The "BV" initials engraved on genuine Vokey are in a slightly heavier bold typeface — on fakes the initials appear noticeably thinner',
        'The Titleist holographic security label is on the underside of the shaft near the grip — counterfeits place it on the top of the shaft where it is visible',
        'Groove precision: genuine Vokey grooves are machined to USGA-maximum tolerances with crisp, sharp edges — fake grooves are cast and visibly less defined',
      ],
      authenticityNotes: 'Vokey wedges are widely faked. The dot-vs-dash separator rule between loft and bounce numbers is the fastest visual check. Genuine wedges from the SM4 series onwards have consistent satin finishes and precisely machined grooves. Titleist verify serials via Team Titleist.',
    },
  },
  {
    brand: 'Titleist', match: 't100',
    data: {
      fakeIndicators: [
        'Ferrule length: genuine T100 irons use a longer ferrule than counterfeits — this difference is visible across the whole set',
        'Holographic security label must be under the shaft near the grip — counterfeits place it on top of the shaft',
        'The "T100" cavity engraving font matches the genuine specification — counterfeits use a noticeably larger font',
        'Genuine T100 irons are forged and develop soft bag-chatter marks on the topline — hard cast fakes resist these marks',
        'Serial laser-etched on the hosel — crisp and shadow-free; verify via Team Titleist',
      ],
    },
  },
  {
    brand: 'Titleist', match: 'ap2',
    data: {
      fakeIndicators: [
        'The "AP2" font in the cavity is noticeably larger on counterfeits than on genuine clubs — compare cavity text proportions against known authentic images',
        'The diagonal lines in the AP2 cavity run at a specific angle — on counterfeits these are at a different, more extreme angle',
        'Ferrule is shorter on counterfeits than on genuine Titleist irons',
        'The "USGMC JGGA" holographic security label with colour-shifting block belongs on the underside of the shaft near the grip — fakes place it on top',
        'Forged AP2 irons develop natural bag-chatter scuffs on the topline in use — absence on a used set may indicate cast counterfeits',
      ],
    },
  },

  // --- Mizuno ---
  {
    brand: 'Mizuno', match: 'mp-20',
    data: {
      fakeIndicators: [
        'The MP-20 "Grain Flow Forged" stamp on the sole should be laser-etched with fine, consistent lettering — fakes reproduce it shallowly or with blurred characters',
        'Inside the hosel: genuine MP-20 has clearly visible adhesive-aid grooves; fake hosels are smooth or have barely visible grooves',
        '.355 taper-tip hosel on genuine MP-20 — fakes use the more common .370 parallel tip',
        'Face feel: genuine MP-20 has a distinctively soft, dampened feel; fakes feel harder and produce a sharper clang at impact',
        'Weight progression 7–8g heavier per iron from 3 to PW — fakes show inconsistent weight distribution',
      ],
    },
  },
  {
    brand: 'Mizuno', match: 'jpx',
    data: {
      fakeIndicators: [
        'The "Grain Flow Forged" stamp on forged JPX models should be precise and finely etched — fakes have shallow or blurred stamping',
        'Inside hosel: genuine has clear adhesive-aid grooves; fakes are smooth',
        'Serial laser-etched on hosel above ferrule: JP + year code + sequence — fakes have incorrect format or no serial',
        'Head weight progression (7–8g per iron) — fakes show no logical progression',
        'Mizuno logo in cavity should be slightly recessed with crisp edges — fakes have logo flush or raised above the surface',
      ],
    },
  },

  // --- PXG ---
  {
    brand: 'PXG', match: '0311',
    data: {
      fakeIndicators: [
        'Serial must begin with "PXG" — any serial starting with "YIAA" is from a documented counterfeit batch',
        'TPE particles (elastomer cavity inserts) should feel slightly flexible when pressed — fakes use rigid plastic or omit them entirely',
        'The PXG wordmark engraving depth and font weight must match exactly — fakes deviate in character spacing or weight',
        'Only purchase new PXG from pxg.com or authorised fitting specialists — eBay and Amazon 0311s are almost always counterfeit',
        'Genuine 0311 irons are notably heavy (high-density tungsten weights) — significantly lighter-than-expected clubs indicate counterfeits',
      ],
    },
  },

  // --- Miura ---
  {
    brand: 'Miura', match: 'mc-501',
    data: {
      fakeIndicators: [
        '"Genuine" stamp on back of hosel — if absent or poorly executed, treat as counterfeit',
        'MC-501 is the single most counterfeited Miura model with documented fake influx on eBay from Chinese sellers (GolfWRX threads confirm this)',
        'Sole iron-number stamps finely machined with consistent depth — fakes have sloppy, inconsistent stamping',
        'Forging grain flow patterns visible under magnification on face — cast fakes are smooth and pore-free',
        'Price below £250 per iron for MC-501 is almost certainly fake given the new RRP of £350+ per iron',
      ],
    },
  },
  {
    brand: 'Miura', match: 'cb-301',
    data: {
      fakeIndicators: [
        '"Genuine" stamp on back of hosel — absent or poorly executed stamp indicates counterfeit',
        'CB-301 widely faked on eBay from Chinese sellers — GolfWRX forums have extensive documented cases',
        'Sole number stamps must be precise with uniform depth — fakes are sloppy and inconsistent',
        'Forging grain flow marks under magnification — cast fakes are smooth',
        'CB-301 genuine price is £280–£350 per iron — significant discounts are a serious warning sign',
      ],
    },
  },
  {
    brand: 'Miura', match: 'cb-302',
    data: {
      fakeIndicators: [
        '"Genuine" stamp on back of hosel — absent or poorly executed stamp indicates counterfeit',
        'CB-302 is a known counterfeit target on eBay and DHGate from Chinese sellers',
        'Sole number stamps must be precise with uniform depth — fakes are sloppy',
        'Forging grain flow marks visible under magnification on face — cast fakes are smooth',
        'Genuine price is £280–£360 per iron — deep discounts are a serious warning sign',
      ],
    },
  },

];

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------

function findBrandData(brand) {
  return BRAND_DATA[brand] || null;
}

function findModelOverrides(brand, modelName, clubName) {
  const search = (modelName + ' ' + clubName).toLowerCase();
  return MODEL_OVERRIDES.filter(o =>
    o.brand === brand && search.includes(o.match.toLowerCase())
  );
}

function mergeData(brandData, overrides) {
  if (!brandData && overrides.length === 0) return null;

  let fakeIndicators = brandData ? [...brandData.fakeIndicators] : [];
  let authenticityNotes = brandData ? brandData.authenticityNotes : '';
  let serialNumberFormat = brandData ? brandData.serialNumberFormat : '';

  for (const override of overrides) {
    if (override.data.fakeIndicators) fakeIndicators = override.data.fakeIndicators;
    if (override.data.authenticityNotes) authenticityNotes = override.data.authenticityNotes;
    if (override.data.serialNumberFormat) serialNumberFormat = override.data.serialNumberFormat;
  }

  fakeIndicators = fakeIndicators.slice(0, 5);

  if (fakeIndicators.length === 0 && !authenticityNotes && !serialNumberFormat) return null;

  return { fakeIndicators, authenticityNotes, serialNumberFormat };
}

function main() {
  const modelsPath = join(ROOT, 'public', 'data', 'models.json');
  const outputPath = join(ROOT, 'public', 'data', 'fake-data.json');

  console.log('Reading models.json...');
  const models = JSON.parse(readFileSync(modelsPath, 'utf8'));
  console.log(`Loaded ${models.length} models`);

  const fakeData = {};
  let populated = 0;
  let skipped = 0;
  const brandCounts = {};

  for (const model of models) {
    const brandData = findBrandData(model.brand);
    const overrides = findModelOverrides(model.brand, model.model || '', model.name || '');
    const merged = mergeData(brandData, overrides);

    if (merged) {
      fakeData[String(model.id)] = merged;
      populated++;
      brandCounts[model.brand] = (brandCounts[model.brand] || 0) + 1;
    } else {
      skipped++;
    }
  }

  writeFileSync(outputPath, JSON.stringify(fakeData, null, 2), 'utf8');

  console.log(`\nDone! Written to public/data/fake-data.json`);
  console.log(`  Populated: ${populated} models`);
  console.log(`  Skipped (no data): ${skipped} models`);
  console.log(`\nBreakdown by brand:`);
  Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([brand, count]) => console.log(`  ${brand}: ${count}`));
}

main();
