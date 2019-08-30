export type BitbucketRepoTreeNode = {
  name: string;
  type: BitbucketRepoNodeType;
  //values?: BitbucketRepoTreeNode[]; //BitbucketRepoTreeNode[];
  contents?: BitbucketRepoTreeNode[]; //BitbucketRepoTreeNode[];
};

export type BitbucketRepoNodeType = 'repository' | 'branch' | 'directory';
