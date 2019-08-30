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
    project: null,
    repo: null,
    branch: null,
    brand: null
  },
  (subscribe, child) => (
    <context-consumer subscribe={subscribe} renderer={child} />
  )
);
