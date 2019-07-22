import printMe from './print';

const af = () => {
    console.log('Arrow function works!');
}

(function () {
    function component() {

        printMe();
        af();

        const element = document.createElement('div');

        element.innerHTML = 'Hello!';
        element.classList.add('hello');

        return element;

    }

    document.body.appendChild(component());
}())