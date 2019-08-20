import { Component, State, Event, EventEmitter, Watch, h } from '@stencil/core';
import getRepoName from '../../utils/bitbucket/getRepoName';
import getRepos from '../../utils/bitbucket/getRepos';
// import DEMO_REPOS_TREE_JSON_FROM_FILE from './repos-tree.all.json';

// This component fetches a list of all repos and displays them in a picklist.

const isLocalhost = location.hostname === 'localhost';

@Component({
  tag: 'd2-audit-repos',
  styleUrl: 'd2-audit-repos.scss',
  shadow: true
})
export class D2AuditRepos {
  // Will be populated by getRepoName()
  @State() isBitbucket: boolean;
  @State() isValidRepo: boolean;
  @State() repo: string;
  @State() branch: string;

  // Will be populated by json from API:
  @State() repos: { [key: string]: any };

  // Event to pass repo name to other components:
  @Event() changeRepo: EventEmitter;

  @Watch('repo')
  @Watch('branch')
  repoChanged() {
    // Raise event to pass selected repo name to other components:
    if (this.repo) {
      this.changeRepo.emit({ repo: this.repo, branch: this.branch });
    }
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
  onChangeRepo = (e?: Event) => {
    if (e && e.target) this.repo = (e.target as HTMLSelectElement).value;
  };

  render() {
    const selectedRepo = this.repo && this.repo.toUpperCase();
    const { isBitbucket, isValidRepo } = this;
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
          <label htmlFor="d2-repos">Repository</label>,
          <select
            id="d2-repos"
            onChange={this.onChangeRepo}
            data-disabled={!isLoaded}
          >
            {options}
          </select>
        ]}
      </div>
    );
  }
}

// Helper for sorting an array of file objects by name:
function byName(fileA, fileB) {
  return fileA.name.localeCompare(fileB.name);
}

// function delay(duration) {
//   return arg =>
//     new Promise(resolve => setTimeout(() => resolve(arg), duration));
// }
