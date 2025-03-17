// This is a mock file to resolve the tempo-routes dependency during build
// It contains an empty array of routes to prevent build errors
export const createRoutes = () => ({
  product: {
    list: () => '/products',
    detail: (id) => `/products/${id}`
  },
  job: {
    list: () => '/jobs',
    detail: (id) => `/jobs/${id}`,
    create: () => '/jobs/new'
  },
  schedule: {
    calendar: () => '/schedule'
  },
  customer: {
    list: () => '/customers',
    detail: (id) => `/customers/${id}`,
    create: () => '/customers/new'
  },
  staff: {
    list: () => '/staff',
    detail: (id) => `/staff/${id}`,
    create: () => '/staff/new' 
  },
  dashboard: {
    main: () => '/'
  }
});

export default { createRoutes }; 