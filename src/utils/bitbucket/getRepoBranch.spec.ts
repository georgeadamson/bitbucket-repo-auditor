import { getRepoBranch } from './index';

// For sample response, see:
// https://bitbucket.org/!api/2.0/repositories/d2_website_repositories/axe/refs/branches/develop

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

describe('getRepoBranch', () => {
  beforeAll(function() {
    global.fetch = jest.fn().mockImplementation(() => {
      return new Promise(resolve => {
        // Return a bare minimum fake fetch() response object:
        resolve({ json: () => FAKE_BRANCH_NODE });
      });
    });
  });

  it('should return branch json', async () => {
    const json = await getRepoBranch('myProject', 'myRepo', 'myBranch');

    expect(json).toHaveProperty('type');
    expect(json).toHaveProperty('name');
    expect(json).toHaveProperty('target');
  });
});
