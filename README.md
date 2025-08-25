# CI EXPLANATION

the ci main workflow handles all the linting and testing of the service:

1. using superlinter action
2. run coverage tests - to make sure the code has enough quality
3. run tests(including healtgh check)
4. security mesures - we test for token and unwanted secret in the code, including internl urls and exporting the npm audit report
5. release:

 - we detect the updates according to the commit message 
 - if the commit message has fix: for example it will use minor upgrade
 -for patch it will use feat: commit message and for major it will use breaking change
6. build docker image and helm chart - now that we have the release version we are going to update the docker image tag and chart accorsingly adn push the builded artifact to the ghcr repo, if the dokcer image has vulnerabilities in CRITICAL level it will fail
7. DEPLOY - after finishing all the other stage we are going to make sure the current helm chart is working by running test inside a kind doker image wiht the cluster running
 - if the test come successfull than we are going to deploy the app on the requested cluster using the kubeconfig file in the secret of the same in evnrionment defined in github 