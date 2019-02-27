# ComeyCome v2
Esta versión está hecha con el framework de Angular con la finalidad de añadir mejoras en el performance y seguridad de la aplicación

# Release History

## v2.4.3

### CallStatistics
* Reporte de desbordes para colas con "desborde" = 1

### Monitor FC para MP
* FC del día, con referencia de desborde
* Comparación misma hora del día anterior

### Tabla F Soporte
* Identificación de llamadas desbordadas y % de desborde

### Venta por Hora
* Reporte de venta por hora por skill seleccionado
* 1 día de selección
* Descargable

## v2.4.2

### Global
* Mejoras en el menú para selección de módulos (.2001)
* Corrección de MODALS en todos los módulos (.2001)
* Integracion de Material Angular (.2001)
* Fix Menu al abrir opciones (.2003)
* Fix Excel Download (file type) (.2005)
* Fix de Notificación en error de APIs (.2010)
* Módulo Drag & Drop (.2016)
* Fix Logout con corrección de ZH (.2019)

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

### Avisos PDV
* Vista global desde cualquier módulo (.2013)
* Filtro múltiple por PDV (.2013)
* Borrado por perfiles (.2013)
* Validación de localizador correcto (.2017)
* Módulo de reporte de avisos PDV (.2018)

### Bitácora
* Hora por zona horaria global (.2021)

### Call Statistics
* Tabla intermedia para mejorar performance de consultas (.2015)
* API mejorada, una sola carga por consulta (.2015)
* Visualización de SLA en resumen (.2015)
* Implementación de ventana múltiple (.2015)
* Corrección de LastUpdate en monitores (.2016)
* Corrección de fecha desplegada en gráfica (.2019)
* Horario de acuerdo a ZH (.2020)
* AutoRefresh Multi (.2020)
* Skills seleccionables desde barra de direcciones en multi (.2020)
* FIX -> Multi Last Update format (.2021)

### Cambios de Turno
* Nuevo módulo de cambios de turno (.2003)
* Información de cambios en el mes (.2003)
* Api con guardado de historial de cambios (last_change per date) (.2003)
* Fix Fechas, formulario e historico (.2004)

### Carga de Horarios
* Fix de horarios con distintas zonas horarias (.2015)
* Asignación de PDV (Sólo para ese departamento) (.2020)

### CxC
* Implementación de no. de quincenas al enviar a RRHH (.2004)
* Corrección de Layout descargable por quincenas (.2004)
* Restricción de selección de fechas para aplicación (.2019)
* Fecha de envío a RRHH en módulo de aplicaciones (.2019)
* Se omiten cxc de asesores de baja en módulo de aplicaciones (.2019)
* Se agregan avisos de ajuste para asesores de baja en módulo de registro (.2019)
* Se agrega filtro por asesor en módolo de administración (.2023)

### Detalle-Asesor
* Saldos Vacacionales (.2028)
* Integración de saldos vacacionales con módulo de captura de ausentismos (.2028)
* Integración en vista de detalle del asesor (.2028)
* Integración de días pendientes en módulo de detalle del asesor (.2028)

### Evaluaciones Desempeño
* Módulo de Búsqueda y Evaluación (.2010)
* Tiempo límite para evaluación (.2010)
* Tiempo límite para solicitud de no renovación (.2010)
* Flujo de autorización Gerencial (.2010)
* Review con asesor con solicitud de firma electrónica (.2010)
* Integración completa a detalle de asesores (.2011)
* Acceso a edición de contratos desde módulo de evaluación (sólo con permiso) (.2011)

### HeadCount
* Nueva vista con mejor rendimiento (.2008)
* Integración de "MainDep" para distinción de operaciones (.2008)
* Modificación de solicitud de vacantes con país y módulos según catálogo (.2008)
* Estandarización de zonas de acuerdo a catálogos de BI (.2008)

### KPIs PDV
* Fix de participación Online (.2016)

### SearchAsesor Module
* Fix filtro por udn/area/dep/puesto (.2002)
* Devuelve informacion de codigos de puesto (.2002) 

### Tabla F
* Integración de Colombia para Tablas F (.2016)
* Margen Hotel en Ventas (.2016)
* BUG FIX -> Descarga a Excel (.2017)
* Mejora en performance de consultas (.2017)
* Tablas MATERIAL (.2021)

### Módulo de Asistencias
* División CO / MX

### Módulo de Metas PDV
* División CO / MX (.2020)
* Filtro por Activos / Inactivos (.2020)
* Meta total y de hotel (.2020)
* Cálculo automático de meta por día (.2020)

### Módulo de Monitor de Pausas
* División CO / MX

### Módulo de PyA
* División CO / MX

### Módulos Survey
* Módulo genérico de tipificación (.2005)
* Configurable por base de datos (.2005)
* Pendiente configuración de campos DATE y TIME (.2005)
* Filtro QuickSet (.2006)

### Monitor de Colas
* Selección por pais (.2010)
* Selección acumulativa por cola (.2010)
* Multiples vistas (.2010)
* Mejoras en performance de monitor (.2010)
* Pausa corre a partir de que termina la llamada (.2010)
* Corrección de llamadas con agentes fuera de cola (.2013)
* Selección por Skill (.2029)
* Combo con resumen, longest events, esperas y gráfico (.2030)

### Ofertas MP
* Módulo para subir ofertas (.2023)
* Módulo para consultar ofertas (.2023)
* Edición de Incentivos PDV / CC (.2023)

### Reporte Afiliados
* Fix de columna Afiliado y título de página (.2007)
* Acceso para "Solo Afiliados" con perfil "ViewOnlyAffiliates" (.2029)

### Reporte Avance PDV
* Gráfica de avance General (.2026)
* Gráfica de avance por Zona - PDV (.2026)
* Gráfica de avance por Zona - Supervisor (.2026)
* Gráfica de avance por Supervisor - Asesor (.2026)
* Gráfica de avance por Asesor (.2026)
* Data Exportable (.2026)
* Corrección de nombres de acuerdo a RSV (.2027)
* Tabla con metas (.2027)

### Reporte Venta por PDV
* Reporte por día por PDV (.2005)
* Filtro de Venta y Cxl / Solo Venta (.2005)
* Filtro de Paquete / Prod Desglozado (.2005)
* Filtro por día / Totalizado (.2007)
* Filtro por asesor / PDV (.2007)
* Filtro por país (.2030)

### Reporte de Venta MP por semana
* Reporte por semana vendida por fecha (.2023)
* Descargable (.2023)
* Selección de Rango de Fechas (.2024)
* Filtro por PDV (.2024)

### Zonas PDV
* Módulo de asignación de Zonas por PDV (.2023)

## v2.4.1

### Bitacora GTR V2
* KPIs por intervalo, por departamento
* Integración de nueva version de tablas
* Comentarios en 3 niveles, en tiempo real

### Global
* Módulo de preferencias por usuario
* Zona horaria Global por preferencias
* Implementación de opciones de color (.1002)

### Detalle Asesores
* Consulta de CxC en cobro para el asesor

### HOME
* Consulta de horarios 1 semana antes y después
* Integración de CxC en cobro

### Módulo CXC
* Renovación completa de módulo de consulta y registro
* Mandtorio relacionar con transacciones de RSV
* El monto lo determina la suma de transacciones ligadas al registro del CXC
* El cambio de satus se restringe a la subida del formato de CXC
* Nuevo módulo de aplicación
* Nuevo módulo de administración
* Administración por PDV / CC (.1002)
* Integración de nueva versión a prenómina (.1002)
* Descarca con Layout para prenómina

### Módulo de carga de horarios (Nuevo)
* Selección de asesores por permisos y niveles
* Filtro por Supervisor / Asesor
* Selección semanal
* Context-menu con opciones rápidas
* Extensión de horarios (Copy/paste)

### Monitor Indices
* Vista de asesores activos (MP) con medición de Indice
* Supervisores resaltados por color

### Monitor Queues
* Color por perfil (MX/CO) (.1002)

### Monitor KPIs
* Badge VAR % por permisos
* Unificación de queries para reportes y monitores
* Integración de Montos en COP para MP CO (.1001)

### Reporte de Afiliados (Nuevo)
* Reporte parametrizado de Afiliados

### Reporte de Asistencia
* Filtro para búsqueda de varios asesores
* Filtro de búsqueda por supervisor

### Reporte de Venta por Canal MT
* Reporte de venta por canal y producto para MT

## v2.4.0

* Angular 6
* NPM update

## v2.3.0

### Ausentismos
* Integración de módulo de dias pendientes para ausentismos

### Asistencia
* Bug Fix -> Recargar excepcion cuando se modifica desde filtro de asesor
* Bug Fix -> Corrección de formato de horas en módulo de jornadas
* Filtro por asesor
* Selección de pago de DTs en nómina o acumulación de dias
* Selección de pago de Horas Extra en nómina o acumulación de dias

### Citas Outlet
* Módulo para agendar citas para Outlet VyV2018
* Auto actualización de slots ocupados
* Edicion y borrado
* Lista descargable
* Base de datos con status editables

### Cuartiles
* Fix exportación de columnas visibles

### Dashboard por Hora
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

### Días Pendientes
* Carga de dias pendientes nuevos
* Opción de carga de horas negativas
* Consulta de todos los asesores con dias Pendientes
* Detalle de resutado de días disponibles
* Flujo de aprobación para dias pendientes

### Encuestas
* Encuestas personalizables

### Incentivos
* Review de incentivos con comentarios
* Fix -> Modificación de fecha límite para aprobaciones

### Logout
* Logout con confirmación de horarios

### Menu
* Badge de tiempos no productivos en menú

### Monitor Kpis
* Monto en COPS para MP CO

### Monitor Kpis PDV
* Monitoreo de venta por Supervisor / PDV
* Asesores asignados a cada PdvAsesor
* Mostrar todos los PDVs aunque no tengan venta
* Monto vendido en canal ONLINE diferenciado
* Permiso de visualización por zona (supervisor)
* Permiso de tablas_f muestra todas las zonas

### PBX Status
* Se agrega el tiempo en pausa de comida y pnp
* Tiempo en min y sec

### Prenómina
* Fix -> Corrección de faltas en festivos
* Fix -> Corrección de primas dominicales para horarios de sábado en la noche

### Reporte PDV
* Filtros múltiples para búsquedas por Servicio, Branch, asesor, etc
* Agrupación y visualización opcional
* Todos los canales
* Todos los servicios
* Todos los asesores

### Reporte Personalizado
* Filtros múltiples para búsquedas por GpoCanal, Servicio, Branch, asesor, etc
* Agrupación y visualización opcional
* Todos los canales y Marcas
* Todos los servicios
* Todos los asesores

### Tabla F
* BUG FIX -> "Monto Otros" en in de MT (Ventas en CLO de COOMEVA)
* Separación del canal Outlet de los resultados

### Venta por Canal
* Separación del canal Outlet de los resultados
* Opción de visualización de MasterLocators
* Opción de visualización de Por Hora (Limit 1 dia)

### General CyC
* Mejoras en rendimiento de monitores (destroy timeouts al cambiar componente)
* Automatización de correos de notificación de contratos vencidos
* Automatización de correos de notificación de cumpleaños
* Historial de correos enviados (automatizados)
* Personalización de NavBar en fecha de cumpleaños
* Personalización de HOME en fecha de cumpleaños

## v2.2.5

### Cuartiles asesores
* Módulo de Cuartiles
* KPIs cuartilizados
* Descargable Acumulado y por fecha

### Módulo para subir logueos de pdv
* Acepta archivos csv
* Actualización automática en base de datos

### Módulo Incentivos
* Implementación de incentivos automatizados
* Integración de incentivos en Prenómina
* Módulo de autorización de incentivos y excepciones
* Tooltip con comentarios para revision y nombre y fecha de última modificación
* Validación de última aprobación (evita sobreponer aprobaciones)

### Tabla F
* Tabla F para MP y MT
* Tabla F para Areas de Apoyo

### CallStatistics
* Línea de Forecast
* Línea de AHT

### Queue Monitor
* Cambio de color de llamadas OUT
* Llamadas OUT sobre llamadas IN ocultas

### Monitor Pausas
* Fix -> Pausas excedidas 0 tolerancia

### Monitor por Equipo
* Mejoras en resultados
* Implementación de Tours y transfers para Tag
* Muestra llamadas efectivas OUT y AHT

### Prenómina
* Filtro para nómina por Unidad de Negocio
* Integración del pago de Incentivos
* Omisión de Horas Extra y DTs seleccionadas para pagarse con tiempo


## v2.2.3

### General
* Fix -> gráficas

### Módulo Upload SMD
* PEC (Controlable)
* FCR

### Queue Monitor
* Fix -> AHT
* Modo Monitor para pantallas del CC
* Resumen mejorado para Monitores

### CountDown
* CountDown modo cierre en NavBar

### Dashboard Kpis
* Fix -> Monto por producto ok
* Paquetes desglozados
* Monitor de Kpis NUEVO
* Vuelo, Hotel y paquete
* RN y Locs
* FC para CC-In
* Var yd, lw y yd
* Glosario

### Call Statistics
* Se elimina FC (Se mueve a kpis)

### Monitor PYA
* Fix -> Faltas replicadas en la barra de notificación

### Listado Fotografías
* Listado CC / PDV con fotos y opción de subir / cambiar

## v2.2.26

### Módulo de Asistencia
* Fix -> No se mostraban excepciones cuando existían Logueos
* Cambio de color a índigo para excepciones aplicadas
* Faltas calculadas por sistema en color rojo
* Filtro sin acentos
* NA en bajas o nuevos ingresos

### Monitor PYA
* Fix -> No se reflejaban como RT-A retardos de exactamente 1 min
* Fix -> Asesores sin horario paraban la aplicacion

### Monitor Queues
* Cambio a procesos serverSide
* Cambio a RawData para tiempos de pausas y llamadas
* Fix -> Llamadas transferidas y de PT US se muestran correctamente

### Dashboard Por Hora
* Selector MP / MT
* Selector MX / CO
* Selector *Solo Venta* / *Venta y Cxl*
* Selector Mes
* Selector por Fecha o Rango

### Monitor IVR
* Fix -> Responsive
* Filtro para soporte
* Listado llamadas soporte

### Call Statistics
* Llamadas por intervalos de 30 min
* En vivo e históricos
* Por Canal
* FC por grupo

### Monitor Pausas
* Se elimina charla de revisión

### Prenomina
* Se igualan columnas a formato de rrhh
* Corrección de Fechas a Formato DD/MM/YY

## v2.2.25

### NavBar
* Fix -> Servicio de logueo
* Fix -> Servicio de tokenCheck
* Se habilita el phoneStatus

### Addon de Búsqueda de Asesor
* Búsqueda a través de api restful
* Descripción con estilo
* Opciones de Filtros
* Integración en Modulos de CyCv2

## v2.2.24

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

### NavBar ***desactivado***
* Addon con status telefónico
* Desactivado por performace

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

### Monitor Queues
* Fix -> Color status de llamada entrante sin caller number

### Cuartiles
* Se agregan asesores del OUT en Cuartiles In

### Cambio de asignación de Localizador (**NUEVO!**)
* Creación de Módulo para cambios de asignación en CyC

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
