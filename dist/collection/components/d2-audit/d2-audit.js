import { h } from '@stencil/core';
import by from '../../utils/array/filterBy';
import DEMO_TREE_JSON_FROM_FILE from './repo-tree.axe.json';
const DEFAULT_TREE_URL = 'https://bitbucket.org/!api/internal/repositories/d2_website_repositories/dove-uk-uidesign/tree/9082f993ff3c3c7b3e505b59c96fe6e274a4f6db/?no_size=1';
const byAppFolder = by({ name: 'app', type: 'directory' });
export class D2Audit {
    constructor() {
        this.brand = 'axe';
        this.treeUrl = DEFAULT_TREE_URL;
        this.getAppFolder = () => getNode(this.tree, 'unilever-platform').contents.find(byAppFolder);
        this.getProjectNode = () => this.getAppFolder().contents.find(by({ name: this.brand, type: 'directory' }));
    }
    componentWillLoad() {
        const urlMatches = location.href.match(/d2_website_repositories\/([^\/]+)\/src\/([^\/]+)/) ||
            [];
        this.repo = urlMatches[1];
        this.branch = urlMatches[1];
        return (
        // fetch(this.treeUrl)
        // .then(response => response.text())
        // .then(json => (this.treeJson = JSON.parse(json)));
        new Promise(resolve => {
            resolve((this.tree = DEMO_TREE_JSON_FROM_FILE));
        }));
    }
    render() {
        return (h("div", null,
            h("select", { onChange: e => (this.brand = e.target.value) }, this.getAppFolder()
                .contents.sort(byFileName)
                .map(folder => (h("option", null, folder.name)))),
            h("d2-audit-results", { brand: this.brand, tree: this.tree })));
    }
    static get is() { return "d2-audit"; }
    static get encapsulation() { return "shadow"; }
    static get originalStyleUrls() { return {
        "$": ["d2-audit.css"]
    }; }
    static get styleUrls() { return {
        "$": ["d2-audit.css"]
    }; }
    static get properties() { return {
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
            "defaultValue": "'axe'"
        },
        "treeUrl": {
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
            "attribute": "tree-url",
            "reflect": false,
            "defaultValue": "DEFAULT_TREE_URL"
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
        }
    }; }
    static get states() { return {
        "tree": {}
    }; }
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
