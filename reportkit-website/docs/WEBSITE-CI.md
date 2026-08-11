# Website CI pipeline (apply to `.github/workflows/quality.yml`)

The agent environment cannot push workflow file changes without GitHub `workflow` scope.
Run locally after `gh auth refresh -s workflow`:

```bash
cp reportkit-website/docs/website-ci.workflow.yml ../.github/workflows/quality.yml
git add .github/workflows/quality.yml
git commit -m "ci: unified website pipeline (build, e2e, worker, lighthouse)"
git push origin main
```

Or paste the YAML from `website-ci.workflow.yml` into the GitHub Actions UI.
