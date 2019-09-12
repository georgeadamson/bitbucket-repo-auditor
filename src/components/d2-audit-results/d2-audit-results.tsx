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
    ).sort(byTotal);

    let limit = 1;
    let totalEffort = 0;
    const totalCustomised = combinedResults.length;
    const totalLive = parseInt(String(totalCustomised * 0.8));
    const totalLiveCustomised = parseInt(String(totalLive * 0.8));

    combinedResults.map(c => {
      const templates = (c.templates && c.templates.length) || 0;
      const views = (c.views && c.views.length) || 0;
      const styles = (c.sass && c.sass.length) || 0;
      const total = templates + views + styles;
      limit = Math.max(limit, total);
      totalEffort += total;
    });

    // Styles added kast minute!
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
        cursor: pointer;
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
        padding: 0 15px 20px 15px;
      }
      .selected .c-summary-card__wrapper  {
        box-shadow: 1px 1px 4px 1px rgba(0, 0, 0, .9);
        transform: translateY(10px);
      }
      .selected .c-summary-card__wrapper:after {
        content: "";
        display: inline-block;
        border-style: solid;
        border-width: 10px 10px 0 10px;
        border-color-bottom: #000;
        border-color: #000 transparent;
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-10px);
      }
      .c-summary-card__heading {
        color: #313F50;
        font-family: var(--font-family-primary);
        font-weight: 400;
        font-size: 20px;
        line-height: 1.5;
        xmin-height: 3em;
        margin: 0;
        padding-top: 10px;
        text-align: left;
      }
      .c-summary-card__subheading {
        color: #999;
        font-family: var(--font-family-primary);
        font-weight: 300;
        font-size: 14px;
        line-height: 1.5;
        min-height: 3em;
        margin: 0;
        padding-top: 10px;
        text-align: left;
      }
      .c-summary-card__body {
        color: #3c4858;
        margin-top: 0px;
        min-height: auto;
        font-family: var(--font-family-primary);
        font-size: 60px;
        font-weight: 300;
        margin: 28px 0 0 0;
        text-decoration: none;
        text-align: center;
      }
      .c-summary-card__body small {
        color: #999;
        display: block;
        font-size: 12px;
      }`;

    return (
      <div style={{ background: '#F8F8F8', padding: '20px' }}>
        <style>{styles}</style>

        <ul class="c-summary-cards">
          <li class="c-summary-cards__item">
            <div class="c-summary-card__wrapper">
              <h2 class="c-summary-card__heading">Active components</h2>
              <h3 class="c-summary-card__subheading">
                Components currently in use
              </h3>
              <p class="c-summary-card__body">
                {totalLive}
                <small>of 136 components</small>
              </p>
            </div>
          </li>
          <li class="c-summary-cards__item selected">
            <div class="c-summary-card__wrapper">
              <h2 class="c-summary-card__heading">Customised components</h2>
              <h3 class="c-summary-card__subheading">Customised components</h3>
              <p class="c-summary-card__body">
                {totalCustomised}
                <small>of which {totalLiveCustomised} are in use</small>
              </p>
            </div>
          </li>
          <li class="c-summary-cards__item">
            <div class="c-summary-card__wrapper">
              <h2 class="c-summary-card__heading">Inactive components</h2>
              <h3 class="c-summary-card__subheading">
                Customised components not in use
              </h3>
              <p class="c-summary-card__body">
                {totalCustomised - totalLiveCustomised}
                <small>of {totalCustomised} components</small>
              </p>
            </div>
          </li>
          <li class="c-summary-cards__item">
            <div class="c-summary-card__wrapper">
              <h2 class="c-summary-card__heading">Upgrade effort</h2>
              <h3 class="c-summary-card__subheading">
                Estimated effort to upgrade components
              </h3>
              <p class="c-summary-card__body">
                {parseInt(String(totalEffort / 4))}
                <small>Person-days</small>
              </p>
            </div>
          </li>
        </ul>

        <section style={{ background: '#fff', padding: '20px' }}>
          <h2>Component upgrade effort</h2>
          <p>Components customised by {repo || brand}</p>

          <p style={{ float: 'right' }}>
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
                <th>Customisation effort (days)</th>
                <th>HTML</th>
                <th>JS</th>
                <th>CSS</th>
              </tr>
            </thead>
            <tbody>
              {combinedResults.map(c => {
                const templates = (c.templates && c.templates.length) || 0;
                const views = (c.views && c.views.length) || 0;
                const styles = (c.sass && c.sass.length) || 0;
                const total = templates + views + styles;
                const effort = total / 4;

                return (
                  <tr>
                    <td>{c.name}</td>
                    <td style={{ width: '50%' }}>
                      <d2-stacked-bar
                        value1={parseInt(String((total / limit) * 100))}
                        // value2={views}
                        // value3={styles}
                        total={100}
                        label={
                          effort < 1
                            ? '<1d'
                            : String(parseInt(String(effort))) + 'd'
                        }
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
        </section>
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
// function byFileName(fileA, fileB) {
//   return fileA.name.localeCompare(fileB.name);
// }

function byTotal(a, b) {
  const totalA = getTotal(a);
  const totalB = getTotal(b);
  return totalA === totalB ? 0 : totalA > totalB ? -1 : 1;
}

function getTotal(c) {
  const templates = (c.templates && c.templates.length) || 0;
  const views = (c.views && c.views.length) || 0;
  const styles = (c.sass && c.sass.length) || 0;
  return templates + views + styles;
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
