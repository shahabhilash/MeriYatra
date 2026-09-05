export const dummyRoutes = [
  {
    id: 'R-1',
    name: 'Downtown - University',
    stops: ['Downtown Station', 'City Hall', 'Library', 'University Campus'],
    busesAssigned: ['BUS-101'],
  },
  {
    id: 'R-2',
    name: 'Central Station - North Mall',
    stops: ['Central Station', 'Business District', 'North Mall'],
    busesAssigned: ['BUS-204'],
  },
  {
    id: 'R-3',
    name: 'Tech Park - Westside',
    stops: ['Tech Park', 'Innovation Hub', 'Westside Residential'],
    busesAssigned: ['BUS-305'],
  },
];

export const dummyBuses = [
  { id: 'BUS-101', routeId: 'R-1', route: 'Downtown - University', status: 'On Time', eta: '5 min', occupancy: 'Low', lat: 34.0522, lng: -118.2437 },
  { id: 'BUS-204', routeId: 'R-2', route: 'Central Station - North Mall', status: 'Delayed', eta: '12 min', occupancy: 'High', lat: 34.0531, lng: -118.2450 },
  { id: 'BUS-305', routeId: 'R-3', route: 'Tech Park - Westside', status: 'On Time', eta: '2 min', occupancy: 'Medium', lat: 34.0545, lng: -118.2420 },
];
