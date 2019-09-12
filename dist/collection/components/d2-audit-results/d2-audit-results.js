import { h } from '@stencil/core';
import by from '../../utils/array/filterBy';
import { findNode, getRepoName, getRepoBranchBrands as getBrands, RepoState
//BitbucketRepoNodeType
 } from '../../utils/bitbucket';
export class D2AuditResults {
    constructor() {
        this.brand = 'dove';
    }
    // @Watch('repo')
    // repoChanged() {
    //   this.tree = null;
    //   this.brand = null;
    //   this.brandDir = null;
    // }
    async brandChanged() {
        const { project, repo, branch } = this;
        console.log('something changed');
        // Fetch list of repos from API:
        if (repo && branch) {
            this.tree = await getBrands(project, repo, branch);
        }
        else {
            // this.tree = (await import('../../data/file-tree.axe.json'))
            //   .default as any;
            this.tree = null;
        }
    }
    treeChanged() {
        const { tree, brand } = this;
        console.log('treeChanged');
        if (tree /* && brand*/) {
            const brandNode = findNode(tree, brand || 'axe');
            this.brandDir = getSimpleTreeOf(brandNode.contents);
        }
        else {
            this.brandDir = null;
        }
    }
    componentWillLoad() {
        // Attempt to extract repo name and branch from bitbucket url:
        Object.assign(this, getRepoName(this.project));
        // Fetch list of repos from API:
        this.brandChanged();
    }
    render() {
        const { repo, tree, brand, brandDir } = this;
        // Rudimentary error handling:
        if (!tree)
            return h("p", null, "Missing `tree` json.");
        else if (!brand)
            return h("p", null, "Missing `brand` name.");
        else if (!brandDir)
            return h("p", null, "Unable to derive `brandDir` from `tree` json.");
        const customViews = auditFolder(brandDir.js.views, 'views');
        const customTemplates = auditFolder(brandDir.js.templates, 'templates');
        const customSass = auditFolder(brandDir.sass.views, 'sass');
        const combinedResults = mergeAudits(customViews, customTemplates, customSass).sort(byTotal);
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
        drop-shadow: 1px 1px 4px 1px rgba(0, 0, 0, .9);
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
        return (h("div", { style: { background: '#F8F8F8', padding: '20px' } },
            h("style", null, styles),
            h("ul", { class: "c-summary-cards" },
                h("li", { class: "c-summary-cards__item" },
                    h("div", { class: "c-summary-card__wrapper" },
                        h("h2", { class: "c-summary-card__heading" }, "Active components"),
                        h("h3", { class: "c-summary-card__subheading" }, "Components currently in use"),
                        h("p", { class: "c-summary-card__body" },
                            totalLive,
                            h("small", null, "of 136 components")))),
                h("li", { class: "c-summary-cards__item selected" },
                    h("div", { class: "c-summary-card__wrapper" },
                        h("h2", { class: "c-summary-card__heading" }, "Customised components"),
                        h("h3", { class: "c-summary-card__subheading" }, "Customised components"),
                        h("p", { class: "c-summary-card__body" },
                            totalCustomised,
                            h("small", null,
                                "of which ",
                                totalLiveCustomised,
                                " are in use")))),
                h("li", { class: "c-summary-cards__item" },
                    h("div", { class: "c-summary-card__wrapper" },
                        h("h2", { class: "c-summary-card__heading" }, "Inactive components"),
                        h("h3", { class: "c-summary-card__subheading" }, "Customised components not in use"),
                        h("p", { class: "c-summary-card__body" },
                            totalCustomised - totalLiveCustomised,
                            h("small", null,
                                "of ",
                                totalCustomised,
                                " customised components")))),
                h("li", { class: "c-summary-cards__item" },
                    h("div", { class: "c-summary-card__wrapper" },
                        h("h2", { class: "c-summary-card__heading" }, "Upgrade effort"),
                        h("h3", { class: "c-summary-card__subheading" }, "Estimated effort to upgrade components"),
                        h("p", { class: "c-summary-card__body" },
                            parseInt(String(totalEffort / 3)),
                            h("small", null, "Person-days"))))),
            h("section", { style: { background: '#fff', padding: '20px' } },
                h("h2", null, "Component upgrade effort"),
                h("p", null,
                    "Components customised by ",
                    repo || brand),
                h("p", { style: { float: 'right' } },
                    h("a", { href: "#export", onClick: e => exportToFile(e.target, this.table) }, "Export to Excel")),
                h("table", { class: "responsive-card-table", id: "d2-audit-results__table", ref: el => (this.table = el) },
                    h("thead", null,
                        h("tr", null,
                            h("th", null, "Component"),
                            h("th", null, "Customisation effort (days)"),
                            h("th", null, "HTML"),
                            h("th", null, "JS"),
                            h("th", null, "CSS"))),
                    h("tbody", null, combinedResults.map(c => {
                        const templates = (c.templates && c.templates.length) || 0;
                        const views = (c.views && c.views.length) || 0;
                        const styles = (c.sass && c.sass.length) || 0;
                        const total = templates + views + styles;
                        const effort = total / 3;
                        return (h("tr", null,
                            h("td", null, c.name),
                            h("td", { style: { width: '50%' } },
                                h("d2-stacked-bar", { value1: parseInt(String((total / limit) * 100)), 
                                    // value2={views}
                                    // value3={styles}
                                    total: 100, label: effort < 1
                                        ? '<1d'
                                        : String(parseInt(String(effort))) + 'd' })),
                            h("td", null, templates),
                            h("td", null, views),
                            h("td", null, styles)));
                    }))))));
    }
    static get is() { return "d2-audit-results"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["d2-audit-results.scss"]
    }; }
    static get styleUrls() { return {
        "$": ["d2-audit-results.css"]
    }; }
    static get properties() { return {
        "project": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "project",
            "reflect": false
        },
        "repo": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "repo",
            "reflect": false
        },
        "branch": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "branch",
            "reflect": false
        },
        "brand": {
            "type": "string",
            "mutable": false,
            "complexType": {
                "original": "string",
                "resolved": "string",
                "references": {}
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            },
            "attribute": "brand",
            "reflect": false,
            "defaultValue": "'dove'"
        },
        "tree": {
            "type": "unknown",
            "mutable": false,
            "complexType": {
                "original": "BitbucketRepoTreeNode[]",
                "resolved": "BitbucketRepoTreeNode[]",
                "references": {
                    "BitbucketRepoTreeNode": {
                        "location": "import",
                        "path": "../../utils/bitbucket"
                    }
                }
            },
            "required": false,
            "optional": false,
            "docs": {
                "tags": [],
                "text": ""
            }
        }
    }; }
    static get states() { return {
        "brandDir": {},
        "isLocalhost": {}
    }; }
    static get watchers() { return [{
            "propName": "repo",
            "methodName": "brandChanged"
        }, {
            "propName": "branch",
            "methodName": "brandChanged"
        }, {
            "propName": "brand",
            "methodName": "brandChanged"
        }, {
            "propName": "tree",
            "methodName": "treeChanged"
        }]; }
}
// Shared state:
RepoState.injectProps(D2AuditResults, ['project', 'repo', 'branch', 'brand']);
function auditFolder(folder = {}, filesNodeName = 'files') {
    return childrenOf(folder, 'directory').map(subfolder => ({
        name: subfolder.name,
        [filesNodeName]: childrenOf(subfolder, 'file')
    }));
}
function mergeAudits(...args) {
    return Array.prototype.concat.apply([], args).reduce((results, item) => {
        const result = results.find(by({ name: item.name }));
        if (result) {
            Object.assign(result, item);
        }
        else {
            results.push(Object.assign({}, item));
        }
        return results;
    }, []);
}
function childrenOf(folder, type) {
    return Object.keys(folder).reduce((result, key) => {
        const child = folder[key];
        if (child && (!type || child.type === type))
            result.push(child);
        return result;
    }, []);
}
function getSimpleTreeOf(nodes = [], filter = {}) {
    if (!Array.isArray(nodes))
        nodes = [nodes];
    return nodes.filter(by(filter)).reduce((tree, node) => {
        const nodeProps = { name: node.name, type: node.type, size: node.size };
        tree[node.name] =
            node.type === 'directory'
                ? Object.assign({}, nodeProps, getSimpleTreeOf(node.contents, { type: 'directory' }), getSimpleTreeOf(node.contents, { type: 'file' })) : nodeProps;
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
function exportToFile(link, table, filename = 'export.xsl') {
    var html = table.outerHTML;
    var url = 'data:application/vnd.ms-excel,' + escape(html); // Set your html table into url
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    return false;
}
