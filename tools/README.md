# MIDI-TEST INSTRUCTIONS

Midi-test.js is a file containing black box tests for the functionality of the application. This tests send midi signals emulating the launchpad input, to create changes in the scenes, this changes are also reflected in the rendering.
The tests have no assertions, meaning that the person running the tests have to ensure that the triggered functionality worked by checking the changes in the launchpad render.
 The tests could have assertions if there is a midi input the received the sequence created previously, it would also need the simulation of a midi clock in order to run. That point is a __nice to have__ for the future.

## How to launch this tests?

1. Before starting Octaedre, first make sure that the configuration has TEST_MODE value set to 1.
2. Run the application

```
npm start
```

3. Run the test

```
node midi-test.js
```

4. Follow the logs and make sure that every log is correct.

## Chaos test

The test follow Chaos engineering phylosophy, trying to force unexpected situations in order to force resilnece building. Results so far are very good, the random behaviour does not create any exception, meaning that the application is ready for unexpected behaviour. Nonetheless, more chaotic tests should be added to test the network connectivity. 

### Additional notes

Since the __midi__ npm package has been compiled with the version used by Electron, it is not possible to run the midi-test.js inside this npm project. In order to run, the best way is to create a different npm project, copy the file, install the __easymidi__ dependency and run it. **Dont forget to run the tests after starting the application.**
