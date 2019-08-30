import { Component, Prop, State, Watch, h } from '@stencil/core';
import by from '../../utils/array/filterBy';
import {
  findNode,
  getRepoName,
  getRepoBranchBrands as getBrands,
  BitbucketRepoTreeNode,
  RepoState
} from '../../utils/bitbucket';

@Component({
  tag: 'd2-audit-results',
  styleUrl: 'd2-audit-results.scss',
  shadow: true
})
export class D2AuditResults {
  @Prop() project: string;
  @Prop() repo: string;
  @Prop() branch: string;
  @Prop() brand: string = 'dove';
  @Prop() tree: BitbucketRepoTreeNode[]; //= DEFAULT_TREE_JSON;

  @State() brandDir: any;
  @State() isLocalhost: boolean;

  @Watch('repo')
  repoChanged() {
    this.tree = null;
    this.brand = null;
    this.brandDir = null;
  }

  @Watch('branch')
  @Watch('brand')
  async brandChanged() {
    const { project, repo, branch } = this;

    // Fetch list of repos from API:
    if (repo && branch) {
      this.tree = await getBrands(project, repo, branch);
    } else {
      this.tree = null;
    }
  }

  @Watch('tree')
  treeChanged() {
    const { tree, brand } = this;

    if (tree && brand) {
      const brandNode = findNode(tree, brand);
      this.brandDir = getSimpleTreeOf(brandNode.contents);
    } else {
      this.brandDir = null;
    }
  }

  private table: Element;

  componentWillLoad() {
    // Attempt to extract repo name and branch from bitbucket url:
    Object.assign(this, getRepoName(this.project));

    // Fetch list of repos from API:
    this.brandChanged();
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
        <h2>Showing counts of each type of customisation</h2>
        <ul>
          <li>Markup = Number of customised html templates</li>
          <li>Behaviour = Number of customised javascript views</li>
          <li>Style = Number of customised CSS designs</li>
        </ul>

        <button onClick={() => copyToClipboard(this.table)}>
          Copy to clipboard
        </button>

        <table
          class="responsive-card-table"
          id="d2-audit-results__table"
          ref={el => (this.table = el)}
        >
          <thead>
            <tr>
              <th>Component name</th>
              <th>Markup (HBSS)</th>
              <th>Behaviour (JS)</th>
              <th>Style (CSS)</th>
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
      </div>
    );
  }
}

// Shared state:
RepoState.injectProps(D2AuditResults, ['project', 'repo', 'branch', 'brand']);

function auditFolder(folder = {}, filesNodeName = 'files') {
  return childrenOf(folder, 'directory').map(subfolder => ({
    name: subfolder.name,
    [filesNodeName]: childrenOf(subfolder, 'file')
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

function childrenOf(folder, type) {
  return Object.keys(folder).reduce((result, key) => {
    const child = folder[key];
    if (child && (!type || child.type === type)) result.push(child);
    return result;
  }, []);
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

// Helper for sorting an array of file objects by name:
function byFileName(fileA, fileB) {
  return fileA.name.localeCompare(fileB.name);
}

// Helper to select the specified element:
// Very hacky. Pastedd quickly from web.
function selectElement(el) {
  var body = document.body,
    range,
    sel;
  if (document.createRange && window.getSelection) {
    range = document.createRange();
    sel = window.getSelection();
    sel.removeAllRanges();
    try {
      range.selectNodeContents(el);
      sel.addRange(range);
    } catch (e) {
      range.selectNode(el);
      sel.addRange(range);
    }
  } else if (body['createTextRange']) {
    range = body['createTextRange']();
    range.moveToElementText(el);
    range.select();
  }
}

// Helper to un-select the specified element:
// Very hacky. Pastedd quickly from web.
function clearSelection() {
  if (window.getSelection) {
    if (window.getSelection().empty) {
      // Chrome
      window.getSelection().empty();
    } else if (window.getSelection().removeAllRanges) {
      // Firefox
      window.getSelection().removeAllRanges();
    }
  } else if (document['selection']) {
    // IE?
    document['selection'].empty();
  }
}

// Not well tested!
function copyToClipboard(el) {
  selectElement(el);
  document.execCommand('copy');
  clearSelection();
}
