import { h } from '@stencil/core';
// import pickBy from 'lodash.pickBy';
import DEFAULT_TREE_JSON from './repo-tree.dove.json';
const DEFAULT_TREE_URL = 'https://bitbucket.org/!api/internal/repositories/d2_website_repositories/dove-uk-uidesign/tree/9082f993ff3c3c7b3e505b59c96fe6e274a4f6db/?no_size=1';
const byAppFolder = by({ name: 'app', type: 'directory' });
export class D2Audit {
    constructor() {
        this.project = 'dove';
        this.treeUrl = DEFAULT_TREE_URL;
        this.getAppFolder = () => getNode(this.tree, 'unilever-platform').contents.find(byAppFolder);
        this.getProjectNode = () => this.getAppFolder().contents.find(by({ name: this.project, type: 'directory' }));
    }
    componentWillLoad() {
        return (
        // fetch(this.treeUrl)
        // .then(response => response.text())
        // .then(json => (this.treeJson = JSON.parse(json)));
        new Promise(resolve => {
            resolve((this.tree = DEFAULT_TREE_JSON));
        }).then(() => {
            const projectNode = this.getProjectNode();
            this.projectDir = getSimpleTreeOf(projectNode.contents);
        }));
    }
    render() {
        const projectDir = this.projectDir;
        const customViews = auditFolder(projectDir.js.views, 'views');
        const customTemplates = auditFolder(projectDir.js.templates, 'templates');
        const customSass = auditFolder(projectDir.sass.views, 'sass');
        const combinedResults = mergeAudits(mergeAudits(customViews, customTemplates), customSass).sort((a, b) => a.name.localeCompare(b.name));
        return (h("div", null,
            h("br", null),
            h("br", null),
            h("table", null,
                h("tr", null,
                    h("th", null, "Customised components"),
                    h("th", null, "Html (Handlbars \"Templates\")"),
                    h("th", null, "Javascript (JS \"Views\")"),
                    h("th", null, "Style (SCSS)")),
                combinedResults.map(component => (h("tr", null,
                    h("td", null, component.name),
                    h("td", null, component.templates && component.templates.length),
                    h("td", null, component.views && component.views.length),
                    h("td", null, component.sass && component.sass.length)))))));
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
            "reflect": false,
            "defaultValue": "'dove'"
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
        }
    }; }
    static get states() { return {
        "tree": {},
        "projectDir": {}
    }; }
}
function auditFolder(folder = {}, filesNodeName = 'files') {
    return subfoldersOf(folder).map(subfolder => ({
        name: subfolder.name,
        [filesNodeName]: filesOf(subfolder)
    }));
}
function mergeAudits(audit1, audit2) {
    function pick(audit, name) {
        return audit.find(item => item.name === name);
    }
    return [...audit1, ...audit2].reduce((results, item) => {
        const result = pick(results, item.name);
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
        const nodeProps = {
            name: node.name,
            type: node.type,
            size: node.size
        };
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
// Helper to create a function for filtering an array of objects:
// Eg: myArray.filter( by({ name:'foo', type:'bar' }) )
function by(props = {}) {
    const keys = Object.keys(props);
    return item => keys.every(key => item &&
        (Array.isArray(item)
            ? item[0] === key && item[1] === props[key]
            : item[key] === props[key]));
}
