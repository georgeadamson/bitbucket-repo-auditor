import { Component, Prop, State, Watch, h } from '@stencil/core';
import by from '../../utils/array/filterBy';
import {
  findNode,
  getRepoName,
  getRepoBranchBrands as getBrands,
  BitbucketRepoTreeNode,
  RepoState
  //BitbucketRepoNodeType
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
    console.log('repoChanged');
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
      console.log('brandChanged else');
      this.tree = (await import('../../data/file-tree.axe.json'))
        .default as any;
      console.log(this.tree);
    }
  }

  @Watch('tree')
  treeChanged() {
    const { tree, brand } = this;
    console.log('treeChanged');
    if (tree /* && brand*/) {
      const brandNode = findNode(tree, brand || 'axe');
      this.brandDir = getSimpleTreeOf(brandNode.contents);
    } else {
      this.brandDir = null;
    }
  }

  private table: HTMLTableElement;

  componentWillLoad() {
    // Attempt to extract repo name and branch from bitbucket url:
    Object.assign(this, getRepoName(this.project));

    // Fetch list of repos from API:
    this.brandChanged();
  }

  render() {
    const { repo, tree, brand, brandDir } = this;

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

    const styles = `
      .c-summary-cards {
        display: flex;
        flex-wrap: wrap;
        list-style: none;
        margin: 0 -15px;
        padding: 0;
      }
      .c-summary-cards__item {
        display: inline-block;
        padding: 0 15px 30px 15px;
        box-sizing: border-box;
        width: 25%;
      }
      .c-summary-card__wrapper {
        color: rgba(0, 0, 0, 0.87);
        border: 0;
        position: relative;
        font-size: 0.875rem;
        min-width: 0;
        word-wrap: break-word;
        background: #fff;
        -webkit-box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.14);
        box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.14);
        margin-top: 30px;
        border-radius: 6px;
        padding: 0 15px;
      }
      .c-summary-card__heading {
        color: #999;
        font-family: var(--font-family-primary);
        font-weight: 300;
        font-size: 14px;
        line-height: 1.5em;
        margin: 0;
        padding-top: 10px;
        text-align: right;
      }
      .c-summary-card__body {
        color: #3c4858;
        margin-top: 0px;
        min-height: auto;
        font-family: var(--font-family-primary);
        font-size: 25.55px;
        font-weight: 300;
        margin-bottom: 3px;
        text-decoration: none;
        text-align: right;
      }`;

    return (
      <div>
        <style>{styles}</style>
        <h2>Summary</h2>
        <p>Components customised by {repo || brand}</p>

        <ul class="c-summary-cards">
          <li class="c-summary-cards__item">
            <div class="c-summary-card__wrapper">
              <h2 class="c-summary-card__heading">Total components</h2>
              <p class="c-summary-card__body">38</p>
            </div>
          </li>
          <li class="c-summary-cards__item">
            <div class="c-summary-card__wrapper">
              <h2 class="c-summary-card__heading">Live components</h2>
              <p class="c-summary-card__body">30</p>
            </div>
          </li>
          <li class="c-summary-cards__item">
            <div class="c-summary-card__wrapper">
              <h2 class="c-summary-card__heading">Custom components</h2>
              <p class="c-summary-card__body">38</p>
            </div>
          </li>
          <li class="c-summary-cards__item">
            <div class="c-summary-card__wrapper">
              <h2 class="c-summary-card__heading">Upgrade effort</h2>
              <p class="c-summary-card__body">12 days</p>
            </div>
          </li>
        </ul>

        {/* <ul>
          <li>Markup = Number of customised html templates</li>
          <li>Behaviour = Number of customised javascript views</li>
          <li>Style = Number of customised CSS designs</li>
        </ul> */}

        <p>
          <a
            href="#export"
            onClick={e =>
              exportToFile(e.target as HTMLAnchorElement, this.table)
            }
          >
            Export to Excel
          </a>
        </p>

        <table
          class="responsive-card-table"
          id="d2-audit-results__table"
          ref={el => (this.table = el)}
        >
          <thead>
            <tr>
              <th>Component</th>
              <th>Customisation effort</th>
              <th>HTML</th>
              <th>Views</th>
              <th>CSS</th>
            </tr>
          </thead>
          <tbody>
            {combinedResults.map(c => {
              const templates = (c.templates && c.templates.length) || 0;
              const views = (c.views && c.views.length) || 0;
              const styles = (c.sass && c.sass.length) || 0;

              return (
                <tr>
                  <td>{c.name}</td>
                  <td>
                    <d2-stacked-bar
                      value1={templates}
                      value2={views}
                      value3={styles}
                    ></d2-stacked-bar>
                  </td>
                  <td>{templates}</td>
                  <td>{views}</td>
                  <td>{styles}</td>
                </tr>
              );
            })}
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

// // Helper to select the specified element:
// // Very hacky. Pastedd quickly from web.
// function selectElement(el) {
//   var body = document.body,
//     range,
//     sel;
//   if (document.createRange && window.getSelection) {
//     range = document.createRange();
//     sel = window.getSelection();
//     sel.removeAllRanges();
//     try {
//       range.selectNodeContents(el);
//       sel.addRange(range);
//     } catch (e) {
//       range.selectNode(el);
//       sel.addRange(range);
//     }
//   } else if (body['createTextRange']) {
//     range = body['createTextRange']();
//     range.moveToElementText(el);
//     range.select();
//   }
// }

// // Helper to un-select the specified element:
// // Very hacky. Pastedd quickly from web.
// function clearSelection() {
//   if (window.getSelection) {
//     if (window.getSelection().empty) {
//       // Chrome
//       window.getSelection().empty();
//     } else if (window.getSelection().removeAllRanges) {
//       // Firefox
//       window.getSelection().removeAllRanges();
//     }
//   } else if (document['selection']) {
//     // IE?
//     document['selection'].empty();
//   }
// }

// // Not well tested!
// function copyToClipboard(el) {
//   selectElement(el);
//   document.execCommand('copy');
//   clearSelection();
// }

function exportToFile(
  link: HTMLAnchorElement,
  table: HTMLTableElement,
  filename = 'export.xsl'
) {
  var html = table.outerHTML;
  var url = 'data:application/vnd.ms-excel,' + escape(html); // Set your html table into url
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  return false;
}
