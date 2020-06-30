# Bugs - A simulated ecosystem 🐞🐛🐝

This is an exploration of a simulated ecosystem with two teams contesting for supremacy.

I am fascinated by the intelligence and strategies that can emerge from very simple sets of rules that autonomous agents follow.

Visit the online version here: https://nicolasohe.github.io/Bugs/

## Start locally

Node.js and the package manager npm are required for development.

After having cloned the project locally with git,
navigate in your terminal to the folder of the project and run the following commands:

```sh
npm install
npm start
```

Your default browser should then open the application.
If not, follow the instructions displayed in the terminal.

## Tools

This app relies on technologies available in contemporary browsers (Canvas, WebGL, JavaScript).

One algorithm called "quadtree" allows an efficient calculation of close neighboor. As a result, an efficient computation of interactions between thousands of entities ("bugs") is possible.

To display those entities quickly on the screen, the power of the graphic processing unit is put to contribution via WebGL.
