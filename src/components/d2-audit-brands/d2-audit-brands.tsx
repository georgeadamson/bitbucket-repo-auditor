import { Component, State, Event, EventEmitter, Watch, h } from '@stencil/core';
import getRepoName from '../../utils/bitbucket/getRepoName';
import getRepos from '../../utils/bitbucket/getRepos';
import RepoState from '../state/repo-state';

// This component fetches a list of all repos and displays them in a picklist.

const isLocalhost = location.hostname === 'localhost';

@Component({
  tag: 'd2-audit-brands',
  styleUrl: 'd2-audit-brands.scss',
  shadow: true
})
export class D2AuditBrands {
  // Will be populated by getRepoName()
  @State() isBitbucket: boolean;
  @State() isValidRepo: boolean;
  @State() repo: string;
  @State() branch: string;
  @State() brand: string;

  // Will be populated by json from API:
  @State() repos: { [key: string]: any };

  // Event to pass repo name to other components:
  @Event() changerepo: EventEmitter;

  @Watch('brand')
  repoChanged() {
    const { repo, branch, brand } = this;
    // Raise event to pass selected repo name to other components:
    this.changerepo.emit({ repo, branch, brand });
  }

  componentWillLoad() {
    // Attempt to extract repo name and branch from bitbucket url:
    Object.assign(this, getRepoName());

    if (this.repo) {
      // Display a fake list of one repo until the api fetches the full list:
      this.repos = {
        values: [{ name: this.repo, type: 'repository' }]
      };
    }

    // Fetch list of repos from API:
    this.isValidRepo
      ? getRepos().then(json => (this.repos = json))
      : // Fetch demo data when testing on localhost:
      isLocalhost
      ? import('./repos-tree.all.json').then(
          module => (this.repos = module.default)
        )
      : null;
  }

  // Handler to read selected repo name from picklist if applicable:
  onChangeBrand = (e?: Event) => {
    if (e && e.target) this.brand = (e.target as HTMLSelectElement).value;
  };

  render() {
    console.log('BRANDS', this.repo, this.branch);
    const selectedRepo = this.repo && this.repo.toUpperCase();
    const { repo, branch, isBitbucket, isValidRepo } = this;
    const isLoaded =
      this.repos && this.repos.values && this.repos.values.length;
    const message = isLocalhost
      ? null
      : !isBitbucket
      ? 'This tool only works in a bitbucket repo'
      : !isValidRepo
      ? 'Open a bitbucket repo and try this again'
      : null;

    const options = isLoaded ? (
      [<option value="">Choose repo...</option>].concat(
        ...this.repos.values.sort(byName).map(repo => {
          const selected =
            repo.name.toUpperCase() === selectedRepo ? true : null;
          return <option selected={selected}>{repo.name}</option>;
        })
      )
    ) : (
      <option>Fetching repos...</option>
    );

    return (
      <div>
        {(message && <p>{message}</p>) || [
          <label htmlFor="d2-repos">
            Brand folder{' '}
            <small>
              {repo ? `in repo ${repo}` : ''}
              {branch ? `: ${branch}` : ''}
            </small>
          </label>,
          <select
            id="d2-repos"
            disabled={!isLoaded}
            onChange={this.onChangeBrand}
          >
            {options}
          </select>
        ]}
      </div>
    );
  }
}

// Shared state:
RepoState.injectProps(D2AuditBrands, ['repo', 'branch', 'brand']);

// Helper for sorting an array of file objects by name:
function byName(fileA, fileB) {
  return fileA.name.localeCompare(fileB.name);
}
