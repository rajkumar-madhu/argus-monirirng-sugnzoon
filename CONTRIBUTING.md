# Contributing Guidelines

Thank you for your interest in contributing to Argus! This project is a community fork of MIT-licensed SigNoz code; original SigNoz copyright is retained in `LICENSE`. Argus is not affiliated with SigNoz Inc.

## How can I contribute?

### Finding Issues to Work On
- Check [open issues](https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/issues?q=is%3Aopen+is%3Aissue)
- Look for [good first issues](https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
- Review [recently closed issues](https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/issues?q=is%3Aissue+is%3Aclosed) to avoid duplicates

### Types of Contributions

1. **Report Bugs**: Use the [Bug Report template](https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/issues/new?assignees=&labels=&template=bug_report.md&title=)
2. **Request Features**: Submit using [Feature Request template](https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/issues/new?assignees=&labels=&template=feature_request.md&title=)
3. **Improve Documentation**: Create an issue with the `documentation` label
4. **Report Performance Issues**: Use the [Performance Issue template](https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/issues/new?assignees=&labels=&template=performance-issue-report.md&title=)
5. **Request Dashboards**: Submit using [Dashboard Request template](https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/issues/new?assignees=&labels=dashboard-template&projects=&template=request_dashboard.md&title=%5BDashboard+Request%5D+)
6. **Report Security Issues**: Follow our [Security Policy](https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/security/policy)
7. **Join Discussions**: Participate in [project discussions](https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/discussions)

### Creating Helpful Issues

When creating issues, include:

- **For Feature Requests**:
  - Clear use case and requirements
  - Proposed solution or improvement
  - Any open questions or considerations

- **For Bug Reports**:
  - Step-by-step reproduction steps
  - Version information
  - Relevant environment details
  - Any modifications you've made
  - Expected vs actual behavior

### Submitting Pull Requests

1. **Development**:
   - Setup your [development environment](docs/contributing/development.md)
   - Work against the latest `main` branch
   - Focus on specific changes
   - Ensure all tests pass locally
   - Follow our [commit convention](#commit-convention)

2. **Submit PR**:
   - Ensure your branch can be auto-merged
   - Address any CI failures
   - Respond to review comments promptly

For substantial changes, please split your contribution into multiple PRs:

1. First PR: Overall structure (README, configurations, interfaces)
2. Second PR: Core implementation (split further if needed)
3. Final PR: Documentation updates and end-to-end tests

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). All commits and PRs should include type specifiers (e.g., `feat:`, `fix:`, `docs:`, etc.).

## Upstream SigNoz repositories

Argus retains compatibility with upstream SigNoz collector and schema contracts. Related **upstream** projects (not maintained in this fork) include:

- [signoz-otel-collector](https://github.com/SigNoz/signoz-otel-collector)
- [dashboards](https://github.com/SigNoz/dashboards)

Do not confuse those with Argus first-party branding — see [docs/ARGUS.md](docs/ARGUS.md).

## How can I get help?

- Open a [GitHub Discussion](https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/discussions) or issue
- Read [docs/ARGUS.md](docs/ARGUS.md) for fork-specific conventions

## Where do I go from here?

- Set up your [development environment](docs/contributing/development.md)
- Read the [Argus fork guide](docs/ARGUS.md)
- Write [integration tests](docs/contributing/go/integration.md)
