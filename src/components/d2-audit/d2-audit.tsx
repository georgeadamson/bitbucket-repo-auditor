import { Component, Prop, State, Listen, h } from '@stencil/core';
import by from '../../utils/array/filterBy';
import { BitbucketRepoTreeJsonType } from '../../utils/types/BitbucketTypes';
import getRepoNameFromUrl from '../../utils/bitbucket/getRepoName';
import DEMO_REPO_TREE_JSON_FROM_FILE from './repo-tree.axe.json';

const DEFAULT_TREE_URL =
  'https://bitbucket.org/!api/internal/repositories/d2_website_repositories/dove-uk-uidesign/tree/9082f993ff3c3c7b3e505b59c96fe6e274a4f6db/?no_size=1';

const byAppFolder = by({ name: 'app', type: 'directory' });

@Component({
  tag: 'd2-audit',
  styleUrl: 'd2-audit.css',
  shadow: true
})
export class D2Audit {
  @Prop() brand = 'axe';
  @Prop() treeUrl = DEFAULT_TREE_URL;

  @Prop() repo: string;
  @Prop() branch: string;

  @State() isBitbucket: boolean;
  @State() isValidRepo: boolean;
  @State() tree: BitbucketRepoTreeJsonType[];

  // Handle event raised by <d2-audit-repos>
  @Listen('changeRepo')
  repoChanged(e) {
    const { repo, brand } = e && e.detail;
    if (repo) this.repo = repo;
    if (brand) this.brand = brand;
  }

  componentWillLoad() {
    // Extract repo name and branch from bitbucket url:
    Object.assign(this, getRepoNameFromUrl());

    return (
      // fetch(this.treeUrl)
      // .then(response => response.text())
      // .then(json => (this.treeJson = JSON.parse(json)));

      new Promise(resolve => {
        resolve((this.tree = DEMO_REPO_TREE_JSON_FROM_FILE));
      })
    );
  }

  render() {
    return (
      <div>
        <d2-audit-repos />
        <select
          onChange={e => (this.brand = (e.target as HTMLSelectElement).value)}
        >
          {this.getAppFolder()
            .contents.sort(byFileName)
            .map(folder => (
              <option>{folder.name}</option>
            ))}
        </select>
        <d2-audit-results brand={this.brand} tree={this.tree} />
      </div>
    );
  }

  getAppFolder = () =>
    getNode(this.tree, 'unilever-platform').contents.find(byAppFolder);

  getProjectNode = () =>
    this.getAppFolder().contents.find(
      by({ name: this.brand, type: 'directory' })
    );
}

// Helper to recurse through node tree to find the one matching name:
// Note this does not support paths. It just returns the first match by name.
function getNode(nodes, name, type = 'directory', byName = by({ name, type })) {
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
