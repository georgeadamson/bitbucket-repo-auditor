import { BitbucketRepoTreeJsonType } from '../../utils/types/BitbucketTypes';
export declare class D2Audit {
    brand: string;
    treeUrl: string;
    repo: string;
    branch: string;
    isBitbucket: boolean;
    isValidRepo: boolean;
    tree: BitbucketRepoTreeJsonType[];
    componentWillLoad(): Promise<unknown>;
    render(): any;
    getAppFolder: () => any;
    getProjectNode: () => any;
}
