# Bugs - A simulated ecosystem

This is an exploration of a simulated ecosystem with two teams contesting for supremacy.

This simulation uses one algorithm called "quadtree" that allows an efficient calculation of close neighboor. As a result, an efficient computation of interactions between many thousands of entities ("bugs") is possible. To display those entities quickly on the screen, the power of the graphic processing unit is put to contribution via webgl.

Visit the online version here: https://nicolasohe.github.io/bugs/

## Start locally

Node.js is required for development.
I use Parcel as a package bundler and development platform. You are free to configure your favorite tool for development.

After having cloned the project locally with git,
navigate in your terminal to the folder of the project and run the following command:

```sh
npm start
```

Your default browser should then open the application.
If not, follow the instructions displayed in the terminal.

## Packages and libraries

This app only relies on the technologies available in contemporary (2020) browsers (canvas, webgl, execution of JavaScript).

All custom tools are included in the project (see src/tools/).

## Thoughts

I am fascinated by the intelligence and strategies that can emerge from very simple sets of rules that autonomous agents follow.
