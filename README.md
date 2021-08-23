# Origami Odyssey
[Link to Application](https://origamiodyssey.herokuapp.com/)

![image](https://user-images.githubusercontent.com/14950033/121980574-29fb0700-cd5a-11eb-99bc-eb4f70376368.png)

This app can teach you [origami](https://en.wikipedia.org/wiki/Origami), the art of folding paper, using a completly new method: 3D simulations. It can display a simulated peice of paper inside a normal web browser, and then allow users to step through the instructions for making a model; they can go backwards or forwards, replay hard steps in a loop when they get stuck, and rotate the model freely in space. Currently there are 5 models available: a heart, a butterfly, a lily, a boat, and the traditional origami crane.

This project was conceptualized as part of Georgia Tech's fantastic [CS6460: Educational Technology](https://omscs.gatech.edu/cs-6460-educational-technology) course, which guides students through research on individual projects. See the [proposal PDF](https://github.com/robbwdoering/origamiodyssey/blob/main/CS6460%20Proposal.pdf) for the research that motivates each of the included features of this application. The research is fundamentally based upon this quote on human problem solving from famous cognitive psychologists [Herbert Simon](https://en.wikipedia.org/wiki/Herbert_A._Simon) and [Allen Newell](https://en.wikipedia.org/wiki/Allen_Newell), from which I also took the name of the app:

> "The problem solver’s search for a solution is an odyssey through the problem space, from one knowledge state to another, until… [they] know the answer." [Simon & Newell (1971)](https://psycnet.apa.org/record/1971-24266-001)

In this case the answer is a high quality origami model, and the problem space is, for the first time, simulated.

## Technical Details
This is a React Single Page Application, which uses Three.js and react-three-fiber to render a complex 3D model of a piece of paper. Redux is used for state management, and the UI is built with Material-UI components.

The paper is represented as 3 arrays: vertices (coordinates), edges (two vertices), and faces (3+ vertices). Instructions define what lines to fold the paper along and how far to fold it, and [the app does the rest](https://github.com/robbwdoering/origamiodyssey/blob/main/client/src/anim/Paper.js#L501-L756), placing the vertices and animating smoothly between steps.

The origami instructional materials follow a schema that is an extension of the [.fold format](http://erikdemaine.org/papers/FOLD_CGW2016/) from Erik Demaine at MIT, which hopefully makes this easier to integrate or fork into other applications. The extensions are to add a _hierarchical_ list of instructions, where each leaf node in the hierarchy is a change in the rotation of an indexed edge.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). Access w/ default scripts (start, test, build)
