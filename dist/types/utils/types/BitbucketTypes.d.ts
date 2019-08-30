export declare type BitbucketRepoTreeNode = {
    name: string;
    type: BitbucketRepoNodeType;
    contents?: BitbucketRepoTreeNode[];
};
export declare type BitbucketRepoNodeType = 'repository' | 'branch' | 'directory';
