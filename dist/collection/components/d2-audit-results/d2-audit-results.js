import { h } from '@stencil/core';
import by from '../../utils/array/filterBy';
import { findNode, getRepoName, getRepoBranchBrands as getBrands, RepoState } from '../../utils/bitbucket';
export class D2AuditResults {
    constructor() {
        this.brand = 'dove';
    }
    repoChanged() {
        this.tree = null;
        this.brand = null;
        this.brandDir = null;
    }
    async brandChanged() {
        const { project, repo, branch } = this;
        // Fetch list of repos from API:
        if (repo && branch) {
            this.tree = await getBrands(project, repo, branch);
        }
        else {
            this.tree = null;
        }
    }
    treeChanged() {
        const { tree, brand } = this;
        if (tree && brand) {
            const brandNode = findNode(tree, brand);
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
        const { tree, brand, brandDir } = this;
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
        const combinedResults = mergeAudits(customViews, customTemplates, customSass).sort(byFileName);
        return (h("div", null,
            h("h2", null, "Showing counts of each type of customisation"),
            h("ul", null,
                h("li", null, "Markup = Number of customised html templates"),
                h("li", null, "Behaviour = Number of customised javascript views"),
                h("li", null, "Style = Number of customised CSS designs")),
            h("button", { onClick: () => copyToClipboard(this.table) }, "Copy to clipboard"),
            h("table", { class: "responsive-card-table", id: "d2-audit-results__table", ref: el => (this.table = el) },
                h("thead", null,
                    h("tr", null,
                        h("th", null, "Component name"),
                        h("th", null, "Markup (HBSS)"),
                        h("th", null, "Behaviour (JS)"),
                        h("th", null, "Style (CSS)"))),
                h("tbody", null, combinedResults.map(component => (h("tr", null,
                    h("td", null, component.name),
                    h("td", null, component.templates && component.templates.length),
                    h("td", null, component.views && component.views.length),
                    h("td", null, component.sass && component.sass.length))))))));
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
            "methodName": "repoChanged"
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
function byFileName(fileA, fileB) {
    return fileA.name.localeCompare(fileB.name);
}
// Helper to select the specified element:
// Very hacky. Pastedd quickly from web.
function selectElement(el) {
    var body = document.body, range, sel;
    if (document.createRange && window.getSelection) {
        range = document.createRange();
        sel = window.getSelection();
        sel.removeAllRanges();
        try {
            range.selectNodeContents(el);
            sel.addRange(range);
        }
        catch (e) {
            range.selectNode(el);
            sel.addRange(range);
        }
    }
    else if (body['createTextRange']) {
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
        }
        else if (window.getSelection().removeAllRanges) {
            // Firefox
            window.getSelection().removeAllRanges();
        }
    }
    else if (document['selection']) {
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
