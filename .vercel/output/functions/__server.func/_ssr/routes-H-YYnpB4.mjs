import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-H-YYnpB4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GameBoot() {
	const [App, setApp] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let live = true;
		import("./game-app-B2O2DcOG.mjs").then((mod) => {
			if (live) setApp(() => mod.GameApp);
		});
		if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => void 0);
		return () => {
			live = false;
		};
	}, []);
	if (!App) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center bg-[#0c0a0b] text-[#f0e6d8]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-2xl tracking-wide",
			children: "Soulrift Crusher"
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(App, {});
}
var SplitComponent = GameBoot;
//#endregion
export { SplitComponent as component };
