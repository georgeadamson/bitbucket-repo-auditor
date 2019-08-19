import { a as patchEsm, b as bootstrapLazy } from './chunk-96d0744b.js';

const defineCustomElements = (win, options) => {
  return patchEsm().then(() => {
    bootstrapLazy([["my-component",[[1,"my-component",{"first":[1],"middle":[1],"last":[1]}]]],["d2-audit_2",[[1,"d2-audit",{"brand":[1],"treeUrl":[1,"tree-url"],"repo":[1],"branch":[1],"tree":[32]}],[1,"d2-audit-results",{"brand":[1],"tree":[16],"brandDir":[32]}]]]], options);
  });
};

export { defineCustomElements };
