# Origami Odyssey
[Live Application Link](https://origamiodyssey.herokuapp.com/)

![image](https://user-images.githubusercontent.com/14950033/121980574-29fb0700-cd5a-11eb-99bc-eb4f70376368.png)

This is the source code for my [CS6460](https://omscs.gatech.edu/cs-6460-educational-technology) project, which seeks to teach origami using 3D animations.
See the [proposal PDF](https://github.com/robbwdoering/origamiodyssey/blob/main/CS6460%20Proposal.pdf) for the research that motivates each of the included features. 

This is a React Single Page Application, which uses Three.js and react-three-fiber to render a complex 3D model of a piece of paper.
Redux is used for state management, and the UI is built with Material-UI components.

The origami instructional materials follow a schema that is an extension of the [.fold format](http://erikdemaine.org/papers/FOLD_CGW2016/) from Erik Demaine at MIT, which hopefully makes this easier to integrate or fork into other applications. The extensions are to add a _hierarchical_ list of instructions, where each leaf node in the hierarchy is a change in the rotation of an index edge.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). Access w/ default scripts (start, test, build)
