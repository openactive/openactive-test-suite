# CI Workflows
This project contains three GitHub Action workflows that are performed following various triggers. For more information on Github Actions see [here](https://docs.github.com/en/actions).

## reference-implementation.yml
This is the largest and most complicated workflow in the project. 

This workflow is triggered when there is a push or a pull request to the master branch. This is indicated by:
```yml
on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]
```
This workflow defines two jobs: **tests** and **deploy-output**.

### tests job
This job runs Test Suite tests on this branch against Reference Implementation (which branch is elaborated below).

#### Setup
- **runs-on: ubuntu-latest**: This specifies that the job will run on an Ubuntu-based virtual machine.

- **strategy**: This section defines a matrix strategy for running tests with different combinations of parameters, allowing for parallel test runs with various configurations. The matrix is defined with the following parameters:

  - **mode**: Can be either "random" or "controlled." For more information on random and controlled mode, see [here](packages/openactive-integration-tests/README.md).
  - **profile**: Represents different test profiles. These profiles test different Test Suite configurations as some config values can be contradictory and there impossible to test in one go. These different configurations can be found in `/config/.example.{profile}.json`.
  - **flow**: Can be either "simple" or "approval." This represents the two different booking flows. More information about booking flows can be found [here](https://openactive.io/open-booking-api/EditorsDraft/#booking-flows).

  Additionally, the include section specifies two specific combinations to run:
  - mode: "random" profile: "all-features" flow: "both"
  - mode: "controlled" Profile: "all-features" flow: "both"

- **concurrency**: This section manages concurrent runs of the workflow to avoid conflicts. It uses a group identifier that includes dynamic information like the GitHub branch and matrix parameters, ensuring that workflows with the same parameters don't run simultaneously (`cancel-in-progress: true` cancels overlapping workflows).

#### Steps
- **Checkout OpenActive Test Suite**: This step checks out the OpenActive Test Suite code repository and places it in a directory named "tests."

- **Use matching coverage/ branch***: If the workflow was triggered by a push to a branch starting with "coverage/", this step sets an output variable `mirror_ref` to the GitHub branch reference.

- **Checkout OpenActive.Server.NET**: This step checks out the Reference Implementation in OpenActive.Server.NET and places it in a directory named "server".

- **Setup .NET Core SDK and Node.js**: These steps set up the required versions of .NET Core SDK (3.1.419) and Node.js (18.17.1).

- **Install OpenActive.Server.NET dependencies**: This step installs the dependencies of the "OpenActive.Server.NET" project.

- **Build and start .NET Core Authentication Authority Reference Implementation**: This step builds and start the Reference Implementation Authentication server

- **Build and Start .NET Core Reference Implementations**:  This step builds and start the Reference Implementation.

- **Install OpenActive Test Suite**: This step installs dependencies for the OpenActive Test Suite by running npm install in the "tests" directory.

- **Run OpenActive Integration Tests**: This step runs integration tests using npm start in the "tests" directory. It sets various environment variables based on the matrix parameters to control test behavior.

- **Upload test output as artifact**: After the tests are run, this step uploads the test output (located in the "./tests/output/" directory) as an artifact. Artifacts are used for storing and sharing files generated during the workflow.

### deploy-output job
This job deploys the test output to Github Pages. This output can then be downloaded and examined to see specific test results.

#### Setup
- **needs: `tests`**: This line indicates that this job depends on the successful completion of the `tests` job.

- **if: `${{ github.ref == 'refs/heads/master' }}`**: This conditional statement specifies that the `deploy-output` job will run only when changes are pushed or pull requests are made to the `master` branch.
`
- **runs-on: ubuntu-latest**: Like the `tests` job, this specifies that the job will run on an Ubuntu-based virtual machine.

#### Steps

- **Checkout OpenActive Test Suite**: This step checks out the Test Suite code repository and places it in a directory named "tests".

- **Download test output for Random Mode and Controlled Mode**: These steps use the `actions/download-artifact` action to download test output artifacts from the tests job. There are two separate steps for downloading artifacts corresponding to "Random Mode" and "Controlled Mode". These artifacts are placed in specific directories.

- **Deploy test output to GitHub Pages**: This is the core step of the job. It uses the `peaceiris/actions-gh-pages` action to deploy the test output to GitHub Pages. The key parameters are:

  - **github_token**: This is the GitHub token needed for publishing to GitHub Pages.
  - **publish_dir**: Specifies the directory containing the content to be published to GitHub Pages. 
  - **force_orphan**: When set to true, this allows you to make your publish branch with only the latest commit.
  - **enable_jekyll**: If true, it indicates that the Github Pages are processed with the static site generator Jekyll.


## code-tests.yml
This is simple Github Actions workflow that runs the code tests.

This workflow is triggered when there is a push or a pull request to the master branch. This is indicated by:
```yml
on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]
```
This workflow defines one job: **build**.

### build job

#### Setup
- **runs-on: ubuntu-latest**: This specifies that the job will run on an Ubuntu-based virtual machine.

#### Steps
- **Checkout OpenActive Test Suite**: This step checks out the OpenActive Test Suite code repository.

- **Setup Node.js 18.17.1**: This step sets up Node.js version 18.17.1 in the job's environment.

- **Install OpenActive Test Suite**: This step runs `npm install` to install the dependencies of the OpenActive Test Suite.

- **Run Checks on the Code (Test the Tests!)**: This is the main step of this job. This step runs `npm test` to execute the unit tests for the OpenActive Test Suite. The command that is executed is:
  ```
  npm run test-broker && npm run test-interface-criteria && npm run test-openid-client && npm run test-tests
  ```
  This runs the unit of all of the packages within Test Suite.

## create-data-model-pr.yaml

This workflow updates Test Suite's OA dependencies if there has been a change in one of the projects. This therefore keeps Test Suite up-to-date with the rest of the OA ecosystem.

This workflow can be triggered in two ways:

- **workflow_dispatch**: This allows you to manually trigger the workflow through the GitHub Actions UI.

- **repository_dispatch**: This allows the workflow to be triggered when a custom repository dispatch event is sent. It listens for dispatch events from three OA repos, specifically when they are updated: `data-models-update`, `data-model-validator-update`, and `rpde-validator-update`. 

This workflow defines one job: **generate**.

### generate job
#### Setup
- **runs-on: ubuntu-latest**: This specifies that the job will run on an Ubuntu-based virtual machine.

#### Steps
- **Checkout**: This step uses the actions/checkout action to clone the repository. It checks out the master branch and places the repository in a directory named "openactive-test-suite."

- **Setup Node.js 18.17.1**: This step uses the actions/setup-node action to set up Node.js version 18.17.1 in the job's environment. This is necessary because Node.js is required for managing JavaScript dependencies.

- **Update openactive-integration-tests with latest data-models and validators**: This step runs npm install to update the openactive-data-models and data-model-validator dependencies to their latest versions. It targets the openactive-integration-tests package within the repository.

- **Update openactive-broker-microservice with latest data-models and validators**: Similar to the previous step, this updates dependencies for the openactive-broker-microservice package, including openactive-data-models, data-model-validator, and rpde-validator.

- **Create Pull Request**: This step uses the peter-evans/create-pull-request action to create a pull request. It performs several actions which are relatively self explanatory:

  - Sets up the access token needed for making changes to the repository.
  - Specifies the path to the repository containing the changes.
  - Defines a commit message, committer, author, branch name, and other PR-related details.
  - Provides a title and body for the pull request, explaining the purpose of the update.
  - Adds labels to the pull request (`automated pr`).
  - Marks the pull request as not a draft.
  
- **Check outputs** prints information about the created pull request, including the pull request number and URL, to the console.
