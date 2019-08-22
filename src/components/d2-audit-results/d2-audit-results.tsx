import { Component, Prop, State, Watch, h } from '@stencil/core';
import by from '../../utils/array/filterBy';
//import DEFAULT_TREE_JSON from './repo-tree.dove.json';

import { BitbucketRepoTreeNode } from '../../utils/types/BitbucketTypes';

const byAppFolder = by({ name: 'app', type: 'directory' });

@Component({
  tag: 'd2-audit-results',
  styleUrl: 'd2-audit-results.scss',
  shadow: true
})
export class D2AuditResults {
  @Prop() repo: string;
  @Prop() branch: string;
  @Prop() brand: string = 'dove';
  @Prop() tree: BitbucketRepoTreeNode[]; //= DEFAULT_TREE_JSON;

  @State() brandDir: any;

  componentWillLoad() {
    console.log(this.brand, this.tree);
    this.onTreeChange();
  }

  @Watch('tree')
  @Watch('brand')
  onTreeChange() {
    this.brandDir = getSimpleTreeOf(this.getBrandNode().contents);
  }

  render() {
    const { tree, brand, brandDir } = this;

    // Rudimentary error handling:
    if (!tree) return <p>Missing `tree` json.</p>;
    else if (!brand) return <p>Missing `brand` name.</p>;
    else if (!brandDir)
      return <p>Unable to derive `brandDir` from `tree` json.</p>;

    const customViews = auditFolder(brandDir.js.views, 'views');
    const customTemplates = auditFolder(brandDir.js.templates, 'templates');
    const customSass = auditFolder(brandDir.sass.views, 'sass');

    const combinedResults = mergeAudits(
      customViews,
      customTemplates,
      customSass
    ).sort(byFileName);

    return (
      <div>
        {/* {Object.keys(this.brandDir.js.views).join(',')} */}
        <br />
        <br />

        <table class="responsive-card-table">
          <thead>
            <tr>
              <th>Customised components</th>
              <th>Html (Handlbars "Templates")</th>
              <th>Javascript (JS "Views")</th>
              <th>Style (SCSS)</th>
            </tr>
          </thead>
          <tbody>
            {combinedResults.map(component => (
              <tr>
                <td>{component.name}</td>
                <td>{component.templates && component.templates.length}</td>
                <td>{component.views && component.views.length}</td>
                <td>{component.sass && component.sass.length}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* <br />
        <br />
        {JSON.stringify(auditFolder(this.brandDir.js.views))}
        <br />
        <br />
        {JSON.stringify(this.brandDir.js.views)} */}
      </div>
    );
  }

  getPlatformNode = () =>
    getNode(this.tree, 'unilever-platform').contents.find(byAppFolder);

  getBrandNode = () =>
    this.getPlatformNode().contents.find(
      by({ name: this.brand, type: 'directory' })
    );
}

function auditFolder(folder = {}, filesNodeName = 'files') {
  return subfoldersOf(folder).map(subfolder => ({
    name: subfolder.name,
    [filesNodeName]: filesOf(subfolder)
  }));
}

function mergeAudits(...args: any[][]) {
  return Array.prototype.concat.apply([], args).reduce((results, item) => {
    const result = results.find(by({ name: item.name }));

    if (result) {
      Object.assign(result, item);
    } else {
      results.push(Object.assign({}, item));
    }

    return results;
  }, []);
}

function childrenOf(folder, type?) {
  return Object.keys(folder).reduce((result, key) => {
    const child = folder[key];
    if (child && (!type || child.type === type)) result.push(child);
    return result;
  }, []);
}

function subfoldersOf(folder) {
  return childrenOf(folder, 'directory');
}

function filesOf(folder) {
  return childrenOf(folder, 'file');
}

function getSimpleTreeOf(nodes = [], filter = {}) {
  if (!Array.isArray(nodes)) nodes = [nodes];

  return nodes.filter(by(filter)).reduce((tree, node) => {
    const nodeProps = { name: node.name, type: node.type, size: node.size };

    tree[node.name] =
      node.type === 'directory'
        ? {
            ...nodeProps,
            ...getSimpleTreeOf(node.contents, { type: 'directory' }),
            ...getSimpleTreeOf(node.contents, { type: 'file' })
          }
        : nodeProps;
    return tree;
  }, {});
}

// Helper to recurse through node tree to find the one matching name:
// Note this does not support paths. It just returns the first match by name.
function getNode(
  nodes: BitbucketRepoTreeNode[],
  name,
  type = 'directory',
  byName = by({ name, type })
) {
  return (
    (nodes &&
      (nodes.find(byName) ||
        nodes
          .map(node => getNode(node.contents, name, type, byName))
          .find(byName))) ||
    null
  );
}

// Helper for sorting an array of file objects by name:
function byFileName(fileA, fileB) {
  return fileA.name.localeCompare(fileB.name);
}
