// Archivo: app/types/routes.ts

// Tu código aquí
export type AppRoutes = {
    login: '/login',
    dashboard: '/dashboard',
    exams: {
      new: '/exams/new',
      view: '/exams/:id',
      list: '/exams',
      track: '/exams/:id/track'
    },
    users: {
      list: '/users',
      edit: '/users/:id',
      new: '/users/new'
    },
    profile: '/profile'
  };