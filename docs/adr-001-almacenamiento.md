# ADR-001: Diseño del almacenamiento del proyecto en Amazon S3

- Fecha: 2026-10-20
- Autor: Andres Felipe Mendoza Milian


## Contexto

El proyecto es un sitio web para reservar canchas deportivas. En el Laboratorio 1 el sitio se publicó en un bucket de S3 (`cuc-bp-mendoza-sitio-2026`) y se creó un segundo bucket (`cuc-bp-mendoza-privado-2026`) que solo tenía un archivo de prueba sin significado.

El sitio funcionaba, pero no estaba protegido contra errores humanos. Si alguien borraba `index.html` por error, el sitio se caía con un 404 y no había forma de recuperar el archivo. Además, el proyecto va a manejar datos que no pueden ser públicos: exportes de reservas con nombres y horarios de los usuarios, respaldos de la base de datos, logs de la aplicación y reportes internos de ocupación. Todavía no existía un lugar definido para guardarlos ni un criterio para decidir qué va en cada bucket.

También había un problema de costo por resolver: al activar el versionado, el bucket guarda todas las versiones de cada archivo, y cada versión ocupa espacio y se cobra. Sin una política de retención, ese costo crece sin límite.

Había que decidir tres cosas: cómo se reparten los datos entre buckets, cómo se protegen contra borrados accidentales y cuánto tiempo se conservan las versiones antiguas.

## Decision

**Dos buckets con funciones separadas:**

- `cuc-bp-mendoza-sitio-2026`: contiene solo lo que el navegador del visitante necesita para cargar el sitio (`index.html`, `css/`, `js/`). Es de lectura pública.
- `cuc-bp-mendoza-privado-2026`: contiene todo dato interno, sin acceso público. Solo lo leen el administrador, el backend y los roles que se definan.

**Prefijos del bucket privado**, uno por grupo de datos de la matriz de clasificación:

- `reservas/`: exportes de reservas (nombre, cancha, fecha, hora).
- `respaldos/`: respaldos de la base de reservas.
- `logs/`: logs de la aplicación.
- `reportes/`: reportes de ocupación para administración.

Se separan en prefijos porque cada grupo tiene un lector distinto, y así los permisos de IAM y las reglas de ciclo de vida pueden apuntar a un prefijo concreto en lugar de afectar todo el bucket.

**Versionado:** activado en el bucket del sitio, donde se demostró que un borrado accidental se revierte quitando el delete marker. [CONFIRMAR: también activado en el bucket privado, porque los respaldos y los exportes de reservas son difíciles de reconstruir si se sobrescriben o se borran por error. Si en tu respuesta 1c dijiste que no, cambia esta línea y explica por qué.]

El bucket privado no tiene regla de ciclo de vida por ahora; su política de retención por prefijo queda pendiente (ver Consecuencias). La transición a Glacier de versiones vigentes en el bucket del sitio tiene un riesgo para la disponibilidad del sitio, detallado también en Consecuencias.

**Regla de ciclo de vida `retencion-sitio`**, aplicada a todos los objetos del bucket del sitio:

- A los **30 días**, las versiones vigentes pasan a Standard-IA. Es el mínimo que S3 permite para esa transición.
- A los **90 días**, pasan a Glacier Flexible Retrieval.
- A los **180 días** de dejar de ser vigentes, las versiones antiguas se eliminan de forma permanente.

Con 50 GB, la estimación en calculator.aws (US East, N. Virginia) da **$13.80 al año** con todo en Standard y **$4.02 al año** con la regla, un ahorro de **$9.78 al año. La estimación supone 50 GB subidos al inicio del año, sin descargas, y no cuenta solicitudes ni transiciones, que cuestan centavos a este volumen.

## Alternativas consideradas

1. Un solo bucket para todo.** Se descartó porque obliga a elegir entre dos malas opciones: si el bucket es público, los respaldos y las reservas quedan expuestos, y cualquiera con la URL podría descargar quién reservó y a qué hora; si es privado, el sitio no carga y nadie puede reservar. Con dos buckets, cada uno tiene la política de acceso que le corresponde y un error de configuración en uno no compromete al otro.

2. No activar el versionado.** Se descartó porque sin él un borrado o una sobrescritura es definitivo. Ya se comprobó en el laboratorio: con el versionado, borrar `index.html` solo pone un delete marker que se quita para restaurar el sitio. Sin versionado, el archivo se habría perdido y el sitio habría quedado caído hasta volver a subirlo. El costo de guardar versiones es bajo comparado con el riesgo.

3. Versionado sin regla de ciclo de vida.** Se descartó porque cada versión se cobra y se acumula sin límite. Con la regla, el costo anual estimado baja de $13.80 a $4.02 y las versiones viejas se eliminan solas después de 180 días.

4. Dejar el sitio en Netlify. Se descartó porque Netlify resuelve solo el sitio estático, pero los datos privados (exportes de reservas, respaldos, logs) necesitan igualmente un almacenamiento aparte con control de acceso por prefijo y por rol. Eso nos dejaría con dos plataformas, dos modelos de permisos y dos facturas, en lugar de un solo servicio donde la política de acceso y la retención se definen en un mismo lugar. Si en el futuro el sitio necesitara despliegues automáticos o una CDN más completa, esta alternativa habría que reevaluarla.

## Consecuencias

### Positivas

- Un borrado accidental ya no tumba el sitio de forma permanente: se recupera quitando el delete marker.
- Los datos sensibles quedan en un bucket sin acceso público, separados del sitio.
- Cada grupo de datos tiene su prefijo, lo que permite dar permisos y aplicar reglas por grupo.
- El costo de las versiones queda acotado por la regla de ciclo de vida.

### Costos o desventajas que aceptamos

- El versionado guarda varias copias de cada archivo y eso se paga, aunque a 50 GB el costo es pequeño.
- Hay que mantener dos buckets y dos configuraciones de acceso, con más cuidado al subir cada archivo al bucket correcto.
- Los archivos que pasan a Standard-IA y a Glacier tienen costo de recuperación y, en Glacier, una espera de minutos a horas para leerlos.

### Que habria que revisar mas adelante

- **La regla `retencion-sitio` está en el bucket del sitio y pasa también las versiones vigentes a Glacier a los 90 días.** Ese bucket guarda `index.html`, `css/` y `js/`, que se sirven en vivo a cualquier visitante, y un objeto en Glacier no se puede leer sin restaurarlo antes. Un sitio que no cambia por más de 90 días empezaría a fallar. La corrección es limitar la transición a Glacier a las versiones no vigentes, o aplicar la transición solo al bucket privado (`respaldos/`, `logs/`, `reportes/`). Hay que corregirlo antes de usar el sitio en producción.
- Definir una política de retención propia para `respaldos/` y `logs/` en el bucket privado, con plazos que se ajusten a cada tipo de dato.
- Rehacer la estimación de costo con el volumen real cuando el proyecto tenga usuarios, porque el supuesto de 50 GB sin descargas es una simplificación.
