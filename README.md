# To Do List con Docker

Este proyecto es una aplicación simple de To Do List compuesta por **3 contenedores**:

- **Frontend (React)**: Se encarga de mostrar la interfaz de usuario y consumir la API del backend.
- **Backend (Express + Node.js)**: Expone endpoints para obtener y agregar tareas en la base de datos.
- **Base de datos (PostgreSQL)**: Guarda de forma persistente las tareas.

## 🔗 Interacción entre contenedores

- El **frontend** llama al **backend** usando fetch a `http://localhost:5000`.
- El **backend** se conecta al **contenedor de PostgreSQL** usando variables de entorno (`DB_HOST=db`).
- Los tres contenedores están definidos en `docker-compose.yml`, lo cual facilita la comunicación interna en la red de Docker.

## ▶️ Cómo ejecutar

```bash
docker-compose up --build
```

kubectl port-forward service/todo-backend 5000:5000 &
kubectl port-forward service/todo-frontend 30080:5173 &
