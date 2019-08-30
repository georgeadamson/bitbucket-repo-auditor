import { BitbucketRepoTreeNode } from '../../utils/bitbucket';
export declare class D2AuditResults {
    project: string;
    repo: string;
    branch: string;
    brand: string;
    tree: BitbucketRepoTreeNode[];
    brandDir: any;
    isLocalhost: boolean;
    repoChanged(): void;
    brandChanged(): Promise<void>;
    treeChanged(): void;
    private table;
    componentWillLoad(): void;
    render(): any;
}
