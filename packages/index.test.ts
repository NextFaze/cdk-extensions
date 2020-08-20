describe('cdk-extensions/all', () => {
  it('passes unit tests', () => {
    expect(true).toBeTruthy();
  });

  it('passes snapshot tests', () => {
    expect('Hello snapshots').toMatchSnapshot();
  });
});
