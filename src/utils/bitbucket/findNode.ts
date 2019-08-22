import by from '../array/filterBy';
import {
  BitbucketRepoTreeNode,
  BitbucketRepoNodeType
} from '../types/BitbucketTypes';

export default function findNode(
  nodes: BitbucketRepoTreeNode[],
  path: string,
  type: BitbucketRepoNodeType = 'directory'
) {
  const names = path.split('/');
  let name = names.shift();

  // Find parent node by name:
  let result = walkNodeTree(nodes, name, type);

  // Walk child nodes until we reach the end of the path:
  while (result && (name = names.shift())) {
    result = result.contents.find(by({ name, type }));
  }

  return result;
}

// Helper to recurse through node tree to find the one that matches name:
// Note this does not support paths. It just returns the first match by name.
function walkNodeTree(
  nodes: BitbucketRepoTreeNode[],
  name: string,
  type: BitbucketRepoNodeType = 'directory',
  byName = by({ name, type })
) {
  return (
    (nodes &&
      (nodes.find(byName) ||
        nodes
          .map(node => walkNodeTree(node.contents, name, type, byName))
          .find(byName))) ||
    null
  );
}
