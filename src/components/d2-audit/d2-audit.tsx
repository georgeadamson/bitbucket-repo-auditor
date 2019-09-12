import { Component, Prop, State, Listen, h } from '@stencil/core';
import RepoState from '../state/repo-state';
import {
  getRepoName as getRepoNameFromUrl,
  BitbucketRepoTreeNode
} from '../../utils/bitbucket';

@Component({
  tag: 'd2-audit',
  styleUrl: 'd2-audit.scss',
  shadow: false
})
export class D2Audit {
  @Prop() project: string = 'd2_website_repositories'; //'avinash_digital20_platform' or 'd2_website_repositories';
  @Prop() repo: string = 'Axe';
  @Prop() branch: string = 'develop';
  @Prop() brand: string = 'axe';

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
    if (branch) this.branch = branch;
    if (brand) this.brand = brand; // AKA app folder
  }

  componentWillLoad() {
    // Extract repo name and branch from bitbucket url:
    Object.assign(this, getRepoNameFromUrl(this.project));
  }

  render() {
    const { project, repo, branch, brand } = this;

    const state = {
      project,
      repo,
      branch,
      brand
    };

    return (
      <RepoState.Provider state={state}>
        <slot></slot>
      </RepoState.Provider>
    );
  }
}
