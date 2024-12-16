# Pasos para tu colaborador

### **1. Asegurarse de estar en la rama `main`**
```bash
git checkout main
```

### **2. Actualizar la rama `main` con los últimos cambios del remoto**
```bash
git pull origin main
```

### **3. Crear una nueva rama basada en `main`**
```bash
git checkout -b nombre-de-rama
```

### **4. Trabajar en el issue**
Realizar los ajustes necesarios en el código.

### **5. Añadir los cambios al área de staging**
```bash
git add .
```

### **6. Hacer un commit con un mensaje descriptivo del ajuste**
```bash
git commit -m "datos del ajuste"
```

### **7. Subir la rama al remoto y configurar el upstream**
```bash
git push -u origin nombre-de-rama
```

### **8. Crear un Pull Request (PR) en GitHub**
- Ir al repositorio en GitHub.
- Crear un nuevo PR desde la rama creada hacia `main`.
- Asignar un revisor para que apruebe el PR.

### **9. Cuando el PR esté aprobado y mergeado**

a) Cambiar a la rama `main`:
```bash
git checkout main
```

b) Traer los últimos cambios de `main` desde el remoto:
```bash
git pull origin main
```

c) Eliminar la rama localmente:
```bash
git branch -d nombre-de-rama
```

d) Eliminar la rama remota (opcional, pero recomendado si no se elimina automáticamente):
```bash
git push origin --delete nombre-de-rama
```

---

### **Comentarios adicionales**

1. **Antes de comenzar el trabajo, sincronizar `main`:**
   - Esto asegura que la rama nueva esté basada en la última versión de `main`, evitando conflictos innecesarios.

2. **Usar nombres de ramas descriptivos:**
   - Ejemplo: `feature/descripcion-del-issue` o `fix/descripcion-del-bug`.

3. **Asegurarse de que las pruebas pasen (opcional pero recomendado):**
   - Antes de hacer el commit, correr pruebas locales o linting si aplica.

4. **Eliminar la rama remota después del merge:**
   - Si GitHub está configurado para eliminar ramas fusionadas automáticamente, el paso 9d no será necesario.

5. **Contribuir al mensaje del commit:**
   - Incluir el número del issue en el mensaje (si se usa un sistema de gestión como GitHub Issues):
     ```bash
     git commit -m "Fix #123: Detalle del ajuste"
     