import { h } from '@stencil/core';
import by from '../../utils/array/filterBy';
const byAppFolder = by({ name: 'app', type: 'directory' });
export class D2AuditResults {
    constructor() {
        this.brand = 'dove';
        this.getPlatformNode = () => getNode(this.tree, 'unilever-platform').contents.find(byAppFolder);
        this.getBrandNode = () => this.getPlatformNode().contents.find(by({ name: this.brand, type: 'directory' }));
    }
    componentWillLoad() {
        console.log(this.brand, this.tree);
        this.onTreeChange();
    }
    onTreeChange() {
        this.brandDir = getSimpleTreeOf(this.getBrandNode().contents);
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
            h("br", null),
            h("br", null),
            h("table", { class: "responsive-card-table" },
                h("thead", null,
                    h("tr", null,
                        h("th", null, "Customised components"),
                        h("th", null, "Html (Handlbars \"Templates\")"),
                        h("th", null, "Javascript (JS \"Views\")"),
                        h("th", null, "Style (SCSS)"))),
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
                        "path": "../../utils/types/BitbucketTypes"
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
        "brandDir": {}
    }; }
    static get watchers() { return [{
            "propName": "tree",
            "methodName": "onTreeChange"
        }, {
            "propName": "brand",
            "methodName": "onTreeChange"
        }]; }
}
function auditFolder(folder = {}, filesNodeName = 'files') {
    return subfoldersOf(folder).map(subfolder => ({
        name: subfolder.name,
        [filesNodeName]: filesOf(subfolder)
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
function subfoldersOf(folder) {
    return childrenOf(folder, 'directory');
}
function filesOf(folder) {
    return childrenOf(folder, 'file');
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
// Helper to recurse through node tree to find the one matching name:
// Note this does not support paths. It just returns the first match by name.
function getNode(nodes, name, type = 'directory', byName = by({ name, type })) {
    return ((nodes &&
        (nodes.find(byName) ||
            nodes
                .map(node => getNode(node.contents, name, type, byName))
                .find(byName))) ||
        null);
}
// Helper for sorting an array of file objects by name:
function byFileName(fileA, fileB) {
    return fileA.name.localeCompare(fileB.name);
}
