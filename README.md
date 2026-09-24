# @oksure/dsh-client-ui-mobile-comfort

Touch-device comfort fixes for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) web client, packaged as an out-of-tree `dsh` bundle plugin.

## What it fixes

On phone and tablet browsers the dsh web UI shows six touch-specific problems:

1. **Ghost tooltips.** Tapping a sidebar control synthesizes `mouseenter`/`focus`, which mounts a tooltip; when the tapped control then moves (sidebar collapse animation), no trailing `mouseleave` ever fires on touch browsers, so the bubble lingers indefinitely. Reproduced on WebKit: the tooltip stays visible 3+ seconds after every tap with no pointer anywhere near. This sheet hides `[role="tooltip"]` under `(hover: none) and (pointer: coarse)` — tooltips are a hover affordance, and coarse pointers get none.
2. **Double-tap-zoom ambiguity.** The app ships no `touch-action` rules, so on iOS Safari rapid second taps zoom the page instead of clicking (and first clicks carry the legacy delay). The sheet sets `touch-action: manipulation` on interactive elements, leaving pinch zoom untouched.
3. **Small touch targets.** The collapsed rail controls and composer controls are smaller than a comfortable touch target. The sheet expands them to 44px, and expands the open drawer actions to 40px.
4. **Narrow-screen layout collapse.** The stock layout keeps a 56px sidebar rail on phones, leaving less room for the conversation. The sheet gives the conversation the full viewport width, keeps one 44px menu button at the top, and opens the sidebar as a drawer over the conversation. It explicitly places the conversation in grid column two so it stays visible behind the drawer. Tapping the backdrop closes the drawer without activating an underlying conversation control. Selecting a session also closes it. DSH 0.1.5 renamed the layout flag from `data-details-collapsed` to `data-rightbar-collapsed`; the plugin follows that flag.
5. **Touch hover interception.** The session hover card can treat a touch as hover before the row click is handled. The sheet suppresses that touch-only hover path and leaves the native row click as the activation path.
6. **Collapsed session groups.** The stock workspace browser initially shows only five sessions per workspace. The sheet expands those groups on sidebar entry, while preserving an explicit user request to show fewer until the sidebar is reopened.

Desktop pointers are unaffected: both rules key off input modality (`touch-action`) or pointer class (`hover`/`pointer` media features).

## Install

```sh
dsh plugin --profile web add file:/path/to/dsh-mobile-comfort
```

Then restart the profile (`dsh web`). Verify by loading the UI on a phone: tapping the sidebar toggle must not leave a tooltip behind.

For the drawer regression, run `python3 tests/mobile_comfort_test.py` with Playwright installed. It checks the installed DSH layout flag, full-width conversation behind the 393px touch drawer, outside-tap dismissal without click-through, and unchanged 1440px desktop layout.

## Compatibility and disposable-profile evidence

- Node.js: `>=22.0.0`.
- DSH: `0.1.5-rc.2` is declared as compatible in `package.json`. The 0.1.2 plugin release gives the closed mobile drawer a full-width conversation and fixes its grid placement and backdrop behavior.
- A disposable profile check passed on DSH `0.1.5-rc.2`: local install, `dsh --profile smoke --help` start, bundle-entry composition check, and uninstall. The check used an isolated `DSH_HOME` and did not modify normal profile or session state.

## Files

- `lib/client.js` — browser half: injects the responsive stylesheet and the mobile drawer outside-tap handler for the lifetime of the plugin fiber (`ctx.effect`, HMR-safe disposer).
- `lib/index.js` — host half: no-op (browser-only plugin).
- `cordis.patch.yml` — bundle patch inserting the `ui-mobile-comfort` row.

## Notes for upstream

The root causes live in `@deepseek-ai/dsh-client-ui-primitives` (`Tooltip.tsx`: `onFocus` shows immediately and only `disabled` handles the no-mouseleave case) and in the absence of any `touch-action` policy. A full diagnosis with engine-level event traces is in [`docs/mobile-touch-report.md`](docs/mobile-touch-report.md); it is written up to be posted to the upstream Discussions as well.

## License

MIT
