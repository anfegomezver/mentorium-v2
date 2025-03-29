
# Angular

Angular es un marco web que permite a los desarrolladores crear aplicaciones rápidas y confiables.
Mantenido por un equipo dedicado de Google, Angular proporciona un amplio conjunto de herramientas, API y para simplificar y agilizar el flujo de trabajo de desarrollo. Angular te da una plataforma sólida en la que crear aplicaciones rápidas y fiables que se escalan tanto con el tamaño de tu equipo y el tamaño de tu base de código.


Mentorium es una aplicación desarrollada con **Angular 19.1.7** y **Tailwind 4.0.14**. Este documento describe la estructura del proyecto, sus dependencias y cómo ejecutarlo.


## Instalacion

Instalar mi Mentorium con npm

```bash
  npm install my-project
  cd my-project
```
## Instalación Global de Angular
Para instalar Angular CLI de manera global en tu sistema, usa el siguiente comando:
```bash
npm install -g @angular/cli
```

## Creación de un Nuevo Proyecto Angular
Para generar un nuevo proyecto en Angular, ejecuta el siguiente comando:
```bash
ng new mentorium
```

### Instalación de Dependencias
Accede a la carpeta del proyecto y ejecuta:
```bash
cd mentorium
npm install
```

## Creación de Componentes
Para generar los componentes dentro de la carpeta `components`, ejecuta los siguientes comandos:
```bash
ng generate component components/login
ng generate component components/register
```
Estos comandos crearán automáticamente las carpetas y archivos necesarios para cada componente.

## Ejecución del Proyecto
Para iniciar el servidor de desarrollo en `http://localhost:4200/`, usa:
```bash
ng serve
```

## Framework
- **Angular 19.1.7**: Framework principal para la creación de la aplicación.
- **Tailwind 4.0.14**: Biblioteca de estilos para mejorar la interfaz.

## IDE Recomendado
- **Visual Studio Code**: Editor recomendado con extensiones para Angular y TypeScript.


## Estructura de Carpetas
```plaintext
mentorium/
├── src/
│   ├── app/
│   │   ├── components/  # Componentes reutilizables
│   │   │   ├── login/  # Componente Login
│   │   │   │   ├── login.component.ts
│   │   │   │   ├── login.component.html
│   │   │   │   ├── login.component.scss
│   │   │   │   ├── login.component.spec.ts
│   │   │   ├── admin/  # Componente Admin
│   │   │   │   ├── admin.component.ts
│   │   │   │   ├── admin.component.html
│   │   │   │   ├── admin.component.scss
│   │   │   │   ├── admin.component.spec.ts
│   │   │   ├── dashboard/  # Componente Dashboard
│   │   │   │   ├── dashboard.component.ts
│   │   │   │   ├── dashboard.component.html
│   │   │   │   ├── dashboard.component.scss
│   │   │   │   ├── dashboard.component.spec.ts
│   │   │   ├── product/  # Carpeta de productos
│   │   │   │   ├── add/  # Componente Add
│   │   │   │   │   ├── add.component.ts
│   │   │   │   │   ├── add.component.html
│   │   │   │   │   ├── add.component.scss
│   │   │   │   │   ├── add.component.spec.ts
│   │   │   │   ├── list/  # Componente List
│   │   │   │   │   ├── list.component.ts
│   │   │   │   │   ├── list.component.html
│   │   │   │   │   ├── list.component.scss
│   │   │   │   │   ├── list.component.spec.ts
│   │   ├── services/    # Servicios para manejo de datos
│   │   ├── models/      # Interfaces y modelos de datos
│   │   ├── guards/      # Guards para protección de rutas
│   │   ├── interceptors/ # Interceptores HTTP
│   │   ├── app.module.ts  # Módulo principal
│   │   ├── app-routing.module.ts # Rutas principales
│   ├── assets/  # Recursos estáticos
│   ├── environments/  # Configuración de entornos
│   ├── styles.scss  # Estilos globales

```
