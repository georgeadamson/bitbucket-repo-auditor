import { BitbucketRepoTreeJsonType } from '../../utils/types/BitbucketTypes';
export declare class D2AuditResults {
    brand: string;
    tree: BitbucketRepoTreeJsonType[];
    brandDir: any;
    componentWillLoad(): void;
    onTreeChange(): void;
    render(): any;
    getPlatformNode: () => any;
    getBrandNode: () => any;
}
