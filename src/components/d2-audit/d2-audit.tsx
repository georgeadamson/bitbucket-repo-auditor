import { Component, Prop, State, Listen, h } from '@stencil/core';
import {
  findNode,
  getRepoName as getRepoNameFromUrl,
  BitbucketRepoTreeNode
} from '../../utils/bitbucket';
import DEMO_REPO_TREE_JSON_FROM_FILE from './repo-tree.axe.json';
import RepoState from '../state/repo-state';

const DEFAULT_TREE_URL =
  'https://bitbucket.org/!api/internal/repositories/d2_website_repositories/dove-uk-uidesign/tree/9082f993ff3c3c7b3e505b59c96fe6e274a4f6db/?no_size=1';

@Component({
  tag: 'd2-audit',
  styleUrl: 'd2-audit.css',
  shadow: true
})
export class D2Audit {
  @Prop() treeUrl = DEFAULT_TREE_URL;

  @Prop() repo: string;
  @Prop() branch: string;
  @Prop() brand: string;

  @State() isBitbucket: boolean;
  @State() isValidRepo: boolean;
  @State() tree: BitbucketRepoTreeNode[];

  // Handle event raised by <d2-audit-repos>
  @Listen('changerepo')
  @Listen('changebranch')
  @Listen('changebrand')
  repoChanged(e: CustomEvent) {
    const { repo, branch, brand } = e && e.detail;
    if (repo) this.repo = repo;
    if (brand) this.brand = brand;
    if (branch) this.branch = branch;
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
    const { repo, branch, brand } = this;

    const state = {
      repo,
      branch,
      brand
    };

    return (
      <div>
        <RepoState.Provider state={state}>
          <d2-audit-repos />
          <d2-audit-branches />
          <d2-audit-brands />
          <d2-audit-results tree={this.tree} />

          <select
            onChange={e => (this.brand = (e.target as HTMLSelectElement).value)}
          >
            {this.getAppFolder()
              .contents.sort(byFileName)
              .map(folder => (
                <option>{folder.name}</option>
              ))}
          </select>
        </RepoState.Provider>
      </div>
    );
  }

  getAppFolder = () => findNode(this.tree, 'unilever-platform/app');

  getBrandNode = () =>
    findNode(this.tree, `unilever-platform/app/${this.brand}`);
}

// Helper for sorting an array of file objects by name:
function byFileName(fileA, fileB) {
  return fileA.name.localeCompare(fileB.name);
}
