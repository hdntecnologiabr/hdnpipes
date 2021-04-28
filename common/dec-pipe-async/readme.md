#DecPipeAsync

Função para criação de pipeline de execução asyncrono. Um pipeline pode ser descrito como um encadeamento de operações onde o resultado da função anterior serve de entrada para a função posterior

*entrada->funcao1->funcao2->saida*

##Exemplo

```
const { pipe } = require('hdnpipes/common/dec-pipe-async')

const addOne = ctx => ctx + 1
const addTwo = ctx => ctx + 2
const onError = (err, ctx) => console.error(err)

const result = pipe()
    .error(onError)
    .add(addOne)
    .add(addTwo)
    .run(0)

console.log('Result = ',result)

--> Result = 3

```