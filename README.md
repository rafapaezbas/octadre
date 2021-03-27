```
 ______     ______     ______   ______     ______     _____     ______     ______ 
/\  __ \   /\  ___\   /\__  _\ /\  __ \   /\  ___\   /\  __-.  /\  == \   /\  ___\ 
\ \ \/\ \  \ \ \____  \/_/\ \/ \ \  __ \  \ \  __\   \ \ \/\ \ \ \  __<   \ \  __\ 
 \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_____\  \ \____-  \ \_\ \_\  \ \_____\ 
  \/_____/   \/_____/     \/_/   \/_/\/_/   \/_____/   \/____/   \/_/ /_/   \/_____/ 
```

### Distribution
[Linux](placeholder)
[OSX](placeholder)
[Windows](placeholder)

### Build
* Node version must be 10 or higher.
* For Linux install libasound2 and libasound2-dev
```
apt-get install libasound2 libasound2-dev
```
* Run:
```
npm install -g node-gyp
npm install
npm install --save-dev electron-rebuild 
./node_modules/.bin/electron-rebuild midi
npm run-script dist
```
* Have a look a this [build logs](https://www.travis-ci.com/github/rafapaezbas/octaedre/), can be useful for building locally.

### License
This project is distributed under the GNU General Public License v3.0. This is free software. ["Free as in freedom, not free as in free beer".](https://en.wikipedia.org/wiki/Gratis_versus_libre#.22Free_beer.22_vs_.22free_speech.22_distinction)

### Documentation
Octaedre has been design with approachability in our heads, we have tried to create the most intuitive/easy interface for music sequencing. We recommend to start using it without reading any documentation, just plug your Novation Launchpad, open Octaedre, configure the midi clock input and midi output, press some buttons and see the magic happen!
Under this first layer, Octaedre has also some advance features very worthy to know. Triplets, polyrythms or melody sequencing are all possible. Checkout the official [Octaedre user manual.]()

### Contributing
Do you have new and interesting ideas for Octaedre? Or maybe you found a bug? Or would you like to contribute in another way? Feel free to use https://github.com/rafapaezbas/octaedre/issues in order to communicate with us. We are looking forward to know how you would improve this project.
