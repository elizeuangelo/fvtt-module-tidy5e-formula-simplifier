import simplifyRollFormula from "./simplify-roll-formula.mjs";

/** Simplify display data without changing the item's prepared labels. */
export function simplifyDamageLabels(damages) {
  if ( !Array.isArray(damages) ) return damages;
  return damages.map(damage => {
    if ( typeof damage?.formula !== "string" || !damage.formula ) return damage;

    let formula;
    try { formula = simplifyRollFormula(damage.formula, { preserveFlavor: false }); }
    catch (error) {
      console.warn("Tidy 5e Formula Simplifier: could not simplify a damage formula", damage.formula, error);
      return damage;
    }
    if ( formula === damage.formula ) return damage;

    const label = typeof damage.label === "string" && damage.label.startsWith(damage.formula)
      ? formula + damage.label.slice(damage.formula.length)
      : damage.label;
    return { ...damage, formula, label };
  });
}
