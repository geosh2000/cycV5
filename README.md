# ComeyCome v2
Esta versión está hecha con el framework de Angular con la finalidad de añadir mejoras en el performance y seguridad de la aplicación

# Release History

## v2.2.23

### Cambios PDV
* Fix -> vacantes activas

### Monitor de Pya
* Cambio de color para excepciones aplicadas
* Se muestra excepción de falta en la barra de abajo

### Home
* Se agrega funcionalidad de selección de comida

### Módulo Programacion v1.0
* Se integra nueva tabla de comidas
* Se actualiza query de obtención de Horarios
* Se modifica el ausentismo por descanso cuando aplique

### API Service
* Incluye el id del asesor activo

### Módulo de Asistencia
* Activación de filtro por nombre
* Corrección de API para correcto órden de fechas
* Formato con día en encabezado de Fechas
* Habilitada la opción "Todos"
* Fix -> Encabezados con fechas correctas al exportar a excel
* MaxHeight de tabla en 700px con overflow automático
* Columna de nombre al final de la tabla para fácil lectura

### Configuración Fams
* Fix -> Desactivación de Fams

### NavBar
* Addon con status telefónico

### Monitor de pausas
* Integración de filtro para búsqueda
* Mejoras en Performance
* Ordenamiento por nombre o Pausas
* Fix -> pausas editadas duplicadas
* Fix -> alerta por pendientes de revisión

### Módulo Prenómina
* Fix -> Títulos FA y FJ
* Fix -> Obtención de Logueos
* Fix -> Faltas con notas

### Calendario Ausentismos
* Quick pick para mes del año
* Loading Banner

## v2.2.22

### Módulo de Ausentismos
* Fix -> Mensaje *success* correcto al guardar ausentismos
* Integración de historial de ausentismos

### Módulo independiente de historial Ausentismos
* Requiere inputs de id asesor y nombre asesor
* Default modal. Para abir requiere el jQuery('#ausHistoric').modal('show')
* Funcionalidad de borrado de ausentismo con confirmación

### Home
* Fix -> Corrección de horarios segun TimeZone

## v2.2.21

### Módulo de Asistencia
* Funcionalidad para descargar Información

### Módulo de Excepciones PYA
* Se agregan "helpers" para llenado de formulario

### Monitor de PYA
* Se agrega alerta **FDH** *(fuera de horario)*

### Monitor de Pausas
* Fix -> pausas duplicadas (a nivel procesos)
* Funcionalidad para edición de tipo de pausa_id

### Home
* Se agrega módulo de horarios en home

### Calendario
* -> Fix fechas cerradas con disponibilidad en configuración

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
