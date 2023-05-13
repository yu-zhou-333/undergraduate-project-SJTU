#### Run in production mode

If you don't have a need to debugging and don't want to install too many packages, you could choose to run frontend in production mode. You will need npm/yarn and a server to run frontend in production mode.

To install a server:

``````  
yarn global add serve
``````

A production build of the frontend is available [here](./resources). To run this build:

``` 
serve -s frontend-build
```

The page will be displayed at localhost:3000 by default. If you wish to use the above build, please make sure the backend is activated at localhost:7777.