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
import { getRepoName, getRepos, RepoState } from '../../utils/bitbucket';

// This component fetches a list of all repos and displays them in a picklist.

@Component({
  tag: 'd2-audit-repos',
  styleUrl: 'd2-audit-repos.scss',
  shadow: true
})
export class D2AuditRepos {
  @Prop() project: string = 'd2_website_repositories';

  // Will be populated by getRepoName()
  @State() isLocalhost: boolean;
  @State() isBitbucket: boolean;
  @State() isValidRepo: boolean;
  @State() repo: string;
  @State() branch: string;

  // Will be populated by json from API:
  @State() repos: { [key: string]: any };

  // Event to pass repo name to other components:
  @Event() changerepo: EventEmitter;

  @Watch('repo')
  repoChanged() {
    const { repo, branch } = this;
    // Raise event to pass selected repo name to other components:
    if (repo) {
      this.changerepo.emit({ repo, branch });
    }
  }

  componentWillLoad() {
    const { project, repo } = this;

    // Attempt to extract repo name and branch from bitbucket url:
    Object.assign(this, getRepoName(project));

    // Display a fake list of one repo until the api fetches the full list:
    if (repo) {
      this.repos = { values: [{ name: repo, type: 'repository' }] };
    }

    // Fetch list of repos from API:
    getRepos(project).then(json => (this.repos = json));
  }

  // Handler to read selected repo name from picklist if applicable:
  onChangeRepo = (e?: Event) => {
    if (e && e.target) this.repo = (e.target as HTMLSelectElement).value;
  };

  render() {
    const selectedRepo = this.repo && this.repo.toUpperCase();
    const { isLocalhost, isBitbucket, isValidRepo } = this;
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
      <Options
        prompt="Choose..."
        selected={selectedRepo}
        items={this.repos.values.sort(byName)}
      />
    ) : (
      <option>Fetching repos...</option>
    );

    return (
      <div>
        {message && <p>{message}</p>}
        <label htmlFor="d2-repos">Brand project</label>
        <select id="d2-repos" disabled={!isLoaded} onChange={this.onChangeRepo}>
          {options}
        </select>
      </div>
    );
  }
}

// Shared state:
RepoState.injectProps(D2AuditRepos, ['project', 'repo', 'branch', 'brand']);

// Helper for sorting an array of file objects by file.name:
function byName(fileA, fileB) {
  return fileA.name.localeCompare(fileB.name);
}
