import simplifyRollFormula from "./simplify-roll-formula.mjs";
import { simplifyDamageLabels } from "./damage-labels.mjs";

const MODULE_ID = "tidy5e-formula-simplifier";
let tidyApi;

Hooks.once("init", () => {
  game.modules.get(MODULE_ID).api = { simplifyRollFormula };
});

Hooks.on("tidy5e-sheet.prepareSheetContext", (document, app, context) => {
  if ( document?.documentName !== "Item" || !tidyApi?.isTidy5eItemSheet(app) ) return;
  const damages = context.labels?.damages;
  if ( !Array.isArray(damages) ) return;
  context.labels = { ...context.labels, damages: simplifyDamageLabels(damages) };
});

Hooks.once("tidy5e-sheet.ready", api => {
  tidyApi = api;

  const cell = CONFIG.TIDY5E?.features?.columns?.inventory?.formula?.cell;
  if ( typeof cell?.props !== "function" ) {
    console.warn(`${MODULE_ID}: Tidy inventory Formula column was not found`);
    return;
  }

  const originalProps = cell.props;
  cell.props = args => {
    const props = originalProps(args);
    const item = props?.rowDocument;
    const damages = item?.labels?.damages;
    if ( !Array.isArray(damages) || !damages.length ) return props;

    const simplified = simplifyDamageLabels(damages);
    if ( simplified.every((damage, index) => damage === damages[index]) ) return props;

    // The stock Tidy Svelte cell still renders its icons, overflow count, and tooltip.
    // Only its view of this item's prepared labels is different.
    const labels = { ...item.labels, damages: simplified };
    const rowDocument = new Proxy(item, {
      get(target, property) {
        if ( property === "labels" ) return labels;
        const value = Reflect.get(target, property, target);
        return typeof value === "function" ? value.bind(target) : value;
      }
    });
    return { ...props, rowDocument };
  };
});
