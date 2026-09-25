# Tidy 5e Formula Simplifier

A temporary Foundry VTT module for D&D 5e 6.0.x and Tidy 5e Sheets 14.1.2. It simplifies the informational damage display on Tidy item sheets, in the item sheet's Activities tab, and in Tidy actor inventory Formula columns. It does not change stored formulas, rolls, or default D&D 5e sheets.

Enable **Tidy 5e Formula Simplifier** alongside **Tidy 5e Sheets** in Manage Modules. Reload the world, then open a Tidy item sheet or actor inventory containing a formula such as `1d8 + ceil(0 / 2) + 1`.

Other modules can call `game.modules.get("tidy5e-formula-simplifier").api.simplifyRollFormula(formula, options)` after the `init` hook. This exposes the improved helper without attempting to replace the D&D 5e system's immutable module export.

The inventory and item activity Formula cells use Tidy's existing renderers, so their icons and tooltips remain intact. The activity change is limited to Tidy item sheets.
