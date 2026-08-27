// Temporary mock data for the dashboard.
// Login/auth will be connected to the backend later, at which point the
// "current user" and their Sacco will come from the authenticated session.

export const currentSacco = {
  id: 1,
  name: "HopOn Sacco",
  contact: "info@hopon.co.ke",
  address: "Nairobi, Kenya",
};

export const currentUser = {
  id: 1,
  sacco_id: 1,
  name: "Jane Kamau",
  email: "jane@hopon.co.ke",
  phone_number: "+254 712 345 678",
  role: "Manager",
  sacco: currentSacco.name,
};

export const users = [
  {
    id: 1,
    sacco_id: 1,
    name: "Jane Kamau",
    email: "jane@hopon.co.ke",
    phone_number: "+254 712 345 678",
    role: "Manager",
  },
  {
    id: 2,
    sacco_id: 1,
    name: "John Otieno",
    email: "john@hopon.co.ke",
    phone_number: "+254 723 456 789",
    role: "Driver",
  },
  {
    id: 3,
    sacco_id: 1,
    name: "Mary Wanjiru",
    email: "mary@hopon.co.ke",
    phone_number: "+254 734 567 890",
    role: "Conductor",
  },
  {
    id: 4,
    sacco_id: 1,
    name: "Peter Mwangi",
    email: "peter@hopon.co.ke",
    phone_number: "+254 745 678 901",
    role: "Driver",
  },
];
