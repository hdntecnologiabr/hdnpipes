# hdnpipes

Biblioteca de funções para projetos que utilizam pipelines

## authentication

As funções de authentication servem para validar o usuário.

### | -> google-captcha

Serve para validar o captcha V3 quando o usuário realiza o login.

Parâmetro       | Default     | Descrição |
:--------------:|:-----------:|:----------|
captchaToken    |defaultCaptchaTokenFn|Passa o captcha|
fail            |defaultFailFn|Se ocorrer algum erro retorna um INVALID_CAPTCHA|
success |defaultSuccessFn|Se ocorrer tudo certo ele irá retornar o ctx|


### | -> jwt

Parâmetro       | Default     | Descrição |
:--------------:|:-----------:|:----------|
payload         |({})||
secret        |process.env.AUTHENTICATION_JWT_SECRET ou defaultSecret||
hoursToExpire |process.env.AUTHENTICATION_JWT_HOURS_TO_EXPIRE ou defaultHoursToExpire||
success | ({ token, ctx }) | |
fail | throw err | |

## common

As funções do common servem para tratar os dados ao longo dos pipes.

### | -> condition

Serve para passar uma condição a ser tratada.

Parâmetro       | Default     | Descrição |
:--------------:|:-----------:|:----------|
condition       |true         |           |
isTrue          |ctx          |           |
isFalse         |ctx          |           |

### | -> fields validate

Serve para passar os dados da requisição em específico.

Parâmetro       | Default     | Descrição |
:--------------:|:-----------:|:----------|
schema       |({})         |           |
data          |({})          |           |
validationFail         |({ errors, ctx })          |           |
fail   |{throw err }|    |

### | -> foreach

Parâmetro       | Default     | Descrição |
:--------------:|:-----------:|:----------|
collection       |[]         |           |
exec          |{}          |           |
fail         |{ throw err }          |           |

### | -> map

Parâmetro       | Default     | Descrição |
:--------------:|:-----------:|:----------|
mapfn           |             |           |

### | -> match

Parâmetro       | Default     | Descrição |
:--------------:|:-----------:|:----------|
defaultFn       |ctx          |           |
matchings       |[]           |           |
fail            | { throw err } |           |

### | -> parallel

Parâmetro       | Default     | Descrição |
:--------------:|:-----------:|:----------|
functions       |[]         |           |
success          | ({ result, ctx }) |           |
fail         | throw ctx          |           |

### | -> pipe async

Parâmetro       | Default       | Descrição |
:--------------:|:-------------:|:----------|
functions       |[]             |           |
fail            | { throw err } |           |

### | -> tap

Parâmetro       | Default     | Descrição |
:--------------:|:-----------:|:----------|
tapfn           |             |           |

### | -> validate

Parâmetro       | Default       | Descrição |
:--------------:|:-------------:|:----------|
validation      |true           |           |
fail            |ctx            |           |

## comunication -> email

Funções que envolvem o envio de e-mail

### | -> sendgrid

Parâmetro       | Default     | Descrição |
:--------------:|:-----------:|:----------|
receivers       |defaultReceiversFn|           |
subject         |defaultSubjectFn|           |
text            |defaultTextFn|           |
html            |defaultHtmlFn|           |
attachments     |defaultAttachmentsFn|           |
senderName      |defaultNameFn|           |
senderEmail     |defaultEmailFn|           |
success         |defaultSuccessFn|           |
fail            |defaultFailFn|           |

## database

Funções que envolvem as operações do banco de dados.

### | -> add

Adiciona um elemento ao banco de dados.

Parâmetro       | Default       | Descrição |
:--------------:|:-------------:|:----------|
collection      |defaultCollectionFn|           |
data            |defaultDataFn|                 |
success         |defaultSuccessFn|              |
fail            |defaultFailFn|           |
transaction     |defaultTransactionFn|        |

### | -> set

Atualiza um elemento do banco de dados a partir do seu id.

Parâmetro       | Default       | Descrição |
:--------------:|:-------------:|:----------|
collection      |defaultCollectionFn|           |
doc             |defaultDocFn|                  |
data            |defaultDataFn|                 |
success         |defaultSuccessFn|              |
fail            |defaultFailFn|           |
transaction     |defaultTransactionFn|        |

### | -> get

Recupera um elemento do banco de dados a partir do seu id.

Parâmetro       | Default       | Descrição |
:--------------:|:-------------:|:----------|
collection      |defaultCollectionFn|           |
doc             |defaultDocFn|                  |
success         |defaultSuccessFn|              |
fail            |defaultFailFn|           |
transaction     |defaultTransactionFn|        |

### | -> find

Recupera um conjunto de elementos do banco de dados a partir de uma condição.

Parâmetro       | Default       | Descrição |
:--------------:|:-------------:|:----------|
collection      |defaultCollectionFn|           |
where           |[]             |               |
success         |defaultSuccessFn|              |
fail            |defaultFailFn|           |
transaction     |defaultTransactionFn|        |
offset          |defaultOffset|              |
limit           |defaultLimit|               |
orderBy         |defaultOrderBy|             |

### | -> delete

Exclui um elemento do banco de dados a partir do seu id.

Parâmetro       | Default       | Descrição |
:--------------:|:-------------:|:----------|
collection      |defaultCollectionFn|           |
doc             |defaultDocFn|                  |
success         |defaultSuccessFn|              |
fail            |defaultFailFn|           |
transaction     |defaultTransactionFn|        |

### | -> transaction

Serve para alocar um conjunto de funções para serem executadas paralelamente.

Parâmetro       | Default       | Descrição |
:--------------:|:-------------:|:----------|
functions       |[]             |           |
fail            |defaultFailFn  |           |

## gc storage

Funções da Google Cloud que envolvem as operações do banco de dados.

### | -> get

Recupera um elemento do banco de dados a partir do seu id.

Parâmetro       | Default       | Descrição |
:--------------:|:-------------:|:----------|
filePath      |defaultfilePathFn|           |
success         |defaultSuccessFn|              |
fail            |defaultFailFn|           |
expiresInTimestamp     |defaultexpiresInTimestampFn|        |

