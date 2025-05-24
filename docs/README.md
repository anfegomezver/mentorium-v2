# Mentorium

## Introducción
Mentorium es una plataforma diseñada para facilitar el aprendizaje y mentoría en diversas áreas del conocimiento. Su propósito es conectar estudiantes con mentores especializados, ofreciendo un espacio donde el conocimiento se comparte de manera efectiva y dinámica.

## Objetivo y Alcance
El objetivo de Mentorium es proporcionar una solución integral para el aprendizaje colaborativo, permitiendo a los usuarios acceder a sesiones de mentoría personalizadas, recursos educativos y herramientas de seguimiento del progreso. La plataforma está dirigida a estudiantes, profesionales en formación y cualquier persona interesada en mejorar sus habilidades a través de la mentoría.

## Problemática
Actualmente, muchas personas tienen dificultades para acceder a orientación y apoyo educativo de calidad. La falta de recursos, la dificultad para encontrar mentores adecuados y la escasez de plataformas que integren aprendizaje estructurado con mentoría personalizada son desafíos que Mentorium busca resolver.

## Impacto Esperado
- Aprendizaje personalizado y estructurado.
- Creación de una comunidad de aprendizaje colaborativo.
- Mejora en el rendimiento académico y profesional de los usuarios.

## Tecnologías Utilizadas
Mentorium está desarrollado utilizando tecnologías modernas que garantizan escalabilidad, seguridad y una experiencia de usuario óptima. Algunas de las tecnologías empleadas incluyen:
- **Frontend**: Angular con Tailwind.
- **Backend**: Firebase.
- **Base de datos**: Por definir.

## Gestión del Proyecto
Para garantizar una ejecución eficiente del proyecto, trabajamos con metodologías ágiles utilizando:
- **Jira**: Seguimiento de tareas y gestión ágil del desarrollo.
- **GitHub**: Control de versiones y repositorio del código fuente.

## Roles del Equipo
El equipo de desarrollo de Mentorium se divide en los siguientes roles:
- **Desarrolladores Frontend**: Encargados de la interfaz y experiencia de usuario.
- **Desarrolladores Backend**: Responsables de la lógica del negocio y la gestión de datos.
- **Gestor de Proyecto**: Coordina el equipo y garantiza el cumplimiento de objetivos.

## Autores
- 192250 - Andres Felipe Gomez Verjel
- 192278 - Eduardo Jose Gutierrez De Piñerez Dizeo

---

## Funcionalidad de Autenticación

La plataforma Mentorium permite a los usuarios autenticarse de diversas formas. A continuación se detallan los métodos implementados:

### 1. Inicio de sesión con correo electrónico y contraseña

- El formulario de login solicita dos campos: `email` y `password`.
- Se validan los siguientes requisitos:
  - Email válido.
  - Contraseña de mínimo 8 caracteres, con al menos:
    - Una mayúscula
    - Una minúscula
    - Un número
    - Un carácter especial (@$!%*?&)
- Si la autenticación es exitosa, el usuario es redirigido al `/dashboard`.
- En caso de error (por ejemplo, credenciales incorrectas), se muestra una notificación con `toast.error`.

### 2. Autenticación con Google

- Al hacer clic en el botón de Google, se lanza un `signInWithPopup` usando `GoogleAuthProvider`.
- Si el login es exitoso:
  - Se obtiene el `user.uid` y se verifica si ya existe en la base de datos.
  - Si es nuevo, se crea un nuevo perfil con datos básicos.
  - Si ya existe y no tiene Google vinculado, se le añade como proveedor.
- En caso de error:
  - Si la cuenta ya existe con otro método: `auth/account-exists-with-different-credential`.
  - Se muestran mensajes específicos con `toast.error`.

### 3. Autenticación con Facebook

- Funciona similar a Google pero usa `FacebookAuthProvider`.
- Se agregan scopes adicionales: `email` y `public_profile`.
- Se manejan errores comunes:
  - `popup-blocked`: El navegador bloqueó la ventana emergente.
  - `popup-closed-by-user`: El usuario cerró la ventana antes de autenticarse.
  - `cancelled-popup-request`: Otra ventana emergente estaba activa.
  - `account-exists-with-different-credential`: El correo ya está registrado con otro método.
- Si es exitoso, se verifica y/o crea el usuario como en el caso de Google.

### 4. Autenticación con GitHub

- Se lanza la autenticación con `GithubAuthProvider` mediante `signInWithPopup`.
- Se sigue la misma lógica que con Google y Facebook:
  - Si es nuevo, se crea un usuario.
  - Si ya existe y no tiene GitHub como proveedor, se le añade.
- Se manejan errores como:
  - `account-exists-with-different-credential`
  - Otros errores generales con mensaje `toast.error("Error al conectar con GitHub")`.

### 5. Recuperación de contraseña (Olvidé mi contraseña)

- Desde el formulario se puede activar un flujo para enviar correo de recuperación.
- Se utiliza la función `sendPasswordResetEmail` de Firebase Auth.
- El usuario debe ingresar su email.
- Si el email está registrado, recibirá un enlace para restablecer la contraseña.
- Se muestra una notificación confirmando el envío o indicando errores.

  ## Nota final

Todos los métodos de autenticación están completamente integrados con Firebase y cumplen con buenas prácticas de validación, retroalimentación visual y vinculación de proveedores. Esto permite a los usuarios acceder fácilmente sin importar su método preferido.
