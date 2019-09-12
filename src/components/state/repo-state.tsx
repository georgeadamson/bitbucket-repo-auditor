import { h } from '@stencil/core';
import { createProviderConsumer } from '@stencil/state-tunnel';

export interface IRepoState {
  project: string;
  repo: string;
  branch: string;
  brand: string;
}

export default createProviderConsumer<IRepoState>(
  {
    project: 'd2_website_repositories', //'avinash_digital20_platform' or 'd2_website_repositories';
    repo: null,
    branch: null,
    brand: null
  },
  (subscribe, child) => (
    <context-consumer subscribe={subscribe} renderer={child} />
  )
);
