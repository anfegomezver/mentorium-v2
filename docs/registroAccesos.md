# Registro de Accesos: `Colección access`

Cada documento dentro de la colección `access` representa **una sesión de usuario**, desde que inicia sesión hasta que cierra sesión en la aplicación.

---

## Estructura del Documento

| Campo               | Tipo         | Descripción                                                                 |
|--------------------|--------------|-----------------------------------------------------------------------------|
| `displayName`       | `string`     | Nombre del usuario extraído desde Firebase Auth.                           |
| `email`             | `string`     | Correo del usuario.                                                        |
| `encryptedPassword` | `string/null`| Contraseña encriptada. Es `null` si el acceso fue con Google, GitHub o Facebook. |
| `loginAt`           | `timestamp`  | Fecha y hora exacta en la que el usuario inició sesión (serverTimestamp).  |
| `logoutAt`          | `timestamp`  | Fecha y hora exacta en la que el usuario cerró sesión (serverTimestamp).   |
| `method`            | `string`     | Método de autenticación usado (`google`, `github`, `facebook`, `password`).|
| `uidUser`           | `string`     | UID único del usuario en Firebase Auth.                                    |

---

## Lógica de Registro

- **Inicio de sesión:** Se crea un documento en `access` con los campos `displayName`, `email`, `method`, `uidUser`, `loginAt` y, si aplica, `encryptedPassword`.
- **Cierre de sesión:** Se actualiza el campo `logoutAt` del mismo documento con la hora actual del servidor.
- **Permite múltiples registros:** No se verifica duplicidad. Cada sesión queda registrada de forma independiente.

---

## Notas

- `encryptedPassword` **solo se guarda** cuando el inicio de sesión es con correo y contraseña (método `"email"`). Para Google, GitHub o Facebook queda como `null`.
- Las fechas `loginAt` y `logoutAt` están en zona horaria UTC-5, pero se almacenan con `serverTimestamp()` de Firestore.
- Los documentos son identificados por `docId` generado automáticamente con `doc(collection(db, 'access'))`.
- Cuando un usuario se registra por primera vez, se redirige automáticamente a la sesión iniciada, por lo tanto también se registra el acceso correspondiente.

---

## Ejemplo de Documento

```json
{
  "displayName": "Andrés Gómez",
  "email": "anfegomezver@gmail.com",
  "encryptedPassword": null,
  "loginAt": "12 de junio de 2025, 8:12:53 a. m. UTC-5",
  "logoutAt": "12 de junio de 2025, 8:15:31 a. m. UTC-5",
  "method": "google",
  "uidUser": "DaJcvRbxTNOvjn7YUsJcBrPhFa2"
}
