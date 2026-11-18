# lekalo-ruby

Определяет Gemfile и сообщает о признаке языка Ruby. Сервис передаёт наблюдения в `lekalo init --adopt`. Для выполнения нужен Node.js.

```yaml
schema: lekalo/runtime-config/v1
components: {}
services:
  discovery/ruby: gh/ichinya/lekalo-ruby
```

Выполните `lekalo runtime lock`, затем `lekalo init --adopt --dry-run`. Также можно установить `bin/discovery.cjs` как исполняемый файл и выбрать его через `command`. Пакет предоставляет операции `discovery.describe` и `discovery.inspect`. Проверки контрактов исходного кода потребуют отдельной реализации `check`.
