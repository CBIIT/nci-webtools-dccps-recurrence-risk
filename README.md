# nci-webtools-dccps-recurrence-risk

This web application has been developed to estimate the risk of progressing to distant recurrence using disease-specific survival typically provided by cancer registries. The disease-specific survival is assessed via cause-specific survival using SEER*Stat software. The cause-specific survival is assumed to follow a mixture-cure model and the risk of recurrence is inferred from the survival among the non-cured fraction. The cure fraction and parametric survival distribution among those not cured are estimated using CanSurv software. The current version can handle Weibull and log-logistic distributions for the non-cured survival.

## Developent Setup

The R Project for Statistical Computing is required to be installed since the application interfaces with R functions.

The application is divided in to two components; UI and API. The UI is built on Angular 6 and the API is an Express.js REST based backend.

### Installation

```
git clone https://github.com/CBIIT/nci-webtools-dccps-recurrence-risk.git

cd nci-webtools-dccps-recurrence-risk

npm install
cd api
npm install
cd ../ui
npm install
```

### Build UI

build-dev command will build the UI for debugging in to the UI distribution folder:
 
 ui/dist/recurrence-risk-tool-ui

build-prod command will build the UI for production usage and is used for deployment to all the servers.

```
cd ui
npm run build-dev
npm run build-prod
```

### Build API

The server is an Express.js application and does not need to be built. It can be started using the npm start command.
The server needs the following folders/symbolic links to be present within the base api folder.

./data           --> input and ouput files  
./data/staging   --> input async processing files  
./logs           --> log files  
./public         --> points to the built UI for e.g. ui/dist/recurrence-risk-tool-ui  

```
cd api
npm start
```

### Test API/UI

```
cd api
npm test

cd ui
npm test
```
