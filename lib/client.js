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
		 */
		const CSS = [
			"@media (hover: none) and (pointer: coarse) {",
			"  [role=\"tooltip\"] { display: none !important; }",
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
				if (document.querySelector("style[data-plugin-css=" + JSON.stringify(TAG) + "]") !== null) return;
				const tag = document.createElement("style");
				tag.dataset.plugin = "@oksure/dsh-client-ui-mobile-comfort";
				tag.dataset.pluginCss = TAG;
				tag.textContent = CSS;
				document.head.appendChild(tag);
				return () => {
					tag.remove();
				};
			}, "ui-mobile-comfort: global stylesheet");
		}
		exports.apply = apply;
		exports.inject = [];
		return module.exports;
	}
});
