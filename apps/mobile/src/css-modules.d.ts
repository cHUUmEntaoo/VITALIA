// Permitir importaciones de hojas CSS en el proyecto Expo Web.
// Este archivo solo aporta tipos a TypeScript: no modifica estilos ni codigo nativo.
declare module '*.module.css' {
  const classes: { readonly [className: string]: string };
  export default classes;
}

declare module '*.css';
