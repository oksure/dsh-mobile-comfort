# @oksure/dsh-client-ui-mobile-comfort

Touch-device comfort fixes for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) web client, packaged as an out-of-tree `dsh` bundle plugin.

## What it fixes

On phone and tablet browsers the dsh web UI shows four touch-specific problems:

1. **Ghost tooltips.** Tapping a sidebar control synthesizes `mouseenter`/`focus`, which mounts a tooltip; when the tapped control then moves (sidebar collapse animation), no trailing `mouseleave` ever fires on touch browsers, so the bubble lingers indefinitely. Reproduced on WebKit: the tooltip stays visible 3+ seconds after every tap with no pointer anywhere near. This sheet hides `[role="tooltip"]` under `(hover: none) and (pointer: coarse)` — tooltips are a hover affordance, and coarse pointers get none.
2. **Double-tap-zoom ambiguity.** The app ships no `touch-action` rules, so on iOS Safari rapid second taps zoom the page instead of clicking (and first clicks carry the legacy delay). The sheet sets `touch-action: manipulation` on interactive elements, leaving pinch zoom untouched.
3. **Small touch targets.** The collapsed rail controls and composer controls are smaller than a comfortable touch target. The sheet expands them to 44px, and expands the open drawer actions to 40px.
4. **Narrow-screen layout collapse.** The stock layout keeps the 280px sidebar as a grid column on narrow screens, leaving too little width for the composer. The sheet turns the sidebar into a mobile drawer with an overlay, keeps the composer controls on one row, and closes the drawer when the user taps outside it.

Desktop pointers are unaffected: both rules key off input modality (`touch-action`) or pointer class (`hover`/`pointer` media features).

## Install

```sh
dsh plugin --profile web add file:/path/to/dsh-mobile-comfort
```

Then restart the profile (`dsh web`). Verify by loading the UI on a phone: tapping the sidebar toggle must not leave a tooltip behind.

## Files

- `lib/client.js` — browser half: injects the responsive stylesheet and the mobile drawer outside-tap handler for the lifetime of the plugin fiber (`ctx.effect`, HMR-safe disposer).
- `lib/index.js` — host half: no-op (browser-only plugin).
- `cordis.patch.yml` — bundle patch inserting the `ui-mobile-comfort` row.

## Notes for upstream

The root causes live in `@deepseek-ai/dsh-client-ui-primitives` (`Tooltip.tsx`: `onFocus` shows immediately and only `disabled` handles the no-mouseleave case) and in the absence of any `touch-action` policy. A full diagnosis with engine-level event traces is in [`docs/mobile-touch-report.md`](docs/mobile-touch-report.md); it is written up to be posted to the upstream Discussions as well.

## License

MIT
