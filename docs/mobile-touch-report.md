# Mobile/touch: tooltips linger after tapping sidebar controls; rapid taps zoom instead of clicking

> Posted upstream: https://github.com/deepseek-ai/deepseek-harness/discussions/4520
> All findings verified against 0.1.1-rc.2 with Playwright (Chromium + WebKit engines, iPhone-class touch emulation, 390x844).

## Summary

On touch devices the web client has three related problems around the sidebar rail controls:

1. **Ghost tooltips** — after tapping a control, its tooltip mounts and never hides. On WebKit it stays visible for 3+ seconds (indefinitely, until you tap something else), with no pointer anywhere near.
2. **Double-tap-zoom swallows actions** — no `touch-action` rules ship anywhere, so on iOS Safari a quick second tap zooms the page instead of clicking. This reads as "the button didn't work, I had to tap again."
3. **Small touch targets** — the rail's icon controls measure 36×36 CSS px (below Apple HIG's 44 pt / Material's 48 dp guidance).

## Reproduction of the ghost tooltip

Tap the sidebar collapse toggle on an emulated iPhone-class device and sample `[role="tooltip"]` visibility over time:

| Checkpoint | Chromium (touch emulation) | WebKit (touch emulation ≈ iOS Safari engine) |
|---|---|---|
| tap + 120 ms | not visible | **visible** |
| tap + 800 ms | not visible | **visible** |
| tap + 2 800 ms | not visible | **still visible** |

The engine difference is exactly why desktop testing misses this. Tracing synthesized events shows why:

**Chromium** after `click`: `mouseout`/`mouseleave` fire ~20 ms later because content shifted under the stationary synthetic cursor → the tooltip self-cancels.

**WebKit** after `click`: no trailing boundary events at all. The sequence is:

```
touchstart → touchend → mouseover → mouseenter×5 → mousemove
→ mousedown → focus → mouseup → click      …then silence
```

## Root causes (source refs @ master)

**`packages/client/ui-primitives/src/Tooltip.tsx`**

- L152: `onFocus` calls `show()` immediately — every tap focuses its target, so a tap is also a "show tooltip now" command.
- L150: `onMouseEnter` arms `showAfterHoverDelay()`; on touch there is no real hover intent behind it.
- The bubble only hides via `onMouseLeave`/`onBlur`. A tap that *moves or remounts* the anchor (sidebar collapse: `.railIn` entrance animation translates controls 49 px; wide content unmounts after 150 ms) produces no trailing `mouseleave` in WebKit/iOS — the comment at L103–104 already acknowledges this failure class ("no mouseleave fires") but handles it only for the `disabled` prop path.

**No `touch-action` anywhere.** `grep -r "touch-action" dist/assets/*.css` → zero matches, while `index.html` keeps the viewport pinch-zoomable. On iOS Safari double-tap-to-zoom therefore stays armed over every control.

**Touch targets.** The collapsed-rail controls are 36×36 (`SidebarRoot.module.css`: `.iconButton { width: 28px }` inside a 36px control box per the ui-sidebar README); the collapse toggle measured 36×36 live.

## Suggested directions

1. **Treat tooltips as hover-only**: gate triggers on `matchMedia('(hover: hover) and (pointer: fine)')` (re-evaluated on change), or at minimum drop the immediate `onFocus` show when the last input modality was touch. Tooltips carry no information a keyboard/screen-reader user lacks — the anchors already carry `aria-label`.
2. **Ship a `touch-action` policy** in the base theme sheet: `button, [role="button"], a[href], input, select, textarea, label { touch-action: manipulation; }` — removes both the legacy click delay and zoom-on-second-tap without affecting pinch zoom.
3. **Grow hit areas without growing visuals** — e.g. padding/pseudo-element expansion toward ≥44×44 on coarse pointers for the rail controls.

## Working stopgap (community plugin)

We packaged the CSS-level fixes as an out-of-tree bundle plugin — [`@oksure/dsh-client-ui-mobile-comfort`](https://github.com/oksure/dsh-mobile-comfort) — which injects:

```css
@media (hover: none) and (pointer: coarse) {
  [role="tooltip"] { display: none !important; }
}
button, [role="button"], a[href], input, select, textarea, label {
  touch-action: manipulation;
}
```

Verified A/B on the same trace harness: baseline leaves the tooltip visible ≥2.8 s after each tap; with the sheet, every mounted tooltip computes to `display: none`.

Happy to provide full event traces (JSON), screenshots, or more detail if useful.

## Local follow-up (2026-08-26)

The CSS stopgap was extended after a live 360x800 and 393x852 audit found two
remaining defects in the stock layout:

- Opening the sidebar kept its 280px grid track, leaving only 80px for the
  conversation on a 360px viewport. The plugin now presents that sidebar as a
  drawer overlay, closes it after a session row is selected, and closes it when
  the user taps outside it.
- The composer wrapped the model selector onto a second row at 360px. The
  mobile sheet keeps the composer controls in one row, lets the model label
  ellipsize, and expands the main controls to 44px touch targets.
- Session rows keep their action menu behavior: tapping the row opens the
  session and closes the drawer, while tapping its action button leaves the
  drawer open for the menu.
- A WebKit-style touch fallback covers engines that emit `touchend` but omit the
  follow-up `click`: the native click cancels the timer, while a missing click
  produces exactly one synthetic row click.

The same audit verified no document horizontal overflow, no console errors, and
unchanged desktop behavior at 1440x900. The drawer actions remain within the
viewport at 360px and 393px.
