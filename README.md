# Junar Open Data Platform
## Módulos y Librerías JS comunes

Este repo contiene:

Dentro de `modules`:
- `datastream`: Código con funciones de parseo JS de las respuesta del motor para ser transformados en un datastream (tablas)
- `charts`: Código del módulo de visualizaciones
- `dashboards`: Código del módulo de dashboards

Dentro de `libs`:
- `flexigrid`: Componente JS para manejo de tablas con paginado y búsqueda. Este componente fue editado por los desarrolladores de junar.

Este código esta publicado en NPM, y servido por el mismo médio al proyecto, para las apps `workspace` y `portal`

## Instalar via NPM
- Comando: `npm install @junar/common-scripts`

## Para publicar el paquete
- en el `package.json` el nombre del paquete debe ser `@junar/XXX`, donde `XXX` será el nombre del paquete alojado en la organización Junar
- `npm init --scope=junar` (solo la primera vez, sino se ha publicado nunca)
- Si ya se ha publicado, previo a publicar cambios, se debe cambiar el número de la version del paquete, ej: de `1.0.0` a `1.0.1`
- `npm publish --access public`