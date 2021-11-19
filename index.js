const github = require('@actions/github');
const core = require('@actions/core');
const axios = require('axios');

async function run() {

  const issuetypeToLabelInput = core.getInput('issuetype-to-label-map');

  const issuetypeToLabel = {};
  issuetypeToLabelInput.split(',').forEach(mapping => issuetypeToLabel[mapping.split(':')[0]] = mapping.split(':')[1])

  const regex = new RegExp('^[A-Z]+-[0-9]+')
  console.log('issuetype to label mapping: ', issuetypeToLabel)
  const title = github.context.payload.pull_request.title
  core.info('Pull request title: ', title)
  const issuekeyExtraction = regex.exec(title)
  if (issuekeyExtraction) {
    const issuekey = issuekeyExtraction[0]
    console.info(`Found issue key: ${issuekey}`)
    axios({
      method: 'get',
      url: `https://onewelcome.atlassian.net/rest/api/3/issue/${issuekey}?fields=issuetype`,
      auth: {
        username: core.getInput('JIRA_API_USERNAME'),
        password: core.getInput('JIRA_API_TOKEN')
      },
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(function (response) {
      const issuetype = response.data.fields.issuetype.name;
      console.log('Found issuetype:', issuetype);
      console.log('Applying label:', issuetypeToLabel[issuetype])

      const githubToken = core.getInput('GITHUB_TOKEN');
      const octokit = github.getOctokit(githubToken)
      octokit.rest.issues.addLabels({
        owner: github.context.payload.organization.login,
        repo: github.context.payload.repository.name,
        issue_number: github.context.payload.pull_request.number,
        labels: [issuetypeToLabel[issuetype]]
      }).then(function (result) {
        console.log('Result of adding labels:', result)
      })
    }).catch(function (error) {
      if (error.response) {
        console.log(error.response.data);
      } else {
        console.log(error);
      }
    });
  }
}

run()