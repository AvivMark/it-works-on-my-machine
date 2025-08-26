# It Works On My Machine

## CI EXPLANATION

The ci main workflow handles all the linting and testing of the service:

### 1. Code Quality

- Using superlinter action (to make sure code is up to the industry standard)

### 2. Testing & Coverage

- Run coverage tests - to make sure the code has enough quality (to make sure at least enough from the project code was tested and successfully passed the tests)
- Run tests (including health check)

### 3. Security Measures

- We test for token and unwanted secret in the code, including internal urls and exporting the npm audit report (because what i got in the first place and special life cases)

### 4. Release Process

- We detect the updates according to the commit message
- If the commit message has `fix:` for example it will use minor upgrade
- For patch it will use `feat:` commit message and for major it will use breaking change
- For major it will use `BRAKING CHANGE:` commit message 


### 5. Build & Package

- Build docker image and helm chart - now that we have the release version we are going to update the docker image tag and chart accordingly and push the builded artifact to the ghcr repo, if the docker image has vulnerabilities in CRITICAL level it will fail

### 6. Deploy

- DEPLOY - after finishing all the other stage we are going to make sure the current helm chart is working by running test inside a kind docker image with the cluster running
- If the test come successful than we are going to deploy the app on the requested cluster using the kubeconfig file in the secret of the same in environment defined in github

## DEPLOYMENT

- If you wish to deploy this project, for local deployment you can use the example docker-compose file in project
- To deploy to develop env, pr to development, if everything ok than the app will be deployed to staging, and if develop is pr to main than deployed to production

## Decisions

- For some of the scripts after i saw they were very long i exported them to be external
- I had to update the project package lock because used with company internal urls which led me doing the urls security check, that by the way can use env as secrets urls for the urls we dont want to share

## IF I HAD MORE TIME

- Will make my workflows more organized
- Will upgrade the chart version and app version in helm chart better and upload it to a real chart repo
- Will added more tests and security tests on the cluster before deployment to make sure it will not expose our app
- Will use argocd for continuous deployment rather than the github actions workflow (better replication for the gitops methodology)
- Will add the use of network policies for better security
- Becuase i used s3 connection, i would like to add cicd tests using pulumi for that s3 resource
- will add monitoring  metrics in the project
- templating the dockerfile and check him too( missing checks)
- permmission handling - only specific people can push to main and deploy
- raise envs for pr - for each pr if workflow is complete to mkae sure it will push from develop to main by itself
- adding notifications
- adding rollout strategies
