// anyname.d.ts - place this anywhere in your project
declare namespace React {
  interface HTMLAttributes<T> {
    // Preact supports using "class" instead of "classname" - need to teach typescript
    class?: string;
  }
}