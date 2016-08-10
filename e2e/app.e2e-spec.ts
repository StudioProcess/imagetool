import { ImagetoolPage } from './app.po';

describe('imagetool App', function() {
  let page: ImagetoolPage;

  beforeEach(() => {
    page = new ImagetoolPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
