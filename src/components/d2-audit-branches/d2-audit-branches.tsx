import {
  Component,
  State,
  Event,
  EventEmitter,
  Prop,
  Watch,
  h
} from '@stencil/core';
import getRepoBranches from '../../utils/bitbucket/getRepoBranches';
import getRepoNameFromUrl from '../../utils/bitbucket/getRepoName';
import RepoState from '../state/repo-state';

// This component fetches a list of all braches in a repo and displays them in a picklist.
// API: https://bitbucket.org/!api/2.0/repositories/d2_website_repositories/timotei/refs/branches

const isLocalhost = location.hostname === 'localhost';

@Component({
  tag: 'd2-audit-branches',
  styleUrl: 'd2-audit-branches.scss',
  shadow: true
})
export class D2AuditBranches {
  @Prop() repo: string;

  // Will be populated by getRepoName()
  @State() isBitbucket: boolean;
  @State() isValidRepo: boolean;
  @State() branch: string;
  @State() hash: string;

  // Will be populated by json from API:
  @State() branches: { [key: string]: any };

  // Custom event:
  @Event() changebranch: EventEmitter;

  @Watch('repo')
  repoChanged() {
    console.log('dw-audit-banches Watch repoChanged');
    // Fetch list of repos from API:
    this.isValidRepo && this.repo
      ? getRepoBranches(this.repo).then(json => (this.branches = json))
      : // Fetch demo data when testing on localhost:
      isLocalhost
      ? import('./branches-tree.all.json').then(
          module => (this.branches = module.default)
        )
      : null;
  }

  componentWillLoad() {
    const { isBitbucket, isValidRepo, repo, branch } = getRepoNameFromUrl();

    // Extract repo name and branch from bitbucket url:
    Object.assign(this, {
      isBitbucket,
      isValidRepo,
      repo: this.repo || repo,
      branch: this.branch || branch
    });

    // Fetch list of repos from API:
    this.repoChanged();
  }

  onChangeBranch = (e?: Event) => {
    // Read selected repo name from picklist if applicable:
    if (e && e.target) this.branch = (e.target as HTMLSelectElement).value;

    // Raise event to pass selected repo name to other components:
    const { repo, branch } = this;
    this.changebranch.emit({ repo, branch });
  };

  render() {
    const { repo, branch, branches } = this;

    const selectedBranch = branch && branch.toUpperCase();
    const isLoaded = branches && branches.values && branches.values.length;

    const options = isLoaded ? (
      [<option value="">Choose branch...</option>].concat(
        ...branches.values.sort(byName).map(item => {
          const selected =
            item.name.toUpperCase() === selectedBranch ? true : null;
          return <option selected={selected}>{item.name}</option>;
        })
      )
    ) : (
      <option>Fetching branches...</option>
    );

    return (
      <div>
        <label htmlFor="d2-branches">
          Branch <small>{repo ? `of ${repo}` : ''}</small>
        </label>
        <select
          id="d2-branches"
          disabled={!isLoaded}
          onChange={this.onChangeBranch}
        >
          {options}
        </select>
      </div>
    );
  }
}

// Shared state:
RepoState.injectProps(D2AuditBranches, ['repo', 'branch', 'brand']);

// Helper for sorting an array of file objects by name:
function byName(itemA, itemB) {
  return itemA.name.localeCompare(itemB.name);
}
