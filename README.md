# ComeyCome v2
Esta versión está hecha con el framework de AngularCLI con la finalidad de añadir mejoras en el performance y seguridad de la aplicación

# Release History

## v2.2.21

### Módulo de Asistencia
* Funcionalidad para descargar Información




## v2.2.2

### Módulo de Asistencia
* Fix -> Cálculo de Faltas en fechas menores a *hoy*
* Fix -> ChangeDetection Strategy -> default
* Fix -> No se mostraba correctamente el código de ausentismo.
* Integración de módulo de ausentismos
* Mejora en performance de actualización de excepciones

### Módulo Prenómina
* Fix -> Obtención correcta de logueos

### Módulo de Excepciones PYA
* Adición de asesor y fecha en evento para mejora en modulos al qué se integre

### Monitor de PYA
* Mejora en performance de excepciones y reloads

### Calendario
* Fix -> Fechas que no se muestran, aparecen ya correctamente

### Móduo Programacion v1.0
* Integración de tbla nueva de ausentismos


## v2.2.1

### Cuartiles
* Descarga de cuartiles por fecha en rango seleccionado
* Columna de llamadas colgadas con cuarilizado

### Módulo de Excepciones PYA (Nuevo!)
* Separación de excepciones en Asistencia y Puntualidad
* Integración a nuevas tablas de PYA
* Módulo independiente para su uso en distintos Módulos
* Fix -> Correcta escritura de Ausentismo en tabla de ausentismos (a: 1)

### Monitor de PYA
* Fix -> Performance mejorado con módulos por tarjeta
* Integración de módulo de Excepciones para PyA
* Reload general al ingresar excepciones de Ausentismo

### Venta por Canal
* Se agrega la columna de Mixcoac
* Opción para desglozar el producto de paquete en Hotel y Vuelo por separado

### Monitor Por Asesor
* Fix -> ordenamiento de supervisores
* Fix -> Responsive para celulares
* Fix -> FC% 'Hoy'

### Estilos
* Fix -> checkboxes y button-groups con BS4

### Monitor de Participacion IVR (Nuevo!)
* Participación de Dids, Colas, Horas y Grupos en MP

### Calendario
* Integración de nueva tabla de Ausentismos

### Módulo de Ausentismos v2 (Nuevo!)
* Asignación de Ausentismos en nueva tabla
* Asignación de días específicos de Descansos y Beneficios
* Obtención en tiempo real de días pendientes

### Módulo de Prenómina v2 (Nuevo!)
* Carga por módulos
* Se agregan columnas de Fechas por Ausentismos
* Se agregan columnas de Locs por Cxc
* Integración de nueva tabla de Ausentismos

### Módulo de Asistencia (Nuevo!)
* Fix -> corrección de función MySQL para checkLogs
* Módulos independientes para Excepciones, Retardos y Salidas Anticipadas
* Cálculo automático de Faltas por Salidas Anticipadas
* Cambio de checkboxes por switches para opciones
* Integración de nueva tabla de Ausentismos
