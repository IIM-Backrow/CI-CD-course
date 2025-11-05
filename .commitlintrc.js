module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Allowed types; adjust to project conventions if needed
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore', 'build', 'ci', 'revert'
    ]],
    // Disallow sentence/Start/Upper case subjects
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']]
  }
};
