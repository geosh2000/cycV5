# v2.4.2020
## 1 Nov '18
### Albert Sanchez

### Global
* Fix -> checkboxes y button-groups con BS4
* Fix -> Servicio de logueo
* Fix -> Servicio de tokenCheck
* Se habilita el phoneStatus
* CountDown modo cierre en NavBar
* Fix -> gráficas
* Mejoras en rendimiento de monitores (destroy timeouts al cambiar componente)
* Automatización de correos de notificación de contratos vencidos
* Automatización de correos de notificación de cumpleaños
* Historial de correos enviados (automatizados)
* Personalización de NavBar en fecha de cumpleaños
* Personalización de HOME en fecha de cumpleaños
* Badge de tiempos no productivos en menú
* Logout con confirmación de horarios
* Angular 6
* NPM update
* Mejoras en el menú para selección de módulos (.2001)
* Corrección de MODALS en todos los módulos (.2001)
* Integracion de Material Angular (.2001)
* Fix Menu al abrir opciones (.2003)
* Fix Excel Download (file type) (.2005)
* Fix de Notificación en error de APIs (.2010)
* Módulo Drag & Drop (.2016)
* Fix Logout con corrección de ZH (.2019)
* Módulo de preferencias por usuario
* Zona horaria Global por preferencias
* Implementación de opciones de color (.1002)

### Addon de Búsqueda de Asesor
* Búsqueda a través de api restful
* Descripción con estilo
* Opciones de Filtros
* Integración en Modulos de CyCv2

### Altas en grupo
* Módulo de altas con template de xlsx (.2009)
* Detección de reingresos con opción de modificación de datos (.2009)
* Detección de asesores existentes (sin baja) (.2009)
* Optimización de selección de posiciones a ocupar (.2009)
* Carga en serie (evita duplicidades) (.2009)
* Módulo simplificado para altas individuales (.2013)

### Asignación de Supervisores CC
* Listado completo de Asesores por país (.2016)
* Supervisores inactivos, mostrados como "sin asignar" (.2016)
* Filtrado por asesor (.2016)
* Filtrado de Supervisores (.2016)
* Drag and Drop (.2016)
* Se omiten "Otros Puestos" en listado de asesores (.2019)
* Se asigna color por departamento (.2019)

### Asignación de Supervisores PDV
* Listado completo de PDVs por país (.2016)
* Supervisores inactivos, mostrados como "sin asignar" (.2016)
* Filtrado por PDV (.2016)
* Filtrado de Supervisores (.2016)
* Drag and Drop (.2016)

### Asistencia
* Fix -> corrección de función MySQL para checkLogs
* Módulos independientes para Excepciones, Retardos y Salidas Anticipadas
* Cálculo automático de Faltas por Salidas Anticipadas
* Cambio de checkboxes por switches para opciones
* Integración de nueva tabla de Ausentismos
* Fix -> Cálculo de Faltas en fechas menores a *hoy*
* Fix -> ChangeDetection Strategy -> default
* Fix -> No se mostraba correctamente el código de ausentismo.
* Integración de módulo de ausentismos
* Mejora en performance de actualización de excepciones
* Funcionalidad para descargar Información
* Activación de filtro por nombre
* Corrección de API para correcto órden de fechas
* Formato con día en encabezado de Fechas
* Habilitada la opción "Todos"
* Fix -> Encabezados con fechas correctas al exportar a excel
* MaxHeight de tabla en 700px con overflow automático
* Columna de nombre al final de la tabla para fácil lectura
* Fix -> No se mostraban excepciones cuando existían Logueos
* Cambio de color a índigo para excepciones aplicadas
* Faltas calculadas por sistema en color rojo
* Filtro sin acentos
* NA en bajas o nuevos ingresos

### Ausentismos
* Asignación de Ausentismos en nueva tabla
* Asignación de días específicos de Descansos y Beneficios
* Obtención en tiempo real de días pendientes
* Fix -> Mensaje *success* correcto al guardar ausentismos
* Integración de historial de ausentismos
* Integración de módulo de dias pendientes para ausentismos

### Avisos PDV
* Vista global desde cualquier módulo (.2013)
* Filtro múltiple por PDV (.2013)
* Borrado por perfiles (.2013)
* Validación de localizador correcto (.2017)
* Módulo de reporte de avisos PDV (.2018)

### Bitacora GTR V2
* KPIs por intervalo, por departamento
* Integración de nueva version de tablas
* Comentarios en 3 niveles, en tiempo real

### Calendarios
* Integración de nueva tabla de Ausentismos
* Fix -> Fechas que no se muestran, aparecen ya correctamente
* Fix -> fechas cerradas con disponibilidad en configuración
* Quick pick para mes del año
* Loading Banner

### Cambios PDV
* Fix -> vacantes activas

### Call Statistics
* Llamadas por intervalos de 30 min
* En vivo e históricos
* Por Canal
* FC por grupo
* Se elimina FC (Se mueve a kpis)
* Línea de Forecast
* Línea de AHT
* Tabla intermedia para mejorar performance de consultas (.2015)
* API mejorada, una sola carga por consulta (.2015)
* Visualización de SLA en resumen (.2015)
* Implementación de ventana múltiple (.2015)
* Corrección de LastUpdate en monitores (.2016)
* Corrección de fecha desplegada en gráfica (.2019)
* Horario de acuerdo a ZH (.2020)
* AutoRefresh Multi (.2020)
* Skills seleccionables desde barra de direcciones en multi (.2020)

### Cambios de Turno
* Nuevo módulo de cambios de turno (.2003)
* Información de cambios en el mes (.2003)
* Api con guardado de historial de cambios (last_change per date) (.2003)
* Fix Fechas, formulario e historico (.2004)

### Carga de Horarios
* Selección de asesores por permisos y niveles
* Filtro por Supervisor / Asesor
* Selección semanal
* Context-menu con opciones rápidas
* Extensión de horarios (Copy/paste)
* Fix de horarios con distintas zonas horarias (.2015)
* Asignación de PDV (Sólo para ese departamento) (.2020)

### CxC
* Renovación completa de módulo de consulta y registro
* Mandtorio relacionar con transacciones de RSV
* El monto lo determina la suma de transacciones ligadas al registro del CXC
* El cambio de satus se restringe a la subida del formato de CXC
* Nuevo módulo de aplicación
* Nuevo módulo de administración
* Administración por PDV / CC (.1002)
* Integración de nueva versión a prenómina (.1002)
* Descarca con Layout para prenómina
* Implementación de no. de quincenas al enviar a RRHH (.2004)
* Corrección de Layout descargable por quincenas (.2004)
* Restricción de selección de fechas para aplicación (.2019)
* Fecha de envío a RRHH en módulo de aplicaciones (.2019)
* Se omiten cxc de asesores de baja en módulo de aplicaciones (.2019)
* Se agregan avisos de ajuste para asesores de baja en módulo de registro (.2019)

### Citas Outlet
* Módulo para agendar citas para Outlet VyV2018
* Auto actualización de slots ocupados
* Edicion y borrado
* Lista descargable
* Base de datos con status editables

### Cuartiles
* Descarga de cuartiles por fecha en rango seleccionado
* Columna de llamadas colgadas con cuarilizado
* Se agregan asesores del OUT en Cuartiles In
* Módulo de Cuartiles
* KPIs cuartilizados
* Descargable Acumulado y por fecha
* Fix exportación de columnas visibles

### Dashboard Por Hora
* Selector MP / MT
* Selector MX / CO
* Selector *Solo Venta* / *Venta y Cxl*
* Selector Mes
* Selector por Fecha o Rango
* Se agrega el canal Outlet

### Dashboard por Hora OVV2018
* Por día por hora para el ovv2018
* Metas de BI y por dia ajustables desde base de datos

### Dashboard por Hora OVirtual2018
* Por día por hora para el ovv2018
* Metas de BI y por dia ajustables desde base de datos

### Detalle Asesores
* Modularización de componente
* Mejora en permisos y privacidad
* Mejora en formularios
* Corrección de pantallas modales y servicios para actualización de DB
* Nuevo módulo de contratos
* Consulta de horarios y excepciones desde Detalle
* Campo de Fecha de Nacimiento en alta de asesores
* Consulta de CxC en cobro para el asesor

### Días Pendientes
* Carga de dias pendientes nuevos
* Opción de carga de horas negativas
* Consulta de todos los asesores con dias Pendientes
* Detalle de resutado de días disponibles
* Flujo de aprobación para dias pendientes

### Encuestas
* Encuestas personalizables

### Evaluaciones Desempeño
* Módulo de Búsqueda y Evaluación (.2010)
* Tiempo límite para evaluación (.2010)
* Tiempo límite para solicitud de no renovación (.2010)
* Flujo de autorización Gerencial (.2010)
* Review con asesor con solicitud de firma electrónica (.2010)
* Integración completa a detalle de asesores (.2011)
* Acceso a edición de contratos desde módulo de evaluación (sólo con permiso) (.2011)

### Fams
* Fix -> Desactivación de Fams

### HeadCount
* Nueva vista con mejor rendimiento (.2008)
* Integración de "MainDep" para distinción de operaciones (.2008)
* Modificación de solicitud de vacantes con país y módulos según catálogo (.2008)
* Estandarización de zonas de acuerdo a catálogos de BI (.2008)

### HOME
* Se agrega módulo de horarios en home
* Fix -> Corrección de horarios segun TimeZone
* Se agrega funcionalidad de selección de comida
* Consulta de horarios 1 semana antes y después
* Integración de CxC en cobro

### Incentivos
* Implementación de incentivos automatizados
* Integración de incentivos en Prenómina
* Módulo de autorización de incentivos y excepciones
* Tooltip con comentarios para revision y nombre y fecha de última modificación
* Validación de última aprobación (evita sobreponer aprobaciones)
* Review de incentivos con comentarios
* Fix -> Modificación de fecha límite para aprobaciones

### KPIs PDV
* Fix de participación Online (.2016)

### Listado Fotografías
* Listado CC / PDV con fotos y opción de subir / cambiar

### Logueos de pdv
* Acepta archivos csv
* Actualización automática en base de datos

### SearchAsesor Module
* Fix filtro por udn/area/dep/puesto (.2002)
* Devuelve informacion de codigos de puesto (.2002) 

### Tabla F
* Integración de Colombia para Tablas F (.2016)
* Margen Hotel en Ventas (.2016)
* BUG FIX -> Descarga a Excel (.2017)
* Mejora en performance de consultas (.2017)

### Módulo de Asistencias
* División CO / MX

### Módulo de Excepciones PYA (Nuevo!)
* Separación de excepciones en Asistencia y Puntualidad
* Integración a nuevas tablas de PYA
* Módulo independiente para su uso en distintos Módulos
* Fix -> Correcta escritura de Ausentismo en tabla de ausentismos (a: 1)
* Adición de asesor y fecha en evento para mejora en modulos al qué se integre
* Se agregan "helpers" para llenado de formulario

### Módulo independiente de Historial Ausentismos
* Requiere inputs de id asesor y nombre asesor
* Default modal. Para abir requiere el jQuery('#ausHistoric').modal('show')
* Funcionalidad de borrado de ausentismo con confirmación

### Módulo de Metas PDV
* División CO / MX (.2020)
* Filtro por Activos / Inactivos (.2020)
* Meta total y de hotel (.2020)
* Cálculo automático de meta por día (.2020)

### Módulo Programacion v1.0
* Integración de tbla nueva de ausentismos
* Se integra nueva tabla de comidas
* Se actualiza query de obtención de Horarios
* Se modifica el ausentismo por descanso cuando aplique

### Módulo de PyA
* División CO / MX

### Módulos Survey
* Módulo genérico de tipificación (.2005)
* Configurable por base de datos (.2005)
* Pendiente configuración de campos DATE y TIME (.2005)
* Filtro QuickSet (.2006)

### Módulo Upload SMD
* PEC (Controlable)
* FCR

### Monitor por Asesor
* Fix -> ordenamiento de supervisores
* Fix -> Responsive para celulares
* Fix -> FC% 'Hoy'

### Monitor de Colas
* Selección por pais (.2010)
* Selección acumulativa por cola (.2010)
* Multiples vistas (.2010)
* Mejoras en performance de monitor (.2010)
* Pausa corre a partir de que termina la llamada (.2010)
* Corrección de llamadas con agentes fuera de cola (.2013)

### Monitor por Equipo
* Mejoras en resultados
* Implementación de Tours y transfers para Tag
* Muestra llamadas efectivas OUT y AHT

### Monitor Indices
* Vista de asesores activos (MP) con medición de Indice
* Supervisores resaltados por color

### Monitor KPIs
* Fix -> Monto por producto ok
* Paquetes desglozados
* Monitor de Kpis NUEVO
* Vuelo, Hotel y paquete
* RN y Locs
* FC para CC-In
* Var yd, lw y yd
* Glosario
* Monto en COPS para MP CO
* Badge VAR % por permisos
* Unificación de queries para reportes y monitores
* Integración de Montos en COP para MP CO (.1001)

### Monitor Kpis PDV
* Monitoreo de venta por Supervisor / PDV
* Asesores asignados a cada PdvAsesor
* Mostrar todos los PDVs aunque no tengan venta
* Monto vendido en canal ONLINE diferenciado
* Permiso de visualización por zona (supervisor)
* Permiso de tablas_f muestra todas las zonas

### Monitor de Pausas
* Integración de filtro para búsqueda
* Mejoras en Performance
* Ordenamiento por nombre o Pausas
* Fix -> pausas editadas duplicadas
* Fix -> alerta por pendientes de revisión
* Fix -> pausas duplicadas (a nivel procesos)
* Funcionalidad para edición de tipo de pausa_id
* Se elimina charla de revisión
* Fix -> Pausas excedidas 0 tolerancia
* División CO / MX

### Monitor IVR
* Participación de Dids, Colas, Horas y Grupos en MP
* Fix -> Responsive
* Filtro para soporte
* Listado llamadas soporte

### Monitor Queues
* Fix -> Color status de llamada entrante sin caller number
* Cambio a procesos serverSide
* Cambio a RawData para tiempos de pausas y llamadas
* Fix -> Llamadas transferidas y de PT US se muestran correctamente
* Fix -> AHT
* Modo Monitor para pantallas del CC
* Resumen mejorado para Monitores
* Cambio de color de llamadas OUT
* Llamadas OUT sobre llamadas IN ocultas
* Color por perfil (MX/CO) (.1002)

### Monitor PYA
* Fix -> Performance mejorado con módulos por tarjeta
* Integración de módulo de Excepciones para PyA
* Reload general al ingresar excepciones de Ausentismo
* Mejora en performance de excepciones y reloads
* Se agrega alerta **FDH** *(fuera de horario)*
* Cambio de color para excepciones aplicadas
* Se muestra excepción de falta en la barra de abajo
* Fix -> No se reflejaban como RT-A retardos de exactamente 1 min
* Fix -> Asesores sin horario paraban la aplicacion
* Fix -> Faltas replicadas en la barra de notificación

### PBX Status
* Se agrega el tiempo en pausa de comida y pnp
* Tiempo en min y sec

### Prenómina
* Carga por módulos
* Se agregan columnas de Fechas por Ausentismos
* Se agregan columnas de Locs por Cxc
* Integración de nueva tabla de Ausentismos
* Fix -> Títulos FA y FJ
* Fix -> Obtención de Logueos
* Fix -> Faltas con notas
* Fix -> Obtención correcta de logueos
* Se igualan columnas a formato de rrhh
* Corrección de Fechas a Formato DD/MM/YY
* Filtro para nómina por Unidad de Negocio
* Integración del pago de Incentivos
* Omisión de Horas Extra y DTs seleccionadas para pagarse con tiempo
* Fix -> Corrección de faltas en festivos
* Fix -> Corrección de primas dominicales para horarios de sábado en la noche

### Reporte Afiliados
* Reporte parametrizado de Afiliados
* Fix de columna Afiliado y título de página (.2007)

### Reporte de Asistencia
* Bug Fix -> Recargar excepcion cuando se modifica desde filtro de asesor
* Bug Fix -> Corrección de formato de horas en módulo de jornadas
* Filtro por asesor
* Selección de pago de DTs en nómina o acumulación de dias
* Selección de pago de Horas Extra en nómina o acumulación de dias
* Filtro para búsqueda de varios asesores
* Filtro de búsqueda por supervisor

### Reporte Personalizado
* Filtros múltiples para búsquedas por GpoCanal, Servicio, Branch, asesor, etc
* Agrupación y visualización opcional
* Todos los canales y Marcas
* Todos los servicios
* Todos los asesores

### Reporte PDV
* Filtros múltiples para búsquedas por Servicio, Branch, asesor, etc
* Agrupación y visualización opcional
* Todos los canales
* Todos los servicios
* Todos los asesores

### Venta por Canal
* Se agrega la columna de Mixcoac
* Opción para desglozar el producto de paquete en Hotel y Vuelo por separado
* Separación del canal Outlet de los resultados
* Opción de visualización de MasterLocators
* Opción de visualización de Por Hora (Limit 1 dia)

### Reporte de Venta por Canal MT
* Reporte de venta por canal y producto para MT

### Reporte Venta por PDV
* Reporte por día por PDV (.2005)
* Filtro de Venta y Cxl / Solo Venta (.2005)
* Filtro de Paquete / Prod Desglozado (.2005)
* Filtro por día / Totalizado (.2007)
* Filtro por asesor / PDV (.2007)

### Tabla F
* Tabla F para MP y MT
* Tabla F para Areas de Apoyo
* BUG FIX -> "Monto Otros" en in de MT (Ventas en CLO de COOMEVA)
* Separación del canal Outlet de los resultados






