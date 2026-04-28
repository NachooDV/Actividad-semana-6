# SportyStyle — Tienda Deportiva Online

SportyStyle es una mini tienda online de ropa deportiva que permite a los usuarios
navegar un catálogo de productos, agregar artículos al carrito, iniciar sesión de
forma segura y completar una simulación de compra.

Link de la tienda: https://nachoodv.github.io/Actividad-semana-6/
---

## ¿Qué hace la aplicación?

- Muestra un catálogo de productos deportivos divididos en tres categorías: camisetas, pantalones y accesorios.
- Permite agregar productos a un carrito de compras que se actualiza en tiempo real.
- Requiere iniciar sesión para poder finalizar la compra.
- Incluye un formulario de compra con validaciones de datos.
- Muestra una pantalla de confirmación al completar el proceso.

---

## 1. Flujo de autenticación con Auth0

La autenticación está implementada con **Auth0**, una plataforma de inicio de sesión seguro que evita tener que manejar contraseñas directamente en el código.

**¿Cómo funciona?**

1. El usuario hace clic en el botón **"Iniciar sesión"**.
2. La aplicación redirige al usuario a la página de login de Auth0.
3. El usuario ingresa sus credenciales (correo y contraseña, o cuenta de Google).
4. Auth0 verifica los datos y redirige de vuelta a SportyStyle.
5. La aplicación reconoce al usuario y muestra el mensaje **"Bienvenido, [nombre]"**.
6. Funciona tanto en servidor local como en GitHub Pages.

El cierre de sesión funciona con el botón **"Cerrar sesión"**, que invalida la sesión y limpia el carrito automáticamente.

> No se manejan contraseñas ni tokens manualmente. Auth0 se encarga de toda la seguridad de forma interna.

---

## 2. Selección de productos y carrito de compras

El catálogo muestra 6 productos en 3 categorías. Cada tarjeta incluye imagen, nombre, descripción y precio.

**¿Cómo funciona el carrito?**

1. El usuario hace clic en **"Agregar al carrito"** en cualquier producto.
2. El producto aparece en el panel lateral del carrito.
3. Desde el carrito se puede aumentar o disminuir la cantidad de cada producto.
4. El total se actualiza automáticamente con cada cambio.
5. Al hacer clic en **"Finalizar compra"** se accede al formulario de datos.

---

## 3. Sesión activa con sessionStorage

Para mantener el carrito activo mientras el usuario navega, se utiliza **sessionStorage**, un mecanismo de almacenamiento del navegador.

**¿Cómo funciona?**

- Cada vez que el usuario agrega un producto, este se guarda en sessionStorage.
- Si el usuario navega entre secciones (catálogo, formulario, etc.), el carrito no se pierde.
- Los datos se eliminan automáticamente en dos situaciones:
  - Cuando el usuario **cierra sesión**.
  - Cuando el usuario **completa la compra**.
- Si el usuario cierra la pestaña o el navegador, sessionStorage se borra solo.

---

## Tecnologías utilizadas

- **HTML, CSS y JavaScript** — sin frameworks adicionales.
- **Auth0** — autenticación de usuarios.
- **sessionStorage** — persistencia del carrito durante la sesión.

---

## Autor

**Ignacio de la Vega**  
Curso CIB302 — 2026
