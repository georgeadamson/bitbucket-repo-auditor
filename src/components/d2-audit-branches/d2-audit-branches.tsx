import { Component, State, Event, EventEmitter, h } from '@stencil/core';
import getRepoNameFromUrl from '../../utils/bitbucket/getRepoName';
import DEMO_BRANCHES_TREE_JSON_FROM_FILE from './branches-tree.all.json';

// This component fetches a list of all braches in a repo and displays them in a picklist.
// API: https://bitbucket.org/!api/2.0/repositories/d2_website_repositories/timotei/refs/branches

@Component({
  tag: 'd2-audit-branches',
  styleUrl: 'd2-audit-branches.scss',
  shadow: true
})
export class D2AuditBranches {
  // Will be populated by getRepoName()
  @State() isBitbucket: boolean;
  @State() isValidRepo: boolean;
  @State() repo: string;
  @State() branch: string;

  // Will be populated by json from API:
  @State() branches: { [key: string]: any };

  @Event() changeBranch: EventEmitter;

  componentWillLoad() {
    // Extract repo name and branch from bitbucket url:
    Object.assign(this, getRepoNameFromUrl());
    this.onChangeBranch();

    return (
      // fetch(this.treeUrl)
      // .then(response => response.text())
      // .then(json => (this.treeJson = JSON.parse(json)));

      new Promise(resolve => {
        resolve((this.branches = DEMO_BRANCHES_TREE_JSON_FROM_FILE));
      })
    );
  }

  onChangeBranch = (e?: Event) => {
    // Read selected repo name from picklist if applicable:
    if (e && e.target) this.repo = (e.target as HTMLSelectElement).value;

    // Raise event to pass selected repo name to other components:
    if (this.repo) this.changeBranch.emit({ repo: this.repo });
  };

  render() {
    return (
      <div>
        <select onChange={this.onChangeBranch}>
          {this.branches.values.sort(byName).map(branch => (
            <option
              selected={
                this.branch &&
                branch.name.toUpperCase() === this.branch.toUpperCase()
                  ? true
                  : null
              }
            >
              {branch.name}
            </option>
          ))}
        </select>
      </div>
    );
  }
}

// Helper for sorting an array of file objects by name:
function byName(itemA, itemB) {
  return itemA.name.localeCompare(itemB.name);
}
