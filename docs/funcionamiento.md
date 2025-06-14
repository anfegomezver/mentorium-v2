# Componente de historial de accesos de usuarios

Este componente fue desarrollado como parte de una solución para la gestión de accesos de usuarios registrados en Firestore. Su propósito es permitir a un administrador consultar, ordenar y filtrar el historial de usuarios logueados en el sistema.

## Descripción de lo implementado

Se construyó un componente en Angular que carga registros desde una colección en Firestore y los presenta en una interfaz visual moderna y funcional. 

El componente permite mostrar todos los accesos registrados históricamente, aplicar filtros por usuario o fecha, y ordenar por diferentes columnas clave. Se destacan las siguientes funcionalidades desarrolladas:

### Filtros dinámicos combinables

Se implementaron filtros avanzados que permiten buscar usuarios por su nombre o correo electrónico, así como por fecha de acceso. Estos filtros se activan mediante casillas de verificación (`checkbox`) y se aplican dinámicamente conforme el administrador escribe o selecciona una fecha.

Es posible combinar varios criterios a la vez, lo que permite búsquedas refinadas, por ejemplo: "accesos de un usuario específico en una fecha concreta".

### Consulta rápida por fecha

Además del filtrado avanzado, se incluyó una sección de consulta rápida por fecha. El administrador puede seleccionar una fecha específica y presionar un botón para ver los registros correspondientes. Los resultados se muestran en un modal con diseño limpio y contenido estructurado, sin afectar el listado principal.

### Tabla interactiva con ordenamiento

La información se muestra en una tabla interactiva que permite ordenar ascendente o descendentemente por:

- Nombre de usuario
- Correo electrónico
- Fecha de ingreso
- Fecha de salida
- Método de acceso

Cada columna contiene íconos que indican el estado actual del ordenamiento y permiten cambiarlo al hacer clic sobre el encabezado.

### Listado general con paginación

Se desarrolló un sistema de paginación que permite controlar cuántos registros se muestran por página y navegar entre ellas fácilmente. Esta funcionalidad se mantiene activa incluso cuando se aplican filtros.

También se agregó una sección informativa que muestra el número de resultados filtrados y el total general de registros disponibles.

### Modal para resultados filtrados por fecha

La consulta por fecha específica abre un modal animado que presenta los registros del día seleccionado. Este modal cuenta con scroll interno, encabezado fijo, y mensajes visuales cuando no se encuentran registros para la fecha consultada.

### Interfaz visual moderna

La interfaz fue diseñada utilizando TailwindCSS y estilos personalizados para lograr un resultado atractivo, limpio y responsivo. Se incluyeron elementos visuales como:

- Indicadores de carga animados.
- Chips de sesión activa.
- Iconografía intuitiva.
- Estados vacíos amigables con mensajes y gráficos.
