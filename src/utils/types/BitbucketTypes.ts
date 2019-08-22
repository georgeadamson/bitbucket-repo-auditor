export type BitbucketRepoTreeNode = {
  name: string;
  type: string;
  contents: any[]; //BitbucketRepoTreeNode[];
};

export type BitbucketRepoNodeType = 'repository' | 'branch' | 'directory';
