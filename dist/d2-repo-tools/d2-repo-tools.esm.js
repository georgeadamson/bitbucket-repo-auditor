import { p as patchBrowser, g as globals, b as bootstrapLazy } from './chunk-c1759aa1.js';

patchBrowser().then(resourcesUrl => {
  globals();
  return bootstrapLazy([["d2-audit",[[1,"d2-audit",{"brand":[1],"treeUrl":[1,"tree-url"],"repo":[1],"branch":[1],"isBitbucket":[32],"isValidRepo":[32],"tree":[32]}]]],["d2-audit-branches",[[1,"d2-audit-branches",{"isBitbucket":[32],"isValidRepo":[32],"repo":[32],"branch":[32],"branches":[32]}]]],["d2-audit-repos",[[1,"d2-audit-repos",{"isBitbucket":[32],"isValidRepo":[32],"repo":[32],"branch":[32],"repos":[32]}]]],["my-component",[[1,"my-component",{"first":[1],"middle":[1],"last":[1]}]]],["d2-audit-results",[[1,"d2-audit-results",{"brand":[1],"tree":[16],"brandDir":[32]}]]]], { resourcesUrl });
});
