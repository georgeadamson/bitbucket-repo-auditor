import {
  Component,
  State,
  Event,
  EventEmitter,
  Watch,
  Prop,
  h
} from '@stencil/core';
import Options from '../Options/Options';
import {
  getRepoName,
  getRepoBranchBrands as getBrands,
  BitbucketRepoTreeNode,
  RepoState
} from '../../utils/bitbucket';

// This component fetches a list of all repos and displays them in a picklist.

@Component({
  tag: 'd2-audit-brands',
  styleUrl: 'd2-audit-brands.scss',
  shadow: true
})
export class D2AuditBrands {
  @Prop() project: string = 'd2_website_repositories';

  // Will be populated by getRepoName()
  @State() isLocalhost: boolean;
  @State() isBitbucket: boolean;
  @State() isValidRepo: boolean;
  @State() repo: string;
  @State() branch: string;
  @State() brand: string;

  // Will be populated by json from API:
  @State() brands: BitbucketRepoTreeNode[];

  // Event to pass repo name to other components:
  @Event() changebrand: EventEmitter;

  @Watch('brand')
  brandChanged() {
    const { repo, branch, brand } = this;
    // Raise event to pass selected repo name to other components:
    this.changebrand.emit({ repo, branch, brand });
  }

  @Watch('repo')
  @Watch('branch')
  branchChanged() {
    const { project, repo, branch } = this;

    // Fetch list of repos from API:
    if (repo && branch) {
      getBrands(project, repo, branch).then(appSubfolders => {
        this.brands = appSubfolders;
      });
    }
  }

  componentWillLoad() {
    // Attempt to extract repo name and branch from bitbucket url:
    Object.assign(this, getRepoName(this.project));

    // Fetch list of repos from API:
    this.branchChanged();
  }

  // Handler to read selected repo name from picklist if applicable:
  onChangeBrand = (e?: Event) => {
    if (e && e.target) this.brand = (e.target as HTMLSelectElement).value;
  };

  render() {
    console.log('BRANDS', this.repo, this.branch, this.brands);

    const selectedBrand = this.brand && this.brand.toUpperCase();
    const {
      repo,
      branch,
      brands,
      isBitbucket,
      isValidRepo,
      isLocalhost
    } = this;
    const isLoaded = brands && brands.length;
    const message = isLocalhost
      ? null
      : !isBitbucket
      ? 'This tool only works in a bitbucket repo'
      : !isValidRepo
      ? 'Open a bitbucket repo and try this again'
      : null;

    const options = isLoaded ? (
      <Options
        prompt="Choose brand..."
        selected={selectedBrand}
        items={this.brands.sort(byName) as any}
      />
    ) : (
      <option>Fetching repo data...</option>
    );

    return (
      <div>
        {message && <p>{message}</p>}
        <label htmlFor="d2-repos">
          Brand folder
          <small>
            {repo ? ` of ${repo}` : ''}
            {branch ? `:${branch}` : ''}
          </small>
        </label>
        <select
          id="d2-repos"
          disabled={!isLoaded}
          onChange={this.onChangeBrand}
        >
          {options}
        </select>
      </div>
    );
  }
}

// Shared state:
RepoState.injectProps(D2AuditBrands, ['project', 'repo', 'branch', 'brand']);

// Helper for sorting an array of file objects by name:
function byName(fileA, fileB) {
  return fileA.name.localeCompare(fileB.name);
}
