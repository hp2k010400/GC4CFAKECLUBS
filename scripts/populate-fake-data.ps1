cd "C:\Users\harry.phillips.GOLFCLUBS4CASH\Projects\gc4c-fake-guide"

$models = Get-Content "public/data/models.json" -Raw | ConvertFrom-Json

# Map product type string -> group key, with name fallback for blank productType
function Get-TypeGroup($productType, $name = "") {
  $pt = $productType.ToLower()
  switch -Wildcard ($pt) {
    "driver"          { return "driver" }
    "fairway wood"    { return "driver" }
    "fairway woods"   { return "driver" }
    "hybrid"          { return "driver" }
    "irons"           { return "iron" }
    "individual iron" { return "iron" }
    "wedge"           { return "wedge" }
    "putter"          { return "putter" }
  }
  # Infer from name when productType is blank
  $n = $name.ToLower()
  if ($n -match "\birons?\b|\biron set\b") { return "iron" }
  if ($n -match "\bwedge\b")              { return "wedge" }
  if ($n -match "\bputter\b")             { return "putter" }
  if ($n -match "\bdriver\b|\bfairway\b|\bhybrid\b") { return "driver" }
  return "default"
}

# Brand data: each brand has keys "driver", "iron", "wedge", "putter", "default"
# Missing keys fall back to "default"
$brandData = @{

  # =========================================================
  # TAYLORMADE
  # =========================================================
  "Taylormade" = @{
    "driver" = @{
      fakeIndicators = @(
        "Serial on hosel must follow TM + 2-digit year + D/W/H + 7 digits (e.g. TM22D1234567), laser-etched — fakes have wrong format, too few characters, or shallowly scratched serials",
        "The TaylorMade wordmark on the sole uses a proprietary typeface — fakes have subtly different letter spacing or stroke weight, most visible when compared directly",
        "Crown graphics must be perfectly centred with zero print bleed — fakes have off-centre logos or paint bleeding outside the lines",
        "Clubhead weight within 2g of the published specification — counterfeits vary 5-10g due to cheaper casting metal",
        "Stock shaft (Fujikura, Mitsubishi, Project X) carries the shaft manufacturer's own serial code near the tip — fakes use plain, unbranded graphite blanks"
      )
      authenticityNotes = "TaylorMade drivers are among the most counterfeited clubs in the world. TaylorMade offer authenticity checks via taylormadegolf.com — contact support with the serial number to verify. On modern carbon face models (Stealth, Qi series), tapping the face with a fingernail should produce a dull soft thud, not a metallic ring."
      serialNumberFormat = "TM + 2-digit year + model letter (D=driver, W=wood, H=hybrid) + 7 digits. Example: TM22D1234567. Laser-etched on the hosel."
    }
    "iron" = @{
      fakeIndicators = @(
        "Serial on each iron's hosel must follow TM + 2-digit year + I + 7 digits, laser-etched — fakes have wrong format, too few characters, or shallowly scratched serials",
        "Chrome or satin finish should be perfectly consistent across the entire set — fakes have patchy plating, inconsistent sheen, or visible casting seams on the sole",
        "Head weight must progress consistently 7-8g heavier from long iron to short iron — fakes show inconsistent, illogical weight distribution across the set",
        "Ferrule (plastic collar between shaft and hosel) should match the genuine specified length — fakes use shorter, generic ferrules throughout the set",
        "Cavity engraving and sole markings (loft, model name) should be laser-etched with crisp edges — fakes show blurred, shallow, or bleeding characters"
      )
      authenticityNotes = "TaylorMade irons (P-series, SIM, Qi) are regularly counterfeited. The P790 is particularly widely faked due to its hollow construction and high value. The chrome finish on genuine clubs is more uniform and refined than on counterfeits. Verify serial numbers via TaylorMade customer service."
      serialNumberFormat = "TM + 2-digit year + I + 7 digits per iron. Example: TM23I1234567. Laser-etched on each iron's hosel."
    }
    "wedge" = @{
      fakeIndicators = @(
        "Serial on hosel laser-etched in TM format — fakes have wrong format, shallow scratching, or no serial at all",
        "Groove quality is critical: genuine TaylorMade Milled Grind wedges have precisely machined grooves with sharp, uniform edges — fakes have cast grooves that are visibly less defined",
        "The sole finish (raw, chrome, or satin depending on model) should be completely consistent with no patchy or shinier areas — fakes have uneven plating",
        "Milled face models show fine, consistent milling marks across the entire face — fakes have a smoother, cast-quality face without milling texture",
        "Shaft band should be perfectly aligned and firmly adhered — counterfeit shaft bands are frequently crooked and begin peeling at the edges"
      )
      authenticityNotes = "TaylorMade Milled Grind wedges are faked, though less frequently than drivers. Groove precision is the most important check — genuine machined grooves spin noticeably more than cast fake grooves. Verify serial via TaylorMade customer service."
      serialNumberFormat = "TM + 2-digit year + W + 7 digits. Laser-etched on the hosel."
    }
    "default" = @{
      fakeIndicators = @(
        "Serial on hosel must follow TM + 2-digit year + model letter + 7 digits, laser-etched — fakes have wrong format or shallowly scratched serials",
        "TaylorMade wordmark uses a proprietary typeface — fakes have subtly different letter spacing or stroke weight",
        "Paint fill on all markings should have crisp, uniform edges — fakes show bleeding paint or flat matte fill",
        "Clubhead weight within 2g of published specification — fakes vary 5-10g",
        "Stock shaft carries the shaft manufacturer's own serial near the tip — fakes use unbranded graphite blanks"
      )
      authenticityNotes = "Verify authenticity via TaylorMade customer service at taylormadegolf.com."
      serialNumberFormat = "TM + 2-digit year + model letter + 7 digits. Laser-etched on the hosel."
    }
  }

  # =========================================================
  # CALLAWAY
  # =========================================================
  "Callaway" = @{
    "driver" = @{
      fakeIndicators = @(
        "Hold a magnet to the clubhead — genuine titanium heads will not attract a magnet; most counterfeits use cheaper ferrous metal that sticks",
        "Serial number stamped uniformly on the hosel with consistent digit height — crooked, faint, or absent serials are a red flag; Callaway verify any serial via customer service",
        "The Callaway chevron logo should be crisp with precisely consistent stroke weight — fakes show slightly thicker strokes, off-centre placement, or a subtly different shade",
        "Finish quality should be uniform with no visible casting seams, mould lines, or rough edges — fakes have noticeably lower build quality",
        "Stock shaft (Aldila, Mitsubishi, Project X) carries the manufacturer's own serial near the tip — fakes use plain, unbranded graphite blanks"
      )
      authenticityNotes = "Callaway maintain a counterfeit warning page at callawaygolf.com/help/counterfeit-warning and will verify clubs by serial number. On modern carbon crown models (Epic, Rogue, Paradym series): tap the crown with a fingernail — genuine carbon produces a dull soft thud, not a metallic ring."
      serialNumberFormat = "Alphanumeric code stamped on the hosel. Modern clubs (2018+) use a longer code. Contact Callaway Customer Service to verify."
    }
    "iron" = @{
      fakeIndicators = @(
        "Serial on each iron's hosel, uniformly stamped — crooked, faint, or absent serials are a red flag; Callaway verify any serial via customer service",
        "Ferrule (plastic collar between shaft and hosel) should be consistent in length across the set — fakes use shorter, generic ferrules that are visibly different",
        "Head weight must progress consistently 7-8g heavier from long iron to short iron — fakes have inconsistent, illogical weight distribution",
        "Chrome or satin finish should be perfectly uniform across the set with no visible seams, casting lines, or areas of different sheen",
        "Shaft bands should be perfectly straight and firmly adhered — counterfeit shaft bands are frequently crooked and begin peeling at the edges"
      )
      authenticityNotes = "Callaway irons across all ranges are counterfeited. Forged models (Apex, Apex Pro) have a distinctively soft, dampened feel at impact that cast counterfeits cannot replicate. Verify serial numbers via Callaway customer service."
      serialNumberFormat = "Alphanumeric code stamped on each iron's hosel. Contact Callaway Customer Service to verify."
    }
    "wedge" = @{
      fakeIndicators = @(
        "Groove precision is the most critical check — genuine Callaway Mack Daddy and Jaws wedges have precisely machined grooves with razor-sharp, uniform edges; fakes have cast grooves that are visibly less defined",
        "Groove count, depth, and spacing should match the genuine specification — on fakes the bottom groove often starts higher on the face and individual grooves may be shallower or fewer",
        "Satin or raw finish should be completely consistent across the sole and face — fakes have patchy plating or noticeably shinier areas",
        "The MD or JAWS logo engraving should be deep and crisp with consistent depth — fakes have shallow, poorly defined engraving",
        "Serial on hosel uniformly stamped — verify via Callaway customer service"
      )
      authenticityNotes = "Callaway Mack Daddy and Jaws wedges are faked. Groove quality is everything — genuine machined grooves produce significantly more spin than the cast grooves found on fakes. Callaway verify serials via their customer service team."
      serialNumberFormat = "Alphanumeric code stamped on the hosel. Contact Callaway Customer Service to verify."
    }
    "default" = @{
      fakeIndicators = @(
        "Hold a magnet to the clubhead — genuine titanium/carbon does not attract a magnet; ferrous fake metal will",
        "Serial on hosel uniformly stamped — crooked, faint, or absent serials are a red flag; verify via Callaway",
        "Callaway chevron logo crisp and consistently proportioned — fakes have subtly different strokes or placement",
        "Genuine Callaway grips have consistent compound texture with clearly embossed branding — fakes feel cheaper and have blurry logos",
        "Finish quality uniform with no visible casting seams or lines"
      )
      authenticityNotes = "Verify authenticity via Callaway customer service at callawaygolf.com."
      serialNumberFormat = "Alphanumeric code stamped on the hosel. Contact Callaway Customer Service to verify."
    }
  }

  # =========================================================
  # SCOTTY CAMERON (putters only)
  # =========================================================
  "Scotty Cameron" = @{
    "putter" = @{
      fakeIndicators = @(
        "The shaft label must be on the BACK of the shaft (facing away at address) — if it is on the front, the putter is counterfeit",
        "Genuine putters have a 7-digit serial number precisely laser-etched on the shaft near the top, verifiable at scottycameron.com/authentication — missing, poorly etched, or wrongly formatted serials indicate a fake",
        "Face milling is CNC-machined to exact tolerances, producing a tight and perfectly consistent pattern — fake milling looks rougher, less uniform, or appears cast rather than machined",
        "Paint fill uses translucent, bright pigments that allow the underlying metal to show through slightly — fakes use opaque, flat paint with noticeably bolder, oversized cavity fonts",
        "Genuine Scotty Cameron putters are made in the USA and never arrive with cheap plastic wrap on the head — any putter shipping from China or with Made in China markings is counterfeit"
      )
      authenticityNotes = "Scotty Cameron putters are among the most counterfeited golf items in the world. The Authentication Registry at scottycameron.com allows verification by 7-digit serial number. A genuine Newport 2 weighs approximately 355g; zinc-alloy fakes typically measure 320-340g."
      serialNumberFormat = "7 digits, laser-etched on the shaft near the top. Format: XXXXXXX. Verifiable at scottycameron.com/authentication."
    }
    "default" = @{
      fakeIndicators = @(
        "Shaft label must be on the BACK of the shaft — front placement confirms counterfeit",
        "7-digit serial laser-etched on upper shaft — verify at scottycameron.com/authentication",
        "Face milling CNC-machined with tight, consistent pattern — fakes are rougher and appear cast",
        "Paint fill translucent on genuine — fakes use opaque flat paint",
        "Made in USA — any China provenance confirms counterfeit"
      )
      authenticityNotes = "Verify at scottycameron.com/authentication using the 7-digit serial number."
      serialNumberFormat = "7 digits, laser-etched on the shaft. Verifiable at scottycameron.com/authentication."
    }
  }

  # =========================================================
  # PING
  # =========================================================
  "Ping" = @{
    "driver" = @{
      fakeIndicators = @(
        "Sole printing on G-series drivers should be gray-toned — fakes display a slightly brownish or yellowed tint that is obvious in direct comparison",
        "The tungsten weight inscription on the G-series sole confirms the internal weight placement — fakes often omit this marking entirely",
        "Genuine G-series headcovers have gray-embroidered PING branding — counterfeit covers use white embroidery instead of the correct gray",
        "Serial on hosel — PING customer service will verify any serial number; always check before a secondhand purchase",
        "Stock shaft carries the manufacturer's own serial near the tip — fakes use unbranded graphite blanks"
      )
      authenticityNotes = "PING operates a tightly controlled distribution network. Counterfeits primarily target G-series drivers. PING customer service will authenticate any club by serial number at ping.com."
      serialNumberFormat = "Alphanumeric code on the hosel. PING customer service can verify."
    }
    "iron" = @{
      fakeIndicators = @(
        "Every genuine PING iron has a coloured dot on the hosel for custom lie angle fit — fakes often omit the dot entirely or use the wrong colour in the wrong position",
        "The Cushin sound-dampening insert is visible as a distinct inlay on the back of the face in genuine PING irons — its absence produces noticeably harder feel and sound at impact",
        "PING uses a distinctive proprietary typeface — fakes substitute a generic sans-serif with subtly different stroke weight and letter spacing",
        "Head weight must progress consistently 7-8g from long to short iron — fakes show inconsistent, illogical weight distribution",
        "Serial on each iron's hosel — PING customer service will verify any serial number"
      )
      authenticityNotes = "PING irons (i-series, Blueprint, G-series) are counterfeited. The coloured lie-angle dot is one of the clearest tells — it is unique to PING and fakes rarely replicate it correctly. PING verify serials via their customer service team at ping.com."
      serialNumberFormat = "Alphanumeric code on each iron's hosel. PING customer service can verify."
    }
    "wedge" = @{
      fakeIndicators = @(
        "Every genuine PING wedge has a coloured dot on the hosel for lie angle — fakes frequently omit this or use an incorrect colour/position",
        "Groove precision: genuine PING Glide wedges have precisely machined grooves with sharp, uniform edges — fakes have cast grooves that are visibly less defined",
        "Sole finish should be consistently satin with no patchy or shinier areas — fakes have uneven plating",
        "PING typeface on sole markings is distinctive — fakes substitute a generic sans-serif with slightly different proportions",
        "Serial on hosel — PING customer service will verify"
      )
      authenticityNotes = "PING Glide wedges are occasionally faked. The coloured lie-angle dot and groove quality are the key checks. Verify via PING customer service."
      serialNumberFormat = "Alphanumeric code on the hosel. PING customer service can verify."
    }
    "putter" = @{
      fakeIndicators = @(
        "Face milling on genuine PING putters is precisely machined with a consistent pattern — fakes have rougher, less uniform milling or a cast face",
        "PING uses a distinctive proprietary typeface on cavity and sole markings — fakes substitute a generic sans-serif with different proportions",
        "The coloured dot on the hosel for lie angle should be present and in the correct position — fakes often omit this",
        "Genuine PING putters produce a soft, muted click at impact from the precision insert — fakes with no insert produce a harder, more metallic sound",
        "Serial on hosel — PING customer service will verify any serial number"
      )
      authenticityNotes = "PING putters (Anser, Sigma, PLD series) are occasionally counterfeited. The PING customer service team will verify authenticity by serial number."
      serialNumberFormat = "Alphanumeric code on the hosel. PING customer service can verify."
    }
    "default" = @{
      fakeIndicators = @(
        "PING coloured lie-angle dot on hosel must be present and correct — fakes often omit or misplace it",
        "PING proprietary typeface — fakes use generic sans-serif with different proportions",
        "Serial on hosel — PING customer service will verify",
        "Finish quality: sole printing gray-toned not brownish on G-series",
        "Headcovers: gray embroidery not white"
      )
      authenticityNotes = "PING customer service will verify any club by serial number at ping.com."
      serialNumberFormat = "Alphanumeric code on the hosel. PING customer service can verify."
    }
  }

  # =========================================================
  # TITLEIST
  # =========================================================
  "Titleist" = @{
    "driver" = @{
      fakeIndicators = @(
        "Serial laser-etched on the hosel — crisp with no shadow or double-image; a serial that looks stamped or pressed on a modern Titleist driver suggests a fake",
        "Crown graphics perfectly centred with no print bleed — fakes have off-centre logos or bleeding colour",
        "The adjustable hosel sleeve should have Titleist micro-engraved on the collar ring — fakes use smooth, unbranded sleeves",
        "Stock shaft (HZRDUS, Tensei, Kuro Kage) carries the shaft manufacturer's own serial near the tip — fakes use unbranded graphite",
        "The Titleist holographic security label sits on the underside of the shaft near the grip — fakes place it on the visible top of the shaft"
      )
      authenticityNotes = "Titleist drivers are less commonly faked than irons/wedges but counterfeits exist for TS and TSR series. Verify serials via Team Titleist at titleist.com/teamtitleist."
      serialNumberFormat = "Laser-etched on the hosel. Verify via titleist.com/teamtitleist."
    }
    "iron" = @{
      fakeIndicators = @(
        "Ferrule (plastic collar between shaft and hosel) is noticeably longer on genuine Titleist irons than on counterfeits — this is consistent across the whole set and one of the quickest visual checks",
        "The holographic security label must be on the underside of the shaft near the grip — counterfeits always place it on the top of the shaft where it is easily visible",
        "Forged models (T100, T100s, AP2, CB, MB) develop natural bag-chatter scuff marks on the topline from soft metal — a used set with no topline marks may be cast counterfeits",
        "Cavity engraving font on T100/AP2/T-series matches the genuine specification — counterfeit fonts are noticeably larger and the diagonal cavity lines run at a different angle",
        "Serial laser-etched on each iron's hosel — crisp with no shadow; verify via Team Titleist at titleist.com/teamtitleist"
      )
      authenticityNotes = "Titleist irons (T100, AP2, CB, MB, 716/718/620) are heavily counterfeited. The ferrule length and security label position are the two quickest checks. Genuine forged irons have a distinctive soft, dampened feel at impact that cast counterfeits cannot replicate."
      serialNumberFormat = "Laser-etched on each iron's hosel. Verify via titleist.com/teamtitleist."
    }
    "wedge" = @{
      fakeIndicators = @(
        "Between the loft and bounce numbers on genuine Vokey wedges there is a DOT separator — counterfeits consistently use a DASH; this is the fastest single visual check",
        "Genuine SM-series Vokey wedges have a satin chrome finish that is consistently matte across the entire head — fakes are noticeably shinier or have patchy plating",
        "The BV initials engraved on genuine Vokey are in a slightly heavier, bolder typeface — on fakes these initials appear noticeably thinner",
        "Groove precision: genuine Vokey grooves are machined to USGA-maximum tolerances with crisp, sharp edges — fake grooves are cast and visibly less defined under magnification",
        "The Titleist holographic security label must be on the underside of the shaft near the grip — counterfeits always place it on the visible top of the shaft"
      )
      authenticityNotes = "Vokey wedges are widely faked. The dot-vs-dash separator between loft and bounce numbers is the fastest visual check and almost never replicated correctly by fakes. Genuine machined grooves spin significantly more than cast fake grooves. Verify serials via Team Titleist."
      serialNumberFormat = "Laser-etched on the hosel near the ferrule. Verify via titleist.com/teamtitleist."
    }
    "default" = @{
      fakeIndicators = @(
        "Ferrule is noticeably longer on genuine Titleist clubs than on counterfeits",
        "Holographic security label on underside of shaft near grip — fakes place it on top",
        "Serial laser-etched on hosel — crisp, no shadow; verify via Team Titleist",
        "Logo and markings crisp with correct font proportions",
        "Finish quality consistent with no casting seams"
      )
      authenticityNotes = "Verify via Team Titleist at titleist.com/teamtitleist."
      serialNumberFormat = "Laser-etched on the hosel. Verify via titleist.com/teamtitleist."
    }
  }

  # =========================================================
  # MIZUNO
  # =========================================================
  "Mizuno" = @{
    "driver" = @{
      fakeIndicators = @(
        "Serial laser-etched on the hosel in JP + year code + sequence format — fakes have wrong format, no serial, or shallow scratching",
        "Mizuno wordmark on the sole/crown should be precisely positioned and slightly recessed with crisp edges — fakes have off-centre or raised logos",
        "Crown graphics clean with no print bleed — fakes have off-centre logos or bleeding colour",
        "Stock shaft (Fujikura, Mitsubishi) carries the manufacturer's own serial near the tip — fakes use unbranded graphite blanks",
        "Finish quality should be completely consistent with no visible casting seams or lines"
      )
      authenticityNotes = "Mizuno drivers are less commonly counterfeited than their irons. Verify serials via Mizuno customer service."
      serialNumberFormat = "Laser-etched on the hosel. JP + year code + sequence. Example: JP2301-0578."
    }
    "iron" = @{
      fakeIndicators = @(
        "Inside the hosel of genuine Mizuno irons there are distinct adhesive-aid grooves clearly visible with a torch — fake hosels are smooth inside with barely visible or no grooves",
        "Genuine Mizuno irons use a .355 taper-tip hosel — fakes substitute the more common .370 parallel tip, detectable by measurement or a professional fitter",
        "The Grain Flow Forged or Grain Flow Forged HD stamp on the sole of forged models should be finely etched and precise — fakes reproduce this shallowly or with blurred lettering",
        "Head weights must progress consistently 7-8g from long to short iron — fakes show inconsistent, illogical weight distribution with no clear pattern",
        "The Mizuno logo in the cavity should be slightly recessed into the metal with crisp, uniform edges — counterfeits have logos flush with or standing proud of the surface"
      )
      authenticityNotes = "Mizuno irons are widely considered the gold standard for forged quality. The feel difference between genuine and counterfeit is immediately apparent — genuine Mizuno irons produce a butter-soft, dampened sensation at impact. The hosel internal grooves and .355 taper tip are reliable physical checks."
      serialNumberFormat = "Laser-etched on hosel above ferrule. JP + year code + sequence. Example: JP2301-0578."
    }
    "wedge" = @{
      fakeIndicators = @(
        "The Grain Flow Forged stamp on genuine Mizuno forged wedge models should be finely etched and precise — fakes reproduce this shallowly or with blurred characters",
        "Groove quality: genuine Mizuno T-series wedges have precisely machined grooves with sharp, uniform edges — fakes have cast grooves that are visibly less defined",
        "Satin finish should be completely consistent across the entire head — fakes have patchy plating or noticeably shinier areas",
        "Inside the hosel: genuine has clear adhesive-aid grooves; fake hosels are smooth",
        "Serial laser-etched on hosel — verify via Mizuno customer service"
      )
      authenticityNotes = "Mizuno T-series wedges are occasionally counterfeited. Groove precision and the Grain Flow Forged stamp quality are the key checks. Verify via Mizuno customer service."
      serialNumberFormat = "Laser-etched on the hosel. Verify via Mizuno customer service."
    }
    "default" = @{
      fakeIndicators = @(
        "Mizuno logo slightly recessed with crisp edges — fakes have logo flush or raised above the surface",
        "Serial laser-etched on hosel in JP + year + sequence format",
        "Finish quality consistent, no casting seams or lines",
        "Font and markings precise — fakes use incorrect stroke widths",
        "Grain Flow Forged stamp finely etched on forged models"
      )
      authenticityNotes = "Verify via Mizuno customer service."
      serialNumberFormat = "Laser-etched on the hosel. JP + year code + sequence. Example: JP2301-0578."
    }
  }

  # =========================================================
  # PXG
  # =========================================================
  "PXG" = @{
    "driver" = @{
      fakeIndicators = @(
        "Serial must begin with PXG — any serial starting with YIAA is from a documented counterfeit batch",
        "PXG drivers are sold exclusively through pxg.com or authorised PXG Fitting Specialists — new PXG drivers on eBay or Amazon are virtually guaranteed to be counterfeit",
        "The PXG wordmark uses a specific military-stencil-inspired font — fakes have subtly misaligned characters or different inter-character spacing",
        "Finish quality on genuine PXG is extremely high-end — any casting seams, uneven chrome plating, bubbling, or rough edges confirm counterfeit",
        "Stock shaft (HZRDUS, Mitsubishi, Project X) carries the shaft maker's own serial near the tip — fakes use unbranded blanks"
      )
      authenticityNotes = "PXG drivers are faked due to the brand's premium pricing. PXG offer serial verification via customer service. PXG never discounts — any price significantly below retail is a red flag."
      serialNumberFormat = "Begins with PXG followed by model code. Located on the clubhead. Do NOT purchase if serial starts with YIAA."
    }
    "iron" = @{
      fakeIndicators = @(
        "Serial must begin with PXG — any serial starting with YIAA is from a documented counterfeit batch",
        "The TPE particles (small circular elastomer inserts in the cavity) feel slightly flexible when pressed — fakes use rigid plastic inserts or omit them entirely",
        "Genuine 0311 irons are notably heavy due to high-density tungsten weights — clubs that feel significantly lighter than expected are counterfeits",
        "PXG wordmark engraving depth and character spacing must match exactly — fakes deviate in font weight or spacing",
        "Only purchase from pxg.com or authorised PXG Fitting Specialists — eBay and Amazon 0311s are almost always counterfeit"
      )
      authenticityNotes = "PXG 0311 and 0311P irons are the most widely faked PXG products. The TPE particle inserts and unusual weight are the clearest physical tells. PXG offer serial verification via their customer service team."
      serialNumberFormat = "Begins with PXG followed by model code. On the back of the clubhead. Do NOT purchase if serial starts with YIAA."
    }
    "wedge" = @{
      fakeIndicators = @(
        "Serial must begin with PXG — YIAA prefix confirms counterfeit",
        "Groove quality: genuine PXG wedges have precisely machined grooves — fakes have cast, less defined grooves",
        "Finish quality is extremely high-end — any casting seams, rough edges, or uneven chrome confirm counterfeit",
        "PXG wordmark engraving matches spec exactly — fakes deviate in font weight or spacing",
        "Only purchase via pxg.com or authorised PXG Fitting Specialists"
      )
      authenticityNotes = "PXG wedges are occasionally faked. Serial verification is available via PXG customer service. PXG never discounts."
      serialNumberFormat = "Begins with PXG followed by model code. Do NOT purchase if serial starts with YIAA."
    }
    "default" = @{
      fakeIndicators = @(
        "Serial must begin with PXG — YIAA prefix confirms counterfeit",
        "Only purchase from pxg.com or authorised PXG Fitting Specialists",
        "PXG wordmark engraving precise — fakes deviate in font weight or spacing",
        "Finish quality extremely high-end — any imperfection confirms fake",
        "Genuine PXG clubs are notably heavy due to tungsten weights — lighter than expected = fake"
      )
      authenticityNotes = "PXG offer serial verification via customer service. PXG never discounts."
      serialNumberFormat = "Begins with PXG followed by model code. Do NOT purchase if serial starts with YIAA."
    }
  }

  # =========================================================
  # HONMA
  # =========================================================
  "Honma" = @{
    "driver" = @{
      fakeIndicators = @(
        "Serial is stamped on the ferrule (plastic collar at top of hosel) — fakes omit this entirely or stamp it elsewhere on the clubhead",
        "Honma logo in both English and Japanese characters should be precisely and consistently engraved — fakes have inconsistent character sizing or slightly incorrect kanji proportions",
        "Finish quality is comparable to luxury watchmaking — any rough edges, inconsistent chrome plating, or visible casting lines confirm a fake",
        "Premium Honma drivers are manufactured in Sakata, Japan — clubs with mainland China provenance should be treated with extreme suspicion",
        "Stock shaft is specifically badged as a Honma premium shaft — fakes use generic graphite with copied branding labels"
      )
      authenticityNotes = "Honma drivers are faked due to the brand's premium Japanese positioning. Genuine Honma clubs have exceptionally refined finishing. Always purchase through authorised Honma retailers and verify the serial on the ferrule."
      serialNumberFormat = "Stamped on the ferrule. Contact Honma Golf directly to authenticate."
    }
    "iron" = @{
      fakeIndicators = @(
        "Serial is stamped on the ferrule (plastic collar at top of hosel) — fakes omit this entirely or place it elsewhere",
        "Honma Beres irons carry a star rating (1 to 5 stars); genuine high-star models come with gold-accented premium shafts — fake 4 or 5-star Beres at low prices are almost certainly counterfeit",
        "Finish quality is comparable to luxury watchmaking — any rough edges, inconsistent chrome, visible casting lines, or uneven plating confirm a fake",
        "Honma logo in English and Japanese precisely engraved on the sole — fakes have inconsistent character sizing or incorrect kanji proportions",
        "Manufactured in Sakata, Japan — clubs with mainland China provenance are highly suspect"
      )
      authenticityNotes = "Honma Beres and TW-747 irons are the most commonly faked. The star rating system is frequently abused — fake high-star models at suspiciously low prices are almost always counterfeit. Verify the ferrule serial and purchase through authorised retailers."
      serialNumberFormat = "Stamped on the ferrule. Contact Honma Golf to authenticate."
    }
    "wedge" = @{
      fakeIndicators = @(
        "Serial is stamped on the ferrule — fakes omit this or stamp it elsewhere",
        "Groove quality on genuine Honma wedges is very high — fakes have cast, less defined grooves",
        "Finish quality is exceptionally refined — any inconsistency, rough edges, or uneven plating confirms a fake",
        "Honma logo in English and Japanese precisely engraved — fakes have inconsistent sizing or wrong kanji",
        "Only purchase via authorised Honma retailers"
      )
      authenticityNotes = "Verify via authorised Honma retailers. Serial on ferrule is the key check."
      serialNumberFormat = "Stamped on the ferrule. Contact Honma Golf to authenticate."
    }
    "default" = @{
      fakeIndicators = @(
        "Serial stamped on the ferrule — fakes omit this or stamp it elsewhere",
        "Finish quality comparable to luxury watchmaking — any imperfection confirms fake",
        "Honma logo in English and Japanese precisely engraved",
        "Manufactured in Sakata, Japan — China provenance is suspect",
        "Premium shaft specifically badged as Honma — fakes use generic graphite"
      )
      authenticityNotes = "Contact Honma Golf directly to authenticate. Serial is on the ferrule."
      serialNumberFormat = "Stamped on the ferrule. Contact Honma Golf to authenticate."
    }
  }

  # =========================================================
  # MIURA (irons only in practice)
  # =========================================================
  "Miura" = @{
    "iron" = @{
      fakeIndicators = @(
        "Genuine Miura irons have the word Genuine stamped on the back of the hosel — if this stamp is absent, poorly executed, or in the wrong position, treat the club as counterfeit",
        "Sole iron-number stamps are finely machined with consistent depth and equal spacing — counterfeits have noticeably sloppy, inconsistent sole stampings",
        "Genuine Miura clubs are forged, leaving specific grain flow patterns visible under magnification on the face — cast counterfeits have a smooth, pore-free surface without these marks",
        "The CB-302 and MC-501 are the most heavily counterfeited models with dozens of fake listings on eBay from Chinese sellers — prices below 250 GBP per iron are a serious red flag",
        "Genuine Miura packaging is minimal and refined in the Japanese tradition — counterfeit packaging is visibly flimsier with less precise printing"
      )
      authenticityNotes = "Miura is a boutique Japanese forger whose clubs cost 200-400 GBP per iron new. GolfWRX forums have extensively documented the influx of fake MC-501s on eBay. Only purchase through authorised Miura dealers."
      serialNumberFormat = "Laser-etched or stamped on the hosel. Individual serial per club. Contact your authorised Miura dealer or Miura Golf to verify."
    }
    "default" = @{
      fakeIndicators = @(
        "Genuine stamp on back of hosel — absent or poorly executed stamp indicates counterfeit",
        "Sole number stamps finely machined with consistent depth — fakes are sloppy",
        "Forging grain flow patterns visible under magnification on face — cast fakes are smooth",
        "Only purchase through authorised Miura dealers",
        "Prices well below RRP are almost certainly fake"
      )
      authenticityNotes = "Contact your authorised Miura dealer or Miura Golf directly to verify."
      serialNumberFormat = "Laser-etched or stamped on the hosel. Contact Miura Golf to verify."
    }
  }

  # =========================================================
  # CLEVELAND
  # =========================================================
  "Cleveland" = @{
    "iron" = @{
      fakeIndicators = @(
        "On Cleveland iron sets manufactured after 2009, the serial number appears only on the 6 or 7 iron — if every iron in the set has its own serial, that is incorrect and a potential red flag",
        "Shaft bands are perfectly straight and firmly adhered — counterfeit shaft bands are frequently slightly crooked and begin peeling from the edges",
        "Chrome finish should be completely consistent across the set — fakes have patchy plating or areas of inconsistent sheen",
        "Cleveland font on the face and sole markings is a specific sans-serif — fakes reproduce it with slightly thinner strokes or different letter proportions",
        "Ferrule length should be consistent across the set — fakes use shorter, generic ferrules"
      )
      authenticityNotes = "Cleveland irons are occasionally counterfeited. The serial number on 6/7 iron only (post-2009) is a useful check. Dunlop Sports (parent company) can verify via an authorised dealer."
      serialNumberFormat = "On the hosel of the 6 or 7 iron only for sets post-2009. Contact Dunlop Sports / Cleveland Golf to verify."
    }
    "wedge" = @{
      fakeIndicators = @(
        "RTX groove quality is the critical check — genuine Cleveland RTX wedges have precisely machined laser-milled or rotex grooves with sharp, uniform edges; fakes have cast grooves that are visibly less defined",
        "The satin or tour satin finish is completely consistent across the sole and face — fakes have patchy chrome or noticeably shinier areas",
        "Serial on the hosel — post-2009 Cleveland, verify via Dunlop Sports",
        "Shaft band perfectly aligned and firmly adhered — counterfeits are crooked and begin peeling",
        "The RTX or ZIPCORE text engraving should be crisp and precise — fakes have shallower, less defined characters"
      )
      authenticityNotes = "Cleveland RTX ZipCore wedges are faked due to their popularity. Groove quality is the most important check. Verify via Dunlop Sports through an authorised dealer."
      serialNumberFormat = "On the hosel. Contact Dunlop Sports / Cleveland Golf to verify."
    }
    "default" = @{
      fakeIndicators = @(
        "Serial on hosel (or 6/7 iron only for iron sets post-2009)",
        "Shaft bands perfectly straight and firmly adhered — fakes peel and are crooked",
        "Finish consistent — no patchy chrome or inconsistent sheen",
        "Cleveland font precise — fakes have thinner strokes or different proportions",
        "Excess epoxy at ferrule/hosel join = common fake tell"
      )
      authenticityNotes = "Contact Dunlop Sports / Cleveland Golf to verify by serial number."
      serialNumberFormat = "On the hosel. Contact Dunlop Sports / Cleveland Golf to verify."
    }
  }

  # =========================================================
  # SRIXON
  # =========================================================
  "Srixon" = @{
    "driver" = @{
      fakeIndicators = @(
        "Serial on hosel — Dunlop Sports (Srixon's parent) can verify; take to an authorised dealer",
        "Srixon logo uses a specific italic typeface with a defined pitch angle — fakes deviate in letter spacing or italic angle",
        "Carbon crown models: tap test for dull thud (genuine) vs metallic ring (fake metal)",
        "Finish quality consistent with no visible casting seams or lines",
        "Stock shaft carries the manufacturer's own serial near the tip — fakes use unbranded blanks"
      )
      authenticityNotes = "Srixon drivers are occasionally counterfeited. Verify via Dunlop Sports through an authorised dealer."
      serialNumberFormat = "On the hosel. Contact Dunlop Sports / Srixon to verify."
    }
    "iron" = @{
      fakeIndicators = @(
        "Genuine Srixon Z-Forged and ZX-series forged irons show visible grain-flow patterns on the face under magnification — cast counterfeits have a smooth, uniform, pore-free surface",
        "The urethane microsphere insert in ZX-series cavities is present on genuine clubs — fakes omit it, producing noticeably harder feel and a sharper, higher-pitched sound at impact",
        "Serial on each iron's hosel — Dunlop Sports can verify; take to an authorised dealer",
        "The Srixon logo uses a specific italic typeface with a defined pitch angle — counterfeits frequently deviate in letter spacing or the italic angle",
        "Genuine Srixon forged irons in used condition develop soft face indentations from ball impact — a used set with no face wear may indicate cast counterfeits"
      )
      authenticityNotes = "Srixon Z-Forged and ZX7 Mk II irons are occasionally counterfeited. The urethane microsphere in ZX irons and grain flow patterns on forged models are reliable physical checks. Purchase from authorised UK Srixon stockists."
      serialNumberFormat = "Stamped on each iron's hosel. Contact Dunlop Sports / Srixon to verify."
    }
    "wedge" = @{
      fakeIndicators = @(
        "Groove quality: genuine Srixon wedges have precisely machined grooves with sharp, uniform edges — fakes have cast grooves that are visibly less defined",
        "Satin finish should be perfectly consistent across the entire head — fakes have patchy chrome or noticeably shinier areas",
        "Serial on hosel — verify via Dunlop Sports through an authorised dealer",
        "Srixon italic typeface on sole markings precise — fakes deviate in angle or spacing",
        "Shaft band straight and firmly adhered — fakes are crooked and begin peeling"
      )
      authenticityNotes = "Verify via Dunlop Sports through an authorised dealer."
      serialNumberFormat = "On the hosel. Contact Dunlop Sports / Srixon to verify."
    }
    "default" = @{
      fakeIndicators = @(
        "Serial on hosel — verify via Dunlop Sports",
        "Srixon italic typeface precise — fakes deviate in angle or spacing",
        "Grain flow patterns on forged models visible under magnification — cast fakes are smooth",
        "Finish consistent — no patchy chrome or casting seams",
        "Shaft band straight and firmly adhered"
      )
      authenticityNotes = "Contact Dunlop Sports / Srixon to verify by serial number."
      serialNumberFormat = "On the hosel. Contact Dunlop Sports / Srixon to verify."
    }
  }

  # =========================================================
  # COBRA
  # =========================================================
  "Cobra" = @{
    "driver" = @{
      fakeIndicators = @(
        "Serial on the hosel — no serial, poorly etched characters, or wrong font should be avoided; verify via Cobra",
        "The KING logo uses bold, consistent lettering with a specific yellow/amber colour — fakes miss the correct colour gradient or use flat yellow paint",
        "Carbon crown models (Speedzone, LTDx): tap test — genuine structured carbon weave looks textured, not flat printed; produces a dull thud not a metallic ring",
        "The adjustable hosel sleeve has COBRA-branded markings — fakes use smooth, unbranded sleeves or generic slot markings",
        "Stock shaft carries the shaft manufacturer's own serial near the tip — fakes use unbranded graphite blanks"
      )
      authenticityNotes = "Cobra KING Speedzone and LTDx drivers have been faked. Carbon crown tap test and adjustable hosel markings are the key checks. Verify via Cobra customer service."
      serialNumberFormat = "Alphanumeric code on the hosel. Contact Cobra Golf customer service to verify."
    }
    "iron" = @{
      fakeIndicators = @(
        "Serial on each iron's hosel — verify via Cobra customer service",
        "Chrome or satin finish should be perfectly consistent across the set — fakes have patchy plating or visible casting seams on the sole",
        "Head weight must progress consistently 7-8g from long to short iron — fakes have inconsistent, illogical weight distribution",
        "Ferrule length should be consistent across the set — fakes use shorter, generic ferrules",
        "Cobra logo on the cavity correctly proportioned — fakes have subtly different letter proportions or placement"
      )
      authenticityNotes = "Cobra irons are occasionally counterfeited. Verify via Cobra customer service."
      serialNumberFormat = "Alphanumeric code on each iron's hosel. Contact Cobra Golf customer service to verify."
    }
    "wedge" = @{
      fakeIndicators = @(
        "Serial on hosel — verify via Cobra customer service",
        "Groove precision: genuine Cobra wedges have precisely machined grooves — fakes have cast, less defined grooves",
        "Finish should be consistent across the sole — fakes have patchy chrome or shinier areas",
        "Shaft band straight and firmly adhered — fakes are crooked and begin peeling",
        "Logo engraving crisp and deep — fakes have shallower characters"
      )
      authenticityNotes = "Verify via Cobra Golf customer service."
      serialNumberFormat = "Alphanumeric code on the hosel. Contact Cobra Golf customer service to verify."
    }
    "default" = @{
      fakeIndicators = @(
        "Serial on hosel — no serial or poorly etched characters; verify via Cobra",
        "KING logo correct yellow/amber colour and stroke weight",
        "Finish consistent — no patchy chrome or casting seams",
        "Excess epoxy at ferrule/hosel = common counterfeit tell",
        "Adjustable hosel has COBRA-branded markings — fakes use unbranded sleeves"
      )
      authenticityNotes = "Contact Cobra Golf customer service to verify by serial number."
      serialNumberFormat = "Alphanumeric code on the hosel. Contact Cobra Golf customer service to verify."
    }
  }

  # =========================================================
  # XXIO
  # =========================================================
  "XXIO" = @{
    "driver" = @{
      fakeIndicators = @(
        "XXIO drivers are exceptionally lightweight — genuine MP-1100 series shafts weigh under 45g; a noticeably heavier shaft confirms a generic blank installed in a fake",
        "The XXIO wordmark uses a specific modern typeface with precise proportions — counterfeits reproduce it with subtly different letter proportions or inter-character spacing",
        "The premium badged Miyazaki or XXIO custom shaft on genuine models has specific branding near the tip — fakes use generic graphite with copied label stickers",
        "XXIO packaging is distinctively refined with Japanese text and high-quality printing — counterfeit boxes use lower-weight paper with incorrectly formatted or missing Japanese characters",
        "XXIO is distributed exclusively through authorised Japanese and premium international retailers — deeply discounted new XXIO from unknown sellers is almost certainly fake"
      )
      authenticityNotes = "XXIO is a premium Japanese brand from Dunlop Sports. The ultralight construction is the clearest identifier — genuine XXIO drivers feel noticeably lighter than almost any other brand. Purchase through authorised XXIO retailers only."
      serialNumberFormat = "On the hosel. Contact Dunlop Sports / XXIO to verify."
    }
    "iron" = @{
      fakeIndicators = @(
        "XXIO irons are among the lightest available — a set that feels significantly heavier than expected indicates generic shafts have been installed in counterfeit heads",
        "The XXIO typeface in the cavity should be precise with correct letter proportions — fakes have subtly different spacing or letter weight",
        "Genuine XXIO iron sets come with specifically badged XXIO or Miyazaki custom shafts — fakes use generic graphite with copied labels",
        "Serial on each iron's hosel — Dunlop Sports can verify",
        "Only through authorised XXIO retailers — heavily discounted XXIO iron sets are almost certainly fake"
      )
      authenticityNotes = "XXIO irons target the senior/high-handicap luxury market. Ultralight construction is the key identifier. Purchase through authorised XXIO retailers and verify with Dunlop Sports if uncertain."
      serialNumberFormat = "On each iron's hosel. Contact Dunlop Sports / XXIO to verify."
    }
    "default" = @{
      fakeIndicators = @(
        "XXIO clubs are ultralight by design — noticeably heavier than expected = generic blank in a fake",
        "XXIO typeface precise — fakes have different proportions or spacing",
        "Premium badged XXIO/Miyazaki shaft — fakes use generic graphite",
        "Serial on hosel — verify via Dunlop Sports",
        "Only through authorised retailers — discounted XXIO is almost certainly fake"
      )
      authenticityNotes = "Contact Dunlop Sports / XXIO to verify. Only purchase through authorised retailers."
      serialNumberFormat = "On the hosel. Contact Dunlop Sports / XXIO to verify."
    }
  }
}

# ---------------------------------------------------------------------------
# Model-specific overrides (same as before — take priority over all brand/type data)
# ---------------------------------------------------------------------------
$modelOverrides = @(
  @{ brand="Taylormade"; match="stealth"; typeGroup="driver"; fakeIndicators=@("The Carbonwood face should show a distinct woven carbon fibre texture at an angle — fakes substitute painted metal; tap it with a fingernail and genuine carbon produces a dull soft thud, not a metallic ring","Serial on hosel TM22D or TM23D + 7 digits laser-etched — fakes have too-short or shallowly scratched serials","The red Stealth script on the sole uses a specific shade and stroke weight — counterfeit versions are frequently slightly brighter or thicker","Clubhead weight within 2g of 198g published spec — counterfeits vary 5-10g","Genuine Fujikura Ventus Red stock shaft has Fujikura's own serial code near the tip — fakes use plain unbranded blanks"); authenticityNotes="The Stealth series is one of the most faked TaylorMade lines due to the distinctive carbon face. The carbon should feel slightly warm to the touch and produce a unique sound."; serialNumberFormat="TM22D + 7 digits for 2022 Stealth; TM23D + 7 digits for 2023 Stealth 2." }
  @{ brand="Taylormade"; match="qi10"; typeGroup="driver"; fakeIndicators=@("The Qi10 uses a 60X Carbon Twist Face — tap the face with a fingernail; genuine carbon produces a dull thud, not a metallic ring","The internal carbon rib structure visible through the aft crown should form a bifurcated pattern — if solid or differently shaped, the club is counterfeit","Serial TM24D + 7 digits on hosel, precisely laser-etched — fakes have shallowly stamped or incomplete serials","Sole printing should be crisp with no paint bleed — counterfeits show bleeding edges","Stock Fujikura Ventus shaft has manufacturer's serial near tip — fakes use unbranded blanks"); serialNumberFormat="TM24D + 7 digits on the hosel. Laser-etched." }
  @{ brand="Taylormade"; match="qi35"; typeGroup="driver"; fakeIndicators=@("The Qi35 carbon face should produce a soft thud when tapped with a fingernail — a metallic ring indicates painted metal","Serial TM25D + 7 digits on hosel, laser-etched — shallow or wrong format = fake","Sole printing crisp with no bleed on loft/flex markings — fakes show bleeding","Clubhead weight within 2g of published spec — fakes vary 5-10g","Stock shaft carries manufacturer's serial near tip — fakes use unbranded blanks"); serialNumberFormat="TM25D + 7 digits on the hosel. Laser-etched." }
  @{ brand="Taylormade"; match="sim2"; typeGroup="driver"; fakeIndicators=@("The asymmetric sole weight in SIM2 Max should be a visibly distinct insert material — fakes omit this or use a painted-on rectangle","The adjustable hosel sleeve should have TaylorMade micro-engraved on the collar ring — fakes use smooth unbranded sleeves","Serial TM21D + 7 digits on hosel, laser-etched — fakes have shallow or wrong format","Crown graphic perfectly centred with no print bleed — fakes have off-centre logos","Genuine Fujikura or Mitsubishi stock shafts carry the shaft maker's own serial — fakes use unbranded graphite"); serialNumberFormat="TM21D + 7 digits on the hosel. Laser-etched." }
  @{ brand="Taylormade"; match="p790"; fakeIndicators=@("The P790 uses a hollow SpeedFoam-filled cavity — genuine irons produce a distinctive hollow, slightly dampened sound at impact; fakes sound like solid cast irons","Serial on each iron's hosel in TM + year + I + 7 digit format — fakes have wrong format or shallowly scratched serials","Ferrule length consistent across the set — fakes use shorter, generic ferrules","Chrome finish perfectly consistent with no visible casting seams or lines across the set","Head weight progression consistent 7-8g from long to short iron — fakes are inconsistent") }
  @{ brand="Callaway"; match="paradym"; typeGroup="driver"; fakeIndicators=@("The Paradym uses a triaxial carbon crown — tap with a fingernail for a soft thud (genuine) not a metallic ring (fake)","Magnet test: genuine titanium/carbon head will not attract a magnet; counterfeits using ferrous metal will","The PARADYM sole lettering uses a specific bold condensed font — fakes have subtly different letter proportions","Serial uniformly stamped on hosel — faint, crooked, or missing serials; verify via Callaway","Stock shaft carries the manufacturer's own serial near tip — fakes use unbranded blanks") }
  @{ brand="Callaway"; match="rogue"; typeGroup="driver"; fakeIndicators=@("The Rogue ST uses a Jailbreak Speed Frame — genuine clubs have two visible internal pillars through the face aperture with a light source; fakes omit this structure","Carbon crown tap test: genuine produces a dull soft sound; fake metal rings metallic","Magnet test on the clubhead — genuine titanium/carbon does not attract a magnet","Serial on hosel uniformly stamped — verify via Callaway customer service","Stock Aldila Rogue shaft has manufacturer's own serial/logo near tip") }
  @{ brand="Callaway"; match="mack daddy"; fakeIndicators=@("The MD logo engraving should be deep and crisp — fakes have shallow or poorly defined engraving","Groove quality critical: genuine Mack Daddy wedges have precisely machined grooves; fakes have cast grooves that are less defined","Satin finish consistently matte — counterfeits are shinier or patchily plated","Groove count and starting position on the face must match genuine spec — fakes often have the bottom groove starting higher","Serial on hosel — verify via Callaway") }
  @{ brand="Callaway"; match="jaws"; fakeIndicators=@("JAWS groove quality is the critical indicator — genuine wedges have micro-milled grooves with razor-sharp edges; fakes have visibly less defined cast-quality grooves","Groove count, depth, and spacing must match genuine spec — fakes often have fewer or shallower grooves","Satin or raw finish completely consistent — counterfeits have patchy plating or shinier areas","The JAWS lettering uses a specific typeface — fakes have different character proportions","Serial on hosel — verify via Callaway") }
  @{ brand="Scotty Cameron"; match="newport"; fakeIndicators=@("Shaft label must be on BACK of shaft (facing away at address) — front placement confirms counterfeit","7-digit serial laser-etched on upper shaft — verify at scottycameron.com/authentication","The Newport face milling is CNC-machined with a tight, uniform horizontal pattern — fakes are rougher and less consistent","Paint fill in Cameron wordmark should be translucent (metal visible underneath) — fakes use opaque flat paint","Genuine Newport putters weigh approximately 355g; zinc-alloy fakes typically measure 320-340g"); authenticityNotes="The Newport is the most counterfeited Scotty Cameron. Verify at scottycameron.com/authentication." }
  @{ brand="Scotty Cameron"; match="phantom"; fakeIndicators=@("Shaft label on BACK of shaft — front placement confirms counterfeit","7-digit serial laser-etched on upper shaft — verify at scottycameron.com/authentication","The Phantom X uses a multi-material construction with a distinct milled face insert — fakes use a single-piece casting","Genuine Phantom milling is very precise with consistent patterns — fake milling is rougher","Counterfeit Phantom headcovers use white embroidery instead of the correct silver-grey") }
  @{ brand="Scotty Cameron"; match="special select"; fakeIndicators=@("Shaft label on BACK of shaft — front placement confirms counterfeit","7-digit serial laser-etched on upper shaft — verify at scottycameron.com/authentication","Special Select has a distinctive hand-finished satin surface with fine uniform machining marks — fakes look smoother and mass-produced","Special Select cavity engraving precisely executed — fakes have shallower less crisp text","Genuine Special Select in branded Cameron/Titleist packaging — loose or plain box is suspicious") }
  @{ brand="Scotty Cameron"; match="circle"; fakeIndicators=@("Shaft label on BACK of shaft — front placement confirms counterfeit","7-digit serial laser-etched on upper shaft — verify at scottycameron.com/authentication","Circle T stamp should be a perfectly formed circle with T precisely centred — fakes have off-round circles or misaligned T","Genuine Circle T sold exclusively through the Scotty Cameron Gallery — any other channel for new Circle T is suspicious","Finish hand-inspected to jewellery standards — any surface imperfection indicates fake"); authenticityNotes="Circle T putters sell for 2000-15000 GBP+. Always obtain authentication from the Scotty Cameron Gallery or Team Titleist before purchase." }
  @{ brand="Ping"; match="g430"; typeGroup="driver"; fakeIndicators=@("Sole printing should be gray-toned — genuine G430MAX has gray sole graphics; counterfeits display a brownish or yellowed tint","The tungsten weight inscription on sole confirms internal weight placement — fakes omit this marking","Genuine G430 headcovers have gray-embroidered PING branding — fakes use white embroidery","The hexagonal wrench screw hole on the sole has a specific depth — fakes have a shallower or different-diameter hole","PING customer service can verify any serial — always check before secondhand purchase") }
  @{ brand="Ping"; match="g425"; typeGroup="driver"; fakeIndicators=@("The G425 MAX turbulator (raised alignment aid) on the crown should match the exact shape — fakes have a simplified or differently proportioned turbulator","Sole printing is gray-toned on genuine — brownish-yellow tint indicates fake","PING typeface on sole markings — fakes use generic sans-serif with different letter spacing","Coloured dot on iron hosels must be present and correct","PING customer service serial verification is the definitive check") }
  @{ brand="Ping"; match="blueprint"; fakeIndicators=@("Blueprint irons are blade-style forged — genuine show visible grain flow patterns under magnification; cast fakes have a smooth, uniform surface","Coloured dot on hosel essential — Blueprint is custom-fit and every genuine iron should have a lie-angle dot","PING typeface in cavity precise — fakes use off-specification fonts","Weigh individual irons — genuine sets have consistent 7-8g progression long to short; fakes are inconsistent","PING customer service serial verification is the definitive check") }
  @{ brand="Titleist"; match="vokey"; fakeIndicators=@("Between loft and bounce numbers on genuine Vokey there is a DOT separator — counterfeits use a DASH; fastest single visual check","Genuine SM-series Vokey have a satin chrome finish that is consistently matte — fakes are shinier or have patchy plating","The BV initials on genuine Vokey are in a slightly heavier bold typeface — on fakes they appear thinner","Groove precision: genuine Vokey grooves machined to USGA-maximum tolerances with crisp sharp edges — fakes are cast and less defined","Titleist holographic security label on underside of shaft near grip — fakes place it on top"); authenticityNotes="Vokey wedges are widely faked. The dot-vs-dash between loft and bounce is the fastest check. Verify via Team Titleist." }
  @{ brand="Titleist"; match="t100"; fakeIndicators=@("Ferrule length: genuine T100 use a longer ferrule — visible across the whole set","Holographic security label under shaft near grip — counterfeits place it on top","T100 cavity engraving font matches genuine spec — counterfeits use noticeably larger font","Genuine T100 forged and develop soft bag-chatter marks on topline — hard cast fakes resist this","Serial laser-etched on hosel — crisp and shadow-free; verify via Team Titleist") }
  @{ brand="Titleist"; match="ap2"; fakeIndicators=@("The AP2 font in cavity is noticeably larger on counterfeits than genuine","Diagonal cavity lines on genuine AP2 at specific angle — counterfeits at different more extreme angle","Ferrule shorter on counterfeits than genuine Titleist irons","USGMC JGGA holographic security label with colour-shifting block on underside of shaft near grip — fakes put it on top","Forged AP2 develop natural bag-chatter scuffs on topline in use — absence on used set may indicate cast counterfeits") }
  @{ brand="Mizuno"; match="mp-20"; fakeIndicators=@("MP-20 Grain Flow Forged stamp on sole laser-etched with fine consistent lettering — fakes reproduce shallowly or blurred","Inside hosel: genuine MP-20 has clearly visible adhesive-aid grooves; fake hosels are smooth",".355 taper-tip hosel on genuine MP-20 — fakes use .370 parallel tip","Genuine MP-20 distinctively soft dampened feel at impact — fakes feel harder and produce sharper clang","Weight progression 7-8g heavier per iron from 3 to PW — fakes show inconsistent distribution") }
  @{ brand="Mizuno"; match="forged"; typeGroup="iron"; fakeIndicators=@("The Grain Flow Forged or Grain Flow Forged HD stamp on the sole should be finely etched and precise — fakes reproduce this shallowly or with blurred lettering","Inside the hosel: genuine forged Mizuno irons have clear adhesive-aid grooves visible with a torch; fake hosels are smooth",".355 taper-tip hosel on genuine forged Mizuno irons — fakes substitute the more common .370 parallel tip","Head weight progression consistent 7-8g per iron from long to short — fakes show inconsistent distribution","Mizuno logo in cavity slightly recessed with crisp edges — fakes have logo flush or raised above the surface") }
  @{ brand="PXG"; match="0311"; fakeIndicators=@("Serial must begin with PXG — any serial starting with YIAA is from a documented counterfeit batch","TPE particles (elastomer cavity inserts) feel slightly flexible when pressed — fakes use rigid plastic or omit them","PXG wordmark engraving depth and font weight must match exactly — fakes deviate in spacing or weight","Only purchase from pxg.com or authorised PXG Fitting Specialists — eBay 0311s almost always counterfeit","Genuine 0311 irons are notably heavy (high-density tungsten) — lighter than expected indicates fake") }
  @{ brand="Miura"; match="mc-501"; fakeIndicators=@("Genuine stamp on back of hosel — absent or poorly executed = counterfeit","MC-501 is the single most counterfeited Miura model — documented fake influx on eBay from Chinese sellers","Sole iron-number stamps finely machined with consistent depth — fakes sloppy and inconsistent","Forging grain flow patterns visible under magnification — cast fakes are smooth and pore-free","Price below 250 GBP per iron is almost certainly fake given RRP of 350+ GBP") }
  @{ brand="Miura"; match="cb-301"; fakeIndicators=@("Genuine stamp on back of hosel — absent stamp indicates counterfeit","CB-301 widely faked on eBay from Chinese sellers — GolfWRX forums document extensively","Sole number stamps precise with uniform depth — fakes sloppy","Forging grain flow marks under magnification — cast fakes smooth","Genuine price 280-350 GBP per iron — significant discounts are a serious warning sign") }
  @{ brand="Miura"; match="cb-302"; fakeIndicators=@("Genuine stamp on back of hosel — absent stamp indicates counterfeit","CB-302 known counterfeit target on eBay and DHGate","Sole number stamps precise with uniform depth — fakes sloppy","Forging grain flow marks visible under magnification — cast fakes smooth","Genuine price 280-360 GBP per iron — deep discounts are a warning sign") }
)

# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------
$fakeData = [ordered]@{}
$populated = 0
$skipped = 0
$brandCounts = @{}
$typeCounts = @{}

foreach ($model in $models) {
  $brand = $model.brand
  $bd = $brandData[$brand]
  if (-not $bd) { $skipped++; continue }

  $typeGroup = Get-TypeGroup ($model.productType ?? "") ($model.name ?? "")
  $typeData = $bd[$typeGroup]
  if (-not $typeData) { $typeData = $bd["default"] }
  if (-not $typeData) { $skipped++; continue }

  # Apply model-specific overrides (respect typeGroup if set)
  $searchStr = ("$($model.model) $($model.name)").ToLower()
  $matchedOverrides = $modelOverrides | Where-Object {
    $_.brand -eq $brand -and
    $searchStr.Contains($_.match.ToLower()) -and
    (-not $_.typeGroup -or $_.typeGroup -eq $typeGroup)
  }

  $indicators = [array]$typeData.fakeIndicators
  $notes = $typeData.authenticityNotes
  $serial = $typeData.serialNumberFormat

  foreach ($ov in $matchedOverrides) {
    if ($ov.fakeIndicators) { $indicators = [array]$ov.fakeIndicators }
    if ($ov.authenticityNotes) { $notes = $ov.authenticityNotes }
    if ($ov.serialNumberFormat) { $serial = $ov.serialNumberFormat }
  }

  $indicators = [array]($indicators | Select-Object -First 5)

  $fakeData["$($model.id)"] = [ordered]@{
    fakeIndicators = $indicators
    authenticityNotes = $notes
    serialNumberFormat = $serial
  }

  $populated++
  if (-not $brandCounts[$brand]) { $brandCounts[$brand] = 0 }
  $brandCounts[$brand]++
  if (-not $typeCounts[$typeGroup]) { $typeCounts[$typeGroup] = 0 }
  $typeCounts[$typeGroup]++
}

$json = $fakeData | ConvertTo-Json -Depth 10
Set-Content -Path "public/data/fake-data.json" -Value $json -Encoding UTF8

Write-Host "Done! Written to public/data/fake-data.json"
Write-Host "  Populated: $populated models"
Write-Host "  Skipped:   $skipped models"
Write-Host ""
Write-Host "By brand:"
$brandCounts.GetEnumerator() | Sort-Object Value -Descending | ForEach-Object { Write-Host "  $($_.Key): $($_.Value)" }
Write-Host ""
Write-Host "By product type group:"
$typeCounts.GetEnumerator() | Sort-Object Value -Descending | ForEach-Object { Write-Host "  $($_.Key): $($_.Value)" }
