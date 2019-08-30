import getRepoBranch from './getRepoBranch';
import findNode from './findNode';

export default async function getRepoBranchBrands(
  project: string,
  repo: string,
  branch: string,
  fromStaticFile: boolean = false
) {
  let json;
  console.groupCollapsed('getRepoBranchBrands', project, repo, branch);

  if (fromStaticFile) {
    // When running on localhost:
    const module = await import('../../components/d2-audit/repo-tree.axe.json');
    json = module.default;
  } else {
    // First we need the unique hash for the branch's file tree:
    const branchJson = await getRepoBranch(project, repo, branch);
    const hash = branchJson.target.hash;

    let url = `https://bitbucket.org/!api/internal/repositories/${project}/${repo}/tree/${hash}/?no_size=1`;

    const response = await fetch(url, { credentials: 'include' });
    json = await response.json();
  }

  console.log(json);
  console.groupEnd();

  try {
    return findNode(json, 'unilever-platform/app', 'directory').contents;
  } catch (err) {
    console.error('Error in getRepoBranchBrands:', err, json);
    return [];
  }
}
