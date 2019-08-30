import {
  Component,
  State,
  Event,
  EventEmitter,
  Prop,
  Watch,
  h
} from '@stencil/core';
import Options from '../Options/Options';
import { getRepoName, getRepoBranches, RepoState } from '../../utils/bitbucket';

// This component fetches a list of all braches in a repo and displays them in a picklist.
// API: https://bitbucket.org/!api/2.0/repositories/d2_website_repositories/timotei/refs/branches

@Component({
  tag: 'd2-audit-branches',
  styleUrl: 'd2-audit-branches.scss',
  shadow: true
})
export class D2AuditBranches {
  @Prop() project: string = 'd2_website_repositories';
  @Prop() repo: string;

  // Will be populated by getRepoName()
  @State() isLocalhost: boolean;
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
    const { project, repo } = this;
    console.log('dw-audit-banches Watch repoChanged');

    // Fetch list of repos from API:
    if (repo) {
      getRepoBranches(project, repo).then(json => (this.branches = json));
    }
  }

  componentWillLoad() {
    const { isBitbucket, isValidRepo, repo, branch } = getRepoName(
      this.project
    );

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
      <Options
        prompt="Choose branch..."
        selected={selectedBranch}
        items={branches.values.sort(byName)}
      />
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
RepoState.injectProps(D2AuditBranches, ['project', 'repo', 'branch', 'brand']);

// Helper for sorting an array of file objects by name:
function byName(itemA, itemB) {
  return itemA.name.localeCompare(itemB.name);
}
