import { NetcamStudioPage } from './app.po';

describe('netcam-studio App', function() {
  let page: NetcamStudioPage;

  beforeEach(() => {
    page = new NetcamStudioPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
