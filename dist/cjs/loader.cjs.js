'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const __chunk_1 = require('./chunk-a217083f.js');

const defineCustomElements = (win, options) => {
  return __chunk_1.patchEsm().then(() => {
    __chunk_1.bootstrapLazy([["my-component.cjs",[[1,"my-component",{"first":[1],"middle":[1],"last":[1]}]]],["d2-audit_2.cjs",[[1,"d2-audit",{"brand":[1],"treeUrl":[1,"tree-url"],"repo":[1],"branch":[1],"tree":[32]}],[1,"d2-audit-results",{"brand":[1],"tree":[16],"brandDir":[32]}]]]], options);
  });
};

exports.defineCustomElements = defineCustomElements;
