# Origami Odyssey
This is the source code for my CS6460 project, which seeks to teach origami using 3D animations.
See [proposal PDF](https://github.com/robbwdoering/origamiodyssey/blob/main/CS6460%20Proposal.pdf) for underlying research.

This is a React Single Page Application, which uses Three.js and react-tree-fiber to render a complex 3D model of a piece of paper.
Redux is used for state management, and the UI is built with Material-UI components.

The origami instructional materials follow a schema that is an extension of the [.fold format](http://erikdemaine.org/papers/FOLD_CGW2016/) from Erik Demaine at MIT, which hopefully makes this easier to integrate or fork into other applications. The extensions are to add a _hierarchical_ list of instructions, where each leaf node in the hierarchy is a change in the rotation of an index edge.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). Access w/ default scripts (start, test, build)
