import { getRepoBranchBrands } from './index';

// To keep Typescript happy about our mock global.fetch() method:
declare global {
  namespace NodeJS {
    interface Global {
      fetch: any;
    }
  }
}

const FAKE_BRANCH_NODE = {
  type: 'branch',
  name: 'develop',
  target: { hash: '89a0a51c66e674f1349d6dbae8c91c14ddd43b6f' }
};

const FAKE_UNILEVER_PLATFORM_NODE = {
  type: 'directory',
  name: 'unilever-platform',
  contents: [] as any[]
};

describe('getRepoBranchBrands', () => {
  let apiCallCounter = 0;

  // Set up a mock fetch() method to return expected json:
  beforeAll(function() {
    global.fetch = jest.fn().mockImplementation(() => {
      return new Promise(resolve => {
        // Return a bare minimum fake fetch() response object:
        resolve({
          json: () => {
            switch (++apiCallCounter) {
              case 1:
                // First response is for getRepoBranch()
                return FAKE_BRANCH_NODE;
              case 2:
                // Second response is for the second fetch made by getRepoBranchBrands()
                return [
                  { type: 'directory', contents: [FAKE_UNILEVER_PLATFORM_NODE] }
                ];
            }
          }
        });
      });
    });
  });

  it('should return file tree for repo branch', async () => {
    const json = await getRepoBranchBrands(
      'myProject',
      'myRepo',
      'myBranch',
      true
    );

    expect(json).toHaveProperty('length');
    expect(json[0]).toHaveProperty('name');
    expect(json[0]).toHaveProperty('type', 'directory');
    expect(json[0]).toHaveProperty('contents');
  });
});
