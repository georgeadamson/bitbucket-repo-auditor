import { Component, Prop, State, Listen, h } from '@stencil/core';
import RepoState from '../state/repo-state';
import {
  getRepoName as getRepoNameFromUrl,
  BitbucketRepoTreeNode
} from '../../utils/bitbucket';

@Component({
  tag: 'd2-audit',
  styleUrl: 'd2-audit.scss',
  shadow: true
})
export class D2Audit {
  @Prop() project: string = 'd2_website_repositories'; //'avinash_digital20_platform' or 'd2_website_repositories';
  @Prop() repo: string;
  @Prop() branch: string = 'develop';
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
    this.repo = repo;
    this.brand = brand;
    this.branch = branch;
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
        <d2-audit-repos />
        <d2-audit-branches />
        <d2-audit-brands />
        <d2-audit-results />
      </RepoState.Provider>
    );
  }
}
