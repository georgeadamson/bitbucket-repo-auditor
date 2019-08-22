import { BitbucketRepoTreeNode } from '../../utils/types/BitbucketTypes';
export declare class D2AuditResults {
    repo: string;
    branch: string;
    brand: string;
    tree: BitbucketRepoTreeNode[];
    brandDir: any;
    componentWillLoad(): void;
    onTreeChange(): void;
    render(): any;
    getPlatformNode: () => any;
    getBrandNode: () => any;
}
