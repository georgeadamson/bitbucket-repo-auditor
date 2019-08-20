import { r as registerInstance, h } from './chunk-c1759aa1.js';
import { b as by } from './chunk-8ef7617a.js';

const byAppFolder = by({ name: 'app', type: 'directory' });
class D2AuditResults {
    constructor(hostRef) {
        registerInstance(this, hostRef);
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
        return (h("div", null, h("br", null), h("br", null), h("table", { class: "responsive-card-table" }, h("thead", null, h("tr", null, h("th", null, "Customised components"), h("th", null, "Html (Handlbars \"Templates\")"), h("th", null, "Javascript (JS \"Views\")"), h("th", null, "Style (SCSS)"))), h("tbody", null, combinedResults.map(component => (h("tr", null, h("td", null, component.name), h("td", null, component.templates && component.templates.length), h("td", null, component.views && component.views.length), h("td", null, component.sass && component.sass.length))))))));
    }
    static get watchers() { return {
        "tree": ["onTreeChange"],
        "brand": ["onTreeChange"]
    }; }
    static get style() { return "/**\n * Foundation for Sites by ZURB\n * Version 6.5.3\n * foundation.zurb.com\n * Licensed under MIT Open Source\n */\ntable {\n  border-collapse: collapse;\n  width: 100%;\n  margin-bottom: 1rem;\n  border-radius: 0;\n}\nthead,\ntbody,\ntfoot {\n  border: 1px solid #f1f1f1;\n  background-color: #fefefe;\n}\n\ncaption {\n  padding: 0.5rem 0.625rem 0.625rem;\n  font-weight: bold;\n}\n\nthead {\n  background: #f8f8f8;\n  color: #0a0a0a;\n}\n\ntfoot {\n  background: #f1f1f1;\n  color: #0a0a0a;\n}\n\nthead tr,\ntfoot tr {\n  background: transparent;\n}\nthead th,\nthead td,\ntfoot th,\ntfoot td {\n  padding: 0.5rem 0.625rem 0.625rem;\n  font-weight: bold;\n  text-align: left;\n}\n\ntbody th,\ntbody td {\n  padding: 0.5rem 0.625rem 0.625rem;\n}\n\ntbody tr:nth-child(even) {\n  border-bottom: 0;\n  background-color: #f1f1f1;\n}\n\ntable.unstriped tbody {\n  background-color: #fefefe;\n}\ntable.unstriped tbody tr {\n  border-bottom: 0;\n  border-bottom: 1px solid #f1f1f1;\n  background-color: #fefefe;\n}\n\n\@media screen and (max-width: 63.99875em) {\n  table.stack thead {\n    display: none;\n  }\n  table.stack tfoot {\n    display: none;\n  }\n  table.stack tr,\ntable.stack th,\ntable.stack td {\n    display: block;\n  }\n  table.stack td {\n    border-top: 0;\n  }\n}\n\ntable.scroll {\n  display: block;\n  width: 100%;\n  overflow-x: auto;\n}\n\ntable.hover thead tr:hover {\n  background-color: #f3f3f3;\n}\ntable.hover tfoot tr:hover {\n  background-color: #ececec;\n}\ntable.hover tbody tr:hover {\n  background-color: #f9f9f9;\n}\ntable.hover:not(.unstriped) tr:nth-of-type(even):hover {\n  background-color: #ececec;\n}\n\n.table-scroll {\n  overflow-x: auto;\n}\n\nth,\ntd {\n  font-family: sans-serif;\n  line-height: 1.15;\n  -webkit-text-size-adjust: 100%;\n  -moz-text-size-adjust: 100%;\n  -ms-text-size-adjust: 100%;\n  text-size-adjust: 100%;\n}"; }
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

export { D2AuditResults as d2_audit_results };
