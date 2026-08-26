window.__ModuleLoader__.load({
	id: "@oksure/dsh-client-ui-mobile-comfort",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		/**
		 * Touch-device comfort sheet.
		 *
		 * 1. Tooltips are a hover affordance. On touch browsers a tap synthesizes
		 *    mouseenter/focus, and when the tapped control then moves or unmounts
		 *    (sidebar collapse), no trailing mouseleave ever fires, so the bubble
		 *    lingers indefinitely. Coarse pointers get no tooltips at all.
		 * 2. `touch-action: manipulation` on controls removes the double-tap-zoom
		 *    ambiguity (the 300ms click delay and zoom-instead-of-click on rapid
		 *    second taps) without disabling pinch zoom.
		 * 3. Narrow screens need the sidebar as an overlay, not a 280px grid track;
		 *    the composer also needs one stable row instead of flex wrapping.
		 */
		const CSS = [
			"@media (hover: none) and (pointer: coarse) {",
			"  [role=\"tooltip\"] { display: none !important; }",
			"  [data-sidebar-collapsed=\"true\"] > :first-child button[aria-label=\"Open sidebar\"],",
			"  [data-sidebar-collapsed=\"true\"] > :first-child button[aria-label=\"New session\"],",
			"  [data-sidebar-collapsed=\"true\"] > :first-child button[aria-label=\"Add workspace\"],",
			"  [data-sidebar-collapsed=\"true\"] > :first-child button[aria-label=\"Search sessions\"],",
			"  [data-sidebar-collapsed=\"true\"] > :first-child button[class*=\"_rail\"] {",
			"    width: 44px !important;",
			"    height: 44px !important;",
			"    min-width: 44px !important;",
			"    min-height: 44px !important;",
			"  }",
			"}",
			"@media (hover: none) and (pointer: coarse) and (max-width: 700px) {",
			"  [data-details-collapsed]:not([data-sidebar-collapsed=\"true\"]) {",
			"    grid-template-columns: 0 minmax(0, 1fr) 0 !important;",
			"  }",
			"  [data-details-collapsed]:not([data-sidebar-collapsed=\"true\"]) > :first-child {",
			"    position: absolute !important;",
			"    inset: 0 auto 0 0;",
			"    z-index: 30;",
			"    width: min(280px, calc(100% - 56px)) !important;",
			"    max-width: calc(100% - 56px) !important;",
			"    box-shadow: 8px 0 24px rgb(0 0 0 / 12%);",
			"  }",
			"  [data-details-collapsed]:not([data-sidebar-collapsed=\"true\"]) > :first-child button[aria-label=\"Collapse sidebar\"],",
			"  [data-details-collapsed]:not([data-sidebar-collapsed=\"true\"]) > :first-child button[aria-label=\"Search sessions\"],",
			"  [data-details-collapsed]:not([data-sidebar-collapsed=\"true\"]) > :first-child button[aria-label=\"View options\"],",
			"  [data-details-collapsed]:not([data-sidebar-collapsed=\"true\"]) > :first-child button[aria-label=\"Add workspace\"] {",
			"    width: 40px !important;",
			"    height: 40px !important;",
			"    min-width: 40px !important;",
			"    min-height: 40px !important;",
			"  }",
			"  [data-details-collapsed]:not([data-sidebar-collapsed=\"true\"]) > :first-child button[class*=\"_newSession\"] {",
			"    min-height: 44px !important;",
			"  }",
			"  [data-details-collapsed]:not([data-sidebar-collapsed=\"true\"]) > :first-child [role=\"treeitem\"][aria-selected] {",
			"    min-height: 44px !important;",
			"  }",
			"  [data-details-collapsed]:not([data-sidebar-collapsed=\"true\"]) > :first-child [class*=\"_headerActions\"] {",
			"    width: 84px !important;",
			"    min-width: 84px !important;",
			"    overflow: visible !important;",
			"  }",
			"  [data-details-collapsed]:not([data-sidebar-collapsed=\"true\"]) > :first-child [class*=\"_sectionHeader\"] {",
			"    overflow: visible !important;",
			"  }",
			"  [data-details-collapsed]:not([data-sidebar-collapsed=\"true\"])::after {",
			"    content: \"\";",
			"    position: absolute;",
			"    inset: 0;",
			"    z-index: 20;",
			"    pointer-events: none;",
			"    background: rgb(0 0 0 / 10%);",
			"  }",
			"  .uV2eYG_row {",
			"    flex-wrap: nowrap !important;",
			"    gap: 4px !important;",
			"    padding: 2px 6px 6px !important;",
			"  }",
			"  .uV2eYG_row > :is(.uV2eYG_tools, .uV2eYG_modes, .uV2eYG_trailing) {",
			"    min-width: 0 !important;",
			"    gap: 4px !important;",
			"  }",
			"  .uV2eYG_trailing {",
			"    flex: 1 1 auto !important;",
			"    min-width: 0 !important;",
			"    margin-left: auto !important;",
			"  }",
			"  .uV2eYG_add, .uV2eYG_primary {",
			"    width: 44px !important;",
			"    height: 44px !important;",
			"  }",
			"  button[aria-label^=\"Access mode\"], button[aria-label^=\"Select model\"] {",
			"    min-width: 0 !important;",
			"    min-height: 44px !important;",
			"  }",
			"  .uV2eYG_trailing [data-slot=\"conversation.input.model\"] > * {",
			"    min-width: 0 !important;",
			"    flex: 1 1 0 !important;",
			"  }",
			"  button[aria-label^=\"Select model\"] {",
			"    width: 100% !important;",
			"    max-width: none !important;",
			"  }",
			"  button[aria-label^=\"Select model\"] > span {",
			"    min-width: 0 !important;",
			"    overflow: hidden !important;",
			"    text-overflow: ellipsis !important;",
			"    white-space: nowrap !important;",
			"  }",
			"}",
			"button, [role=\"button\"], a[href], input, select, textarea, label {",
			"  touch-action: manipulation;",
			"}"
		].join("\n");
		const TAG = "@oksure/dsh-client-ui-mobile-comfort/global.css";
		/**
		 * Inject the comfort sheet for the lifetime of the plugin fiber.
		 * @param ctx - Client root context.
		 */
		function apply(ctx) {
			ctx.effect(() => {
				if (typeof document === "undefined") return;
				let tag = document.querySelector("style[data-plugin-css=" + JSON.stringify(TAG) + "]");
				if (tag === null) {
					tag = document.createElement("style");
					tag.dataset.plugin = "@oksure/dsh-client-ui-mobile-comfort";
					tag.dataset.pluginCss = TAG;
					tag.textContent = CSS;
					document.head.appendChild(tag);
				}
				const coarse = window.matchMedia("(hover: none) and (pointer: coarse)");
				const closeDrawerOnOutsidePointer = (event) => {
					if (!coarse.matches || !(event.target instanceof Element)) return;
					const frame = event.target.closest("[data-details-collapsed]");
					if (!(frame instanceof HTMLElement) || frame.getAttribute("data-sidebar-collapsed") === "true") return;
					const sidebar = frame.firstElementChild;
					if (!(sidebar instanceof HTMLElement) || sidebar.contains(event.target)) return;
					sidebar.querySelector("button[aria-label=\"Collapse sidebar\"]")?.click();
				};
				const closeDrawerAfterSessionClick = (event) => {
					if (!coarse.matches || !(event.target instanceof Element)) return;
					const frame = event.target.closest("[data-details-collapsed]");
					if (!(frame instanceof HTMLElement) || frame.getAttribute("data-sidebar-collapsed") === "true") return;
					const sidebar = frame.firstElementChild;
					const row = event.target.closest("[role=\"treeitem\"][aria-selected]");
					if (!(sidebar instanceof HTMLElement) || !(row instanceof HTMLElement) || !sidebar.contains(row)) return;
					const actionButton = event.target.closest("button,[role=\"button\"]");
					if (actionButton !== null && !actionButton.matches("[role=\"treeitem\"]")) return;
					sidebar.querySelector("button[aria-label=\"Collapse sidebar\"]")?.click();
				};
				document.addEventListener("pointerdown", closeDrawerOnOutsidePointer, true);
				document.addEventListener("click", closeDrawerAfterSessionClick);
				return () => {
					document.removeEventListener("pointerdown", closeDrawerOnOutsidePointer, true);
					document.removeEventListener("click", closeDrawerAfterSessionClick);
					if (tag?.parentNode !== null) tag.remove();
				};
			}, "ui-mobile-comfort: global stylesheet");
		}
		exports.apply = apply;
		exports.inject = [];
		return module.exports;
	}
});
