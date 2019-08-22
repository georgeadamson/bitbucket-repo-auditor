import { h } from '@stencil/core';
import { createProviderConsumer } from '@stencil/state-tunnel';

export interface IRepoState {
  repo: string;
  branch: string;
  brand: string;
}

export default createProviderConsumer<IRepoState>(
  {
    repo: null,
    branch: null,
    brand: null
  },
  (subscribe, child) => (
    <context-consumer subscribe={subscribe} renderer={child} />
  )
);
