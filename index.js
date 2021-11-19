const github = require('@actions/github');
const core = require('@actions/core');
const axios = require('axios');

async function run() {

  const issuetypeToLabelInput = core.getInput('issuetype-to-label');

  const issuetypeToLabel = {};
  issuetypeToLabelInput.split(',').forEach(mapping => issuetypeToLabel[mapping.split(':')[0]] = mapping.split(':')[1])

  const regex = new RegExp('^[A-Z]+-[0-9]+')
  console.log('github.context.payload.pull_request', github.context.payload.pull_request._links.self.href)
  const title = "SAAS-609 asdas"
      // github.context.payload &&
      // github.context.payload.pull_request &&
      // github.context.payload.pull_request.title
  core.info(title)
  const issuekeyExtraction = regex.exec(title)
  if (issuekeyExtraction) {
    const issuekey = issuekeyExtraction[0]
    console.info(`Found issue key: ${issuekey}`)
    axios({
      method: 'get',
      url: `https://onewelcome.atlassian.net/rest/api/3/issue/${issuekey}?fields=issuetype`,
      auth: {
        username: process.env.JIRA_API_USERNAME,
        password: process.env.JIRA_API_TOKEN
      },
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(function (response) {
      console.log(response.data);
      const issuetype = response.data.fields.issuetype.name;
      console.log(issuetype)
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