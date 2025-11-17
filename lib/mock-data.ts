// Mock data utilities for demo purposes
// Replace with real API calls in production

export const generateMockCustomers = () => [
  { 
    id: 'C001', 
    name: 'John Doe', 
    email: 'john@example.com', 
    phone: '+1 (555) 123-4567', 
    joinDate: '2024-01-15', 
    status: 'active' as const,
    membershipType: 'Premium',
    totalInvestment: 15000,
    accountBalance: 18500,
    lastLogin: '2024-03-15',
    address: '123 Main St, New York, NY 10001'
  },
  { 
    id: 'C002', 
    name: 'Jane Smith', 
    email: 'jane@example.com', 
    phone: '+1 (555) 234-5678', 
    joinDate: '2024-02-20', 
    status: 'active' as const,
    membershipType: 'Elite',
    totalInvestment: 25000,
    accountBalance: 32000,
    lastLogin: '2024-03-16',
    address: '456 Oak Ave, Los Angeles, CA 90001'
  },
  { 
    id: 'C003', 
    name: 'Bob Wilson', 
    email: 'bob@example.com', 
    phone: '+1 (555) 345-6789', 
    joinDate: '2024-03-10', 
    status: 'active' as const,
    membershipType: 'Basic',
    totalInvestment: 5000,
    accountBalance: 5800,
    lastLogin: '2024-03-14',
    address: '789 Pine Rd, Chicago, IL 60601'
  },
  { 
    id: 'C004', 
    name: 'Alice Johnson', 
    email: 'alice@example.com', 
    phone: '+1 (555) 456-7890', 
    joinDate: '2023-11-05', 
    status: 'active' as const,
    membershipType: 'Premium',
    totalInvestment: 18000,
    accountBalance: 21500,
    lastLogin: '2024-03-16',
    address: '321 Elm St, Houston, TX 77001'
  },
  { 
    id: 'C005', 
    name: 'Michael Chen', 
    email: 'michael@example.com', 
    phone: '+1 (555) 567-8901', 
    joinDate: '2024-01-22', 
    status: 'inactive' as const,
    membershipType: 'Basic',
    totalInvestment: 3000,
    accountBalance: 3200,
    lastLogin: '2024-02-28',
    address: '654 Maple Dr, Phoenix, AZ 85001'
  },
  { 
    id: 'C006', 
    name: 'Sarah Williams', 
    email: 'sarah@example.com', 
    phone: '+1 (555) 678-9012', 
    joinDate: '2023-12-10', 
    status: 'active' as const,
    membershipType: 'Elite',
    totalInvestment: 35000,
    accountBalance: 42000,
    lastLogin: '2024-03-15',
    address: '987 Cedar Ln, Philadelphia, PA 19101'
  },
  { 
    id: 'C007', 
    name: 'David Brown', 
    email: 'david@example.com', 
    phone: '+1 (555) 789-0123', 
    joinDate: '2024-02-14', 
    status: 'active' as const,
    membershipType: 'Premium',
    totalInvestment: 12000,
    accountBalance: 14000,
    lastLogin: '2024-03-13',
    address: '147 Birch St, San Antonio, TX 78201'
  },
  { 
    id: 'C008', 
    name: 'Emily Davis', 
    email: 'emily@example.com', 
    phone: '+1 (555) 890-1234', 
    joinDate: '2024-01-08', 
    status: 'inactive' as const,
    membershipType: 'Basic',
    totalInvestment: 4500,
    accountBalance: 4600,
    lastLogin: '2024-03-01',
    address: '258 Willow Way, San Diego, CA 92101'
  },
]

export const generateMockStaff = () => [
  { id: '1', name: 'Admin User', email: 'admin@example.com', role: 'admin' as const, joinDate: '2023-01-01', status: 'active' as const },
  { id: '2', name: 'Support Staff', email: 'support@example.com', role: 'support' as const, joinDate: '2023-06-15', status: 'active' as const },
]

export const generateMockPackages = () => [
  { id: '1', name: 'Basic', price: 99, benefits: ['Access to stock picks', 'Basic analytics'], duration: 30, status: 'active' as const },
  { id: '2', name: 'Premium', price: 299, benefits: ['All basic features', 'Advanced analytics', 'Priority support'], duration: 30, status: 'active' as const },
  { id: '3', name: 'Elite', price: 599, benefits: ['All premium features', '1-on-1 coaching', 'Custom strategies'], duration: 30, status: 'active' as const },
]
