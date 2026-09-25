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

function patchFormulaCell(cell, name, applies = () => true) {
  if ( typeof cell?.props !== "function" ) {
    console.warn(`${MODULE_ID}: Tidy ${name} Formula column was not found`);
    return;
  }

  const originalProps = cell.props;
  cell.props = function(args) {
    const props = originalProps.call(this, args);
    if ( !applies(args) ) return props;
    const document = props?.rowDocument;
    const damages = document?.labels?.damages;
    if ( !Array.isArray(damages) || !damages.length ) return props;

    const simplified = simplifyDamageLabels(damages);
    if ( simplified.every((damage, index) => damage === damages[index]) ) return props;

    // The stock Tidy Svelte cell still renders its icons, overflow count, and tooltip.
    // Only its view of this item's or activity's prepared labels is different.
    const labels = { ...document.labels, damages: simplified };
    if ( labels.damage === damages ) labels.damage = simplified;
    const rowDocument = new Proxy(document, {
      get(target, property) {
        if ( property === "labels" ) return labels;
        const value = Reflect.get(target, property, target);
        return typeof value === "function" ? value.bind(target) : value;
      }
    });
    return { ...props, rowDocument };
  };
}

Hooks.once("tidy5e-sheet.ready", api => {
  tidyApi = api;
  const columns = CONFIG.TIDY5E?.features?.columns;
  patchFormulaCell(columns?.inventory?.formula?.cell, "inventory");
  patchFormulaCell(columns?.activity?.formulas?.cell, "activity", args =>
    args.sheetDocument?.documentName === "Item" && tidyApi.isTidy5eItemSheet(args.sheetContext?.sheet));
});
