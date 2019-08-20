import { p as patchBrowser, g as globals, b as bootstrapLazy } from './chunk-6437faea.js';

patchBrowser().then(resourcesUrl => {
  globals();
  return bootstrapLazy([["d2-audit-results",[[1,"d2-audit-results",{"brand":[1],"tree":[16],"brandDir":[32]}]]],["d2-audit",[[1,"d2-audit",{"brand":[1],"treeUrl":[1,"tree-url"],"repo":[1],"branch":[1],"tree":[32]}]]],["my-component",[[1,"my-component",{"first":[1],"middle":[1],"last":[1]}]]]], { resourcesUrl });
});
