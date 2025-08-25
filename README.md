# CI EXPLANATION

the ci main workflow handles all the linting and testing of the service:

1. using superlinter action ( to make sure code is up to the industry standard)
2. run coverage tests - to make sure the code has enough quality ( to make sure at least enough from the project code was tested and succefully passed the tests )
3. run tests(including health check)
4. security mesures - we test for token and unwanted secret in the code, including internl urls and exporting the npm audit report( beacuase what i got in the first place and special life cases)
5. release:

 - we detect the updates according to the commit message 
 - if the commit message has fix: for example it will use minor upgrade
 -for patch it will use feat: commit message and for major it will use breaking change
6. build docker image and helm chart - now that we have the release version we are going to update the docker image tag and chart accorsingly adn push the builded artifact to the ghcr repo, if the dokcer image has vulnerabilities in CRITICAL level it will fail
7. DEPLOY - after finishing all the other stage we are going to make sure the current helm chart is working by running test inside a kind doker image wiht the cluster running
 - if the test come successfull than we are going to deploy the app on the requested cluster using the kubeconfig file in the secret of the same in evnrionment defined in github 

#  DEPLOYMENT
- if you wish to deploy this project, for local deployment you can use the example docker-coimpose file in project
- to deploy to develop env, pr to development, if everything ok than the app will be deployed to staging, and if develop is pr to main than deployed to production


# Decisions
- for some of the scripts after i saw they were very long i exported them to be external 
- i had to update the project package lock becuase used with company internal urls which led me doing the urls secuirty check, that by the way can use env as secrets urls for the urls we dont want to share


# IF I HAD MORE TIME
- wil make my workflows more organized
- will upgrade the chart version and app version in helm chart better and upload it ot a real chart repo
- will added more tests and security tests on the cluster before deployment to make sure it will not expose our app
- will use argocd for continous deployment rather thatn the github actions workflow(better reallication for the gitops methodolegy)
