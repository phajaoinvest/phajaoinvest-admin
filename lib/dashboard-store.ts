import { create } from 'zustand'
// Using browser's global crypto instead of Node.js crypto

export interface Customer {
  id: string // uuid
  first_name: string // varchar
  last_name: string | null // varchar, nullable
  username: string // varchar
  password: string // varchar (hashed in real application)
  email: string // varchar
  phone_number: string | null // varchar, nullable
  status: 'active' | 'inactive' | 'suspended' // public.customer_status_enum
  isVerify: boolean // bool, default false
  profile: string | null // varchar, nullable (profile image URL)
  deleted_by: string | null // uuid, nullable
  created_at: string // timestamp
  updated_at: string // timestamp
}

export interface Staff {
  id: string // uuid
  number: string // varchar (staff number)
  first_name: string // varchar
  last_name: string | null // varchar, nullable
  username: string // varchar
  password: string // varchar (hashed)
  gender: 'male' | 'female' | 'other' // public.users_gender_enum
  tel: string | null // varchar, nullable
  address: string | null // varchar, nullable
  status: 'active' | 'inactive' | 'suspended' // public.users_status_enum
  profile: string | null // varchar, nullable (profile image URL)
  role_id: string | null // uuid, nullable
  admin_role_id: string | null // uuid, nullable
  created_by: string | null // timestamp (who created this staff)
  deleted_by: string | null // timestamp (soft delete)
  created_at: string // timestamp
  updated_at: string // timestamp
}

export interface Package {
  id: string // uuid in database
  service_type: string // public.subscription_type enum
  duration_months: number // int4
  price: number // numeric(10, 2)
  currency: string // varchar(8), default 'USD'
  description: string // text
  active: boolean // bool, default true
  features: string[] // _text array
  created_at?: string // timestamp
  updated_at?: string // timestamp
}

export interface Investment {
  id: string
  customerId: string
  customer_first_name: string
  customer_last_name: string
  total_invested_amount: number
  total_return: number
  current_value: number
  status: 'active' | 'pending' | 'completed' | 'closed'
  created_date: string
  last_updated: string
  investment_count: number // How many individual investments in this account
}

export interface InvestmentTransaction {
  id: string
  investmentAccountId: string
  investment_type: string
  amount: number
  return_amount: number
  return_percentage: number
  start_date: string
  end_date: string | null
  status: 'active' | 'pending' | 'completed' | 'cancelled'
  notes: string | null
}

export interface StockAccount {
  id: string
  customerId: string
  accountNumber: string
  balance: number
  cashBalance: number
  investedAmount: number
  totalStocks: number
  tradingPower: number
  createdDate: string
  status: 'active' | 'suspended' | 'banned'
  lastTradeDate: string | null
}

export interface StockPick {
  id: string // uuid
  stock_symbol: string // varchar(20)
  description: string // text
  status: 'pending' | 'approved' | 'rejected' // public.stock_picks_status_enum
  availability: 'available' | 'sold_out' | 'coming_soon' // public.stock_picks_availability_enum
  service_type: string // public.stock_picks_service_type_enum
  created_by_admin_id: string // uuid
  admin_notes: string | null // text, nullable
  target_price: number | null // numeric(10, 2), nullable
  current_price: number | null // numeric(10, 2), nullable
  expires_at: string | null // timestamp, nullable
  is_active: boolean // bool, default true
  created_at: string // timestamp
  updated_at: string // timestamp
  sale_price: number // numeric(10, 2), default 0
  risk_level: 'low' | 'medium' | 'high' | 'very_high' | null // public.stock_picks_risk_level_enum, nullable
  expected_return_min: number | null // numeric(5, 2), nullable
  expected_return_max: number | null // numeric(5, 2), nullable
  time_horizon_min_months: number | null // int4, nullable
  time_horizon_max_months: number | null // int4, nullable
  sector: string | null // varchar(50), nullable
  analyst_name: string | null // varchar(100), nullable
  tier_label: string | null // public.stock_picks_tier_label_enum, nullable
  key_points: string[] | null // _text array, nullable
  email_delivery: boolean // bool, default true
  company: string | null // varchar(150), nullable
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell' | null // public.stock_picks_recommendation_enum, nullable
}

export interface Payment {
  id: string
  customerId: string
  amount: number
  date: string
  type: 'membership' | 'investment' | 'stock' | 'stock_pick'
  status: 'completed' | 'pending' | 'failed'
}

export interface Role {
  id: string // uuid
  name: string
  description: string
  permissions: string[] // array of permission keys
  created_at: string
  updated_at: string
}

export interface StockTransaction {
  id: string
  stockAccountId: string
  stock_symbol: string
  company_name: string
  transaction_type: 'buy' | 'sell'
  quantity: number
  price_per_share: number
  total_amount: number
  commission_fee: number
  transaction_date: string
  status: 'completed' | 'pending' | 'failed'
  notes: string | null
}

export interface Subscription {
  id: string // uuid
  customerId: string
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  packageId: string
  package_name: string
  package_type: string
  subscription_date: string // timestamp
  expired_date: string // timestamp
  status: 'active' | 'pending' | 'expired' | 'cancelled'
  amount: number
  currency: string
  auto_renew: boolean
  created_at: string
  updated_at: string
}

interface DashboardStore {
  customers: Customer[]
  staff: Staff[]
  roles: Role[]
  packages: Package[]
  investments: Investment[]
  investmentTransactions: InvestmentTransaction[]
  stockAccounts: StockAccount[]
  stockPicks: StockPick[]
  payments: Payment[]
  stockTransactions: StockTransaction[]
  subscriptions: Subscription[]
  addPackage: (pkg: Omit<Package, 'id' | 'created_at' | 'updated_at'>) => void
  updatePackage: (id: string, pkg: Partial<Omit<Package, 'id' | 'created_at' | 'updated_at'>>) => void
  deletePackage: (id: string) => void
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => void
  updateCustomer: (id: string, customer: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>) => void
  deleteCustomer: (id: string) => void
  addStaff: (staff: Omit<Staff, 'id' | 'created_at' | 'updated_at'>) => void
  updateStaff: (id: string, staff: Partial<Omit<Staff, 'id' | 'created_at' | 'updated_at'>>) => void
  deleteStaff: (id: string) => void
  addRole: (role: Omit<Role, 'id' | 'created_at' | 'updated_at'>) => void
  updateRole: (id: string, role: Partial<Omit<Role, 'id' | 'created_at' | 'updated_at'>>) => void
  deleteRole: (id: string) => void
  addStockPick: (pick: Omit<StockPick, 'id' | 'created_at' | 'updated_at'>) => void
  updateStockPick: (id: string, pick: Partial<Omit<StockPick, 'id' | 'created_at' | 'updated_at'>>) => void
  deleteStockPick: (id: string) => void
  updatePaymentStatus: (id: string, status: 'completed' | 'pending' | 'failed') => void
  updateStockAccountStatus: (id: string, status: 'active' | 'suspended' | 'banned') => void
  updateInvestmentStatus: (id: string, status: 'active' | 'pending' | 'completed' | 'closed') => void
  updateSubscriptionStatus: (id: string, status: 'active' | 'pending' | 'expired' | 'cancelled') => void
  deleteSubscription: (id: string) => void
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  customers: [
    {
      id: 'c7f8b9e1-4a3b-4d5e-8f9a-1b2c3d4e5f6a',
      first_name: 'John',
      last_name: 'Doe',
      username: 'johndoe',
      password: 'hashed_password_1',
      email: 'john@example.com',
      phone_number: '+1 (555) 123-4567',
      status: 'active',
      isVerify: true,
      profile: null,
      deleted_by: null,
      created_at: '2024-01-15T10:30:00Z',
      updated_at: '2024-03-15T14:20:00Z',
    },
    {
      id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      first_name: 'Jane',
      last_name: 'Smith',
      username: 'janesmith',
      password: 'hashed_password_2',
      email: 'jane@example.com',
      phone_number: '+1 (555) 234-5678',
      status: 'active',
      isVerify: true,
      profile: null,
      deleted_by: null,
      created_at: '2024-02-20T08:15:00Z',
      updated_at: '2024-03-16T09:45:00Z',
    },
    {
      id: 'f1e2d3c4-b5a6-4978-8e9f-0a1b2c3d4e5f',
      first_name: 'Bob',
      last_name: 'Wilson',
      username: 'bobwilson',
      password: 'hashed_password_3',
      email: 'bob@example.com',
      phone_number: '+1 (555) 345-6789',
      status: 'active',
      isVerify: false,
      profile: null,
      deleted_by: null,
      created_at: '2024-03-10T12:00:00Z',
      updated_at: '2024-03-14T16:30:00Z',
    },
    {
      id: 'e5d4c3b2-a1f0-4e9d-8c7b-6a5f4e3d2c1b',
      first_name: 'Alice',
      last_name: 'Johnson',
      username: 'alicejohnson',
      password: 'hashed_password_4',
      email: 'alice@example.com',
      phone_number: '+1 (555) 456-7890',
      status: 'active',
      isVerify: true,
      profile: null,
      deleted_by: null,
      created_at: '2023-11-05T14:20:00Z',
      updated_at: '2024-03-16T11:00:00Z',
    },
    {
      id: 'd4c3b2a1-f0e9-4d8c-7b6a-5f4e3d2c1b0a',
      first_name: 'Michael',
      last_name: 'Chen',
      username: 'michaelchen',
      password: 'hashed_password_5',
      email: 'michael@example.com',
      phone_number: null,
      status: 'inactive',
      isVerify: false,
      profile: null,
      deleted_by: null,
      created_at: '2024-01-22T09:30:00Z',
      updated_at: '2024-02-28T15:45:00Z',
    },
    {
      id: 'b3a2f1e0-d9c8-4b7a-6f5e-4d3c2b1a0f9e',
      first_name: 'Sarah',
      last_name: 'Williams',
      username: 'sarahwilliams',
      password: 'hashed_password_6',
      email: 'sarah@example.com',
      phone_number: '+1 (555) 678-9012',
      status: 'active',
      isVerify: true,
      profile: null,
      deleted_by: null,
      created_at: '2023-12-10T11:45:00Z',
      updated_at: '2024-03-15T13:20:00Z',
    },
    {
      id: 'a9b8c7d6-e5f4-4a3b-2c1d-0e9f8a7b6c5d',
      first_name: 'David',
      last_name: 'Brown',
      username: 'davidbrown',
      password: 'hashed_password_7',
      email: 'david@example.com',
      phone_number: '+1 (555) 789-0123',
      status: 'suspended',
      isVerify: true,
      profile: null,
      deleted_by: null,
      created_at: '2024-02-14T07:15:00Z',
      updated_at: '2024-03-13T10:30:00Z',
    },
    {
      id: 'f8e7d6c5-b4a3-4928-1e0f-9d8c7b6a5f4e',
      name: 'Emily',
      last_name: 'Davis',
      username: 'emilydavis',
      password: 'hashed_password_8',
      email: 'emily@example.com',
      phone_number: '+1 (555) 890-1234',
      status: 'inactive',
      isVerify: false,
      profile: null,
      deleted_by: null,
      created_at: '2024-01-08T13:00:00Z',
      updated_at: '2024-03-01T17:45:00Z',
    },
  ],
  staff: [
    {
      id: 's1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
      number: 'STF001',
      first_name: 'Admin',
      last_name: 'User',
      username: 'admin',
      password: 'hashed_password_admin',
      gender: 'male',
      tel: '+1 (555) 100-0001',
      address: '123 Admin St, New York, NY 10001',
      status: 'active',
      profile: null,
      role_id: 'r1',
      admin_role_id: 'r1',
      created_by: null,
      deleted_by: null,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2024-03-15T10:00:00Z',
    },
    {
      id: 'f2e3d4c5-b6a7-4e8f-9a0b-1c2d3e4f5a6b',
      number: 'STF002',
      first_name: 'Sarah',
      last_name: 'Johnson',
      username: 'sarahj',
      password: 'hashed_password_sarah',
      gender: 'female',
      tel: '+1 (555) 200-0002',
      address: '456 Staff Ave, Los Angeles, CA 90001',
      status: 'active',
      profile: null,
      role_id: 'r2',
      admin_role_id: null,
      created_by: 's1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
      deleted_by: null,
      created_at: '2023-06-15T00:00:00Z',
      updated_at: '2024-03-14T14:30:00Z',
    },
    {
      id: 'a3b4c5d6-e7f8-4a9b-0c1d-2e3f4a5b6c7d',
      number: 'STF003',
      first_name: 'Michael',
      last_name: 'Chen',
      username: 'michaelc',
      password: 'hashed_password_michael',
      gender: 'male',
      tel: '+1 (555) 300-0003',
      address: null,
      status: 'active',
      profile: null,
      role_id: 'r3',
      admin_role_id: null,
      created_by: 's1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
      deleted_by: null,
      created_at: '2024-01-10T00:00:00Z',
      updated_at: '2024-03-16T09:15:00Z',
    },
  ],
  roles: [
    {
      id: 'r1',
      name: 'Super Admin',
      description: 'Full system access with all permissions',
      permissions: ['view_all', 'create_all', 'edit_all', 'delete_all', 'manage_roles', 'manage_staff'],
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
    {
      id: 'r2',
      name: 'Manager',
      description: 'Manage customers and view reports',
      permissions: ['view_customers', 'create_customers', 'edit_customers', 'view_reports'],
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
    {
      id: 'r3',
      name: 'Support Staff',
      description: 'View customer data and provide support',
      permissions: ['view_customers', 'view_packages', 'view_payments'],
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    },
  ],
  packages: [
    {
      id: 'P001',
      service_type: 'basic',
      duration_months: 1,
      price: 99.99,
      currency: 'USD',
      description: '1-month basic membership for beginners',
      active: true,
      features: [
        'Membership:1month',
        'basicstockanalysistools',
        '5stockpickspermonth',
        'Portfoliotracking',
        'Emailsupport',
      ],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'P002',
      service_type: 'premium',
      duration_months: 3,
      price: 299.99,
      currency: 'USD',
      description: '3-month premium membership with advanced features',
      active: true,
      features: [
        'Membership:3months(save10%)',
        'advancedstockanalysistools',
        'Unlimitedstockpicks',
        'Portfoliotracking',
        'Prioritysupport',
        'CheapermonthlyratethanBasic',
      ],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'P003',
      service_type: 'elite',
      duration_months: 6,
      price: 549.99,
      currency: 'USD',
      description: '6-month elite membership with premium benefits',
      active: true,
      features: [
        'Membership:6months(save20%)',
        'advancedstockanalysistools',
        'Unlimitedstockpicks',
        'Portfoliotracking',
        'Prioritysupport',
        '1-on-1consultations',
        'Customizedstrategies',
      ],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'P004',
      service_type: 'pro',
      duration_months: 12,
      price: 999.99,
      currency: 'USD',
      description: '1-year pro membership with all features included',
      active: true,
      features: [
        'Membership:12months(save30%)',
        'advancedstockanalysistools',
        'Unlimitedstockpicks',
        'Portfoliotracking',
        '24/7prioritysupport',
        'Weeklyconsultations',
        'Exclusivemarketinsights',
        'APIaccess',
      ],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ],
  investments: [
    {
      id: 'inv1',
      customerId: 'c7f8b9e1-4a3b-4d5e-8f9a-1b2c3d4e5f6a',
      customer_first_name: 'John',
      customer_last_name: 'Doe',
      total_invested_amount: 25000,
      total_return: 3500,
      current_value: 28500,
      status: 'active',
      created_date: '2024-01-15',
      last_updated: '2024-03-17',
      investment_count: 3,
    },
    {
      id: 'inv2',
      customerId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      customer_first_name: 'Jane',
      customer_last_name: 'Smith',
      total_invested_amount: 50000,
      total_return: 8200,
      current_value: 58200,
      status: 'active',
      created_date: '2024-02-01',
      last_updated: '2024-03-16',
      investment_count: 5,
    },
    {
      id: 'inv3',
      customerId: 'f1e2d3c4-b5a6-4978-8e9f-0a1b2c3d4e5f',
      customer_first_name: 'Bob',
      customer_last_name: 'Wilson',
      total_invested_amount: 15000,
      total_return: 1800,
      current_value: 16800,
      status: 'active',
      created_date: '2024-01-20',
      last_updated: '2024-03-15',
      investment_count: 2,
    },
    {
      id: 'inv4',
      customerId: 'e5d4c3b2-a1f0-4e9d-8c7b-6a5f4e3d2c1b',
      customer_first_name: 'Alice',
      customer_last_name: 'Johnson',
      total_invested_amount: 75000,
      total_return: 12500,
      current_value: 87500,
      status: 'active',
      created_date: '2023-11-10',
      last_updated: '2024-03-17',
      investment_count: 7,
    },
    {
      id: 'inv5',
      customerId: 'd4c3b2a1-f0e9-4d8c-7b6a-5f4e3d2c1b0a',
      customer_first_name: 'Michael',
      customer_last_name: 'Chen',
      total_invested_amount: 10000,
      total_return: 500,
      current_value: 10500,
      status: 'pending',
      created_date: '2024-03-01',
      last_updated: '2024-03-10',
      investment_count: 1,
    },
    {
      id: 'inv6',
      customerId: 'b3a2f1e0-d9c8-4b7a-6f5e-4d3c2b1a0f9e',
      customer_first_name: 'Sarah',
      customer_last_name: 'Williams',
      total_invested_amount: 35000,
      total_return: 5600,
      current_value: 40600,
      status: 'active',
      created_date: '2023-12-15',
      last_updated: '2024-03-16',
      investment_count: 4,
    },
    {
      id: 'inv7',
      customerId: 'a9b8c7d6-e5f4-4a3b-2c1d-0e9f8a7b6c5d',
      customer_first_name: 'David',
      customer_last_name: 'Brown',
      total_invested_amount: 20000,
      total_return: 2400,
      current_value: 22400,
      status: 'completed',
      created_date: '2023-10-20',
      last_updated: '2024-02-28',
      investment_count: 3,
    },
    {
      id: 'inv8',
      customerId: 'c7f8b9e1-4a3b-4d5e-8f9a-1b2c3d4e5f6a',
      customer_first_name: 'John',
      customer_last_name: 'Doe',
      total_invested_amount: 40000,
      total_return: 6800,
      current_value: 46800,
      status: 'active',
      created_date: '2023-09-15',
      last_updated: '2024-03-17',
      investment_count: 6,
    },
    {
      id: 'inv9',
      customerId: 'f1e2d3c4-b5a6-4978-8e9f-0a1b2c3d4e5f',
      customer_first_name: 'Bob',
      customer_last_name: 'Wilson',
      total_invested_amount: 8000,
      total_return: 640,
      current_value: 8640,
      status: 'pending',
      created_date: '2024-03-05',
      last_updated: '2024-03-12',
      investment_count: 1,
    },
    {
      id: 'inv10',
      customerId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      customer_first_name: 'Jane',
      customer_last_name: 'Smith',
      total_invested_amount: 60000,
      total_return: 10200,
      current_value: 70200,
      status: 'active',
      created_date: '2023-08-22',
      last_updated: '2024-03-16',
      investment_count: 8,
    },
    {
      id: 'inv11',
      customerId: 'e5d4c3b2-a1f0-4e9d-8c7b-6a5f4e3d2c1b',
      customer_first_name: 'Alice',
      customer_last_name: 'Johnson',
      total_invested_amount: 100000,
      total_return: 18000,
      current_value: 118000,
      status: 'active',
      created_date: '2023-07-10',
      last_updated: '2024-03-17',
      investment_count: 10,
    },
    {
      id: 'inv12',
      customerId: 'b3a2f1e0-d9c8-4b7a-6f5e-4d3c2b1a0f9e',
      customer_first_name: 'Sarah',
      customer_last_name: 'Williams',
      total_invested_amount: 28000,
      total_return: 3920,
      current_value: 31920,
      status: 'active',
      created_date: '2024-01-08',
      last_updated: '2024-03-15',
      investment_count: 4,
    },
    {
      id: 'inv13',
      customerId: 'd4c3b2a1-f0e9-4d8c-7b6a-5f4e3d2c1b0a',
      customer_first_name: 'Michael',
      customer_last_name: 'Chen',
      total_invested_amount: 12000,
      total_return: -800,
      current_value: 11200,
      status: 'closed',
      created_date: '2023-06-15',
      last_updated: '2024-01-20',
      investment_count: 2,
    },
    {
      id: 'inv14',
      customerId: 'a9b8c7d6-e5f4-4a3b-2c1d-0e9f8a7b6c5d',
      customer_first_name: 'David',
      customer_last_name: 'Brown',
      total_invested_amount: 45000,
      total_return: 7650,
      current_value: 52650,
      status: 'active',
      created_date: '2023-11-28',
      last_updated: '2024-03-16',
      investment_count: 5,
    },
    {
      id: 'inv15',
      customerId: 'c7f8b9e1-4a3b-4d5e-8f9a-1b2c3d4e5f6a',
      customer_first_name: 'John',
      customer_last_name: 'Doe',
      total_invested_amount: 55000,
      total_return: 9900,
      current_value: 64900,
      status: 'active',
      created_date: '2023-05-20',
      last_updated: '2024-03-17',
      investment_count: 9,
    },
    {
      id: 'inv16',
      customerId: 'f1e2d3c4-b5a6-4978-8e9f-0a1b2c3d4e5f',
      customer_first_name: 'Bob',
      customer_last_name: 'Wilson',
      total_invested_amount: 18000,
      total_return: 2340,
      current_value: 20340,
      status: 'pending',
      created_date: '2024-02-28',
      last_updated: '2024-03-14',
      investment_count: 2,
    },
    {
      id: 'inv17',
      customerId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      customer_first_name: 'Jane',
      customer_last_name: 'Smith',
      total_invested_amount: 32000,
      total_return: 4800,
      current_value: 36800,
      status: 'completed',
      created_date: '2023-04-12',
      last_updated: '2024-01-15',
      investment_count: 4,
    },
    {
      id: 'inv18',
      customerId: 'e5d4c3b2-a1f0-4e9d-8c7b-6a5f4e3d2c1b',
      customer_first_name: 'Alice',
      customer_last_name: 'Johnson',
      total_invested_amount: 85000,
      total_return: 14450,
      current_value: 99450,
      status: 'active',
      created_date: '2023-10-05',
      last_updated: '2024-03-17',
      investment_count: 11,
    },
    {
      id: 'inv19',
      customerId: 'b3a2f1e0-d9c8-4b7a-6f5e-4d3c2b1a0f9e',
      customer_first_name: 'Sarah',
      customer_last_name: 'Williams',
      total_invested_amount: 22000,
      total_return: 2860,
      current_value: 24860,
      status: 'active',
      created_date: '2024-02-10',
      last_updated: '2024-03-15',
      investment_count: 3,
    },
    {
      id: 'inv20',
      customerId: 'a9b8c7d6-e5f4-4a3b-2c1d-0e9f8a7b6c5d',
      customer_first_name: 'David',
      customer_last_name: 'Brown',
      total_invested_amount: 30000,
      total_return: 4500,
      current_value: 34500,
      status: 'active',
      created_date: '2024-01-18',
      last_updated: '2024-03-16',
      investment_count: 4,
    },
  ],
  investmentTransactions: [
    {
      id: 'invtx1',
      investmentAccountId: 'inv1',
      investment_type: 'Fixed Deposit',
      amount: 10000,
      return_amount: 1200,
      return_percentage: 12.00,
      start_date: '2024-01-15',
      end_date: null,
      status: 'active',
      notes: '12-month fixed deposit',
    },
    {
      id: 'invtx2',
      investmentAccountId: 'inv1',
      investment_type: 'Mutual Fund',
      amount: 8000,
      return_amount: 1600,
      return_percentage: 20.00,
      start_date: '2024-02-01',
      end_date: null,
      status: 'active',
      notes: 'Growth-focused mutual fund',
    },
    {
      id: 'invtx3',
      investmentAccountId: 'inv1',
      investment_type: 'Bonds',
      amount: 7000,
      return_amount: 700,
      return_percentage: 10.00,
      start_date: '2024-02-20',
      end_date: null,
      status: 'active',
      notes: 'Government bonds',
    },
    {
      id: 'invtx4',
      investmentAccountId: 'inv2',
      investment_type: 'Real Estate Fund',
      amount: 25000,
      return_amount: 4500,
      return_percentage: 18.00,
      start_date: '2024-02-01',
      end_date: null,
      status: 'active',
      notes: 'Commercial real estate investment',
    },
    {
      id: 'invtx5',
      investmentAccountId: 'inv2',
      investment_type: 'Index Fund',
      amount: 15000,
      return_amount: 2400,
      return_percentage: 16.00,
      start_date: '2024-02-15',
      end_date: null,
      status: 'active',
      notes: 'S&P 500 index tracking',
    },
    {
      id: 'invtx6',
      investmentAccountId: 'inv2',
      investment_type: 'Corporate Bonds',
      amount: 10000,
      return_amount: 1300,
      return_percentage: 13.00,
      start_date: '2024-03-01',
      end_date: null,
      status: 'active',
      notes: 'High-grade corporate bonds',
    },
  ],
  stockAccounts: [
    {
      id: '1',
      customerId: 'c7f8b9e1-4a3b-4d5e-8f9a-1b2c3d4e5f6a',
      accountNumber: 'SA-2024-001',
      balance: 15000,
      cashBalance: 5000,
      investedAmount: 10000,
      totalStocks: 15,
      tradingPower: 20000,
      createdDate: '2024-01-10',
      status: 'active',
      lastTradeDate: '2024-03-15',
    },
    {
      id: '2',
      customerId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      accountNumber: 'SA-2024-002',
      balance: 25000,
      cashBalance: 8000,
      investedAmount: 17000,
      totalStocks: 23,
      tradingPower: 35000,
      createdDate: '2024-02-01',
      status: 'active',
      lastTradeDate: '2024-03-16',
    },
    {
      id: '3',
      customerId: 'f1e2d3c4-b5a6-4978-8e9f-0a1b2c3d4e5f',
      accountNumber: 'SA-2024-003',
      balance: 8500,
      cashBalance: 3500,
      investedAmount: 5000,
      totalStocks: 8,
      tradingPower: 12000,
      createdDate: '2024-02-15',
      status: 'active',
      lastTradeDate: '2024-03-14',
    },
    {
      id: '4',
      customerId: 'e5d4c3b2-a1f0-4e9d-8c7b-6a5f4e3d2c1b',
      accountNumber: 'SA-2024-004',
      balance: 32000,
      cashBalance: 12000,
      investedAmount: 20000,
      totalStocks: 35,
      tradingPower: 45000,
      createdDate: '2023-11-20',
      status: 'active',
      lastTradeDate: '2024-03-17',
    },
    {
      id: '5',
      customerId: 'd4c3b2a1-f0e9-4d8c-7b6a-5f4e3d2c1b0a',
      accountNumber: 'SA-2024-005',
      balance: 5000,
      cashBalance: 2000,
      investedAmount: 3000,
      totalStocks: 4,
      tradingPower: 7000,
      createdDate: '2024-01-28',
      status: 'suspended',
      lastTradeDate: '2024-02-20',
    },
    {
      id: '6',
      customerId: 'b3a2f1e0-d9c8-4b7a-6f5e-4d3c2b1a0f9e',
      accountNumber: 'SA-2023-012',
      balance: 18500,
      cashBalance: 6500,
      investedAmount: 12000,
      totalStocks: 19,
      tradingPower: 25000,
      createdDate: '2023-12-15',
      status: 'active',
      lastTradeDate: '2024-03-16',
    },
  ],
  stockPicks: [
    {
      id: 'sp1',
      stock_symbol: 'AAPL',
      description: 'Apple Inc. - Strong growth potential with new product launches and expanding services revenue.',
      status: 'approved',
      availability: 'available',
      service_type: 'premium',
      created_by_admin_id: 's1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
      admin_notes: 'Recommended for long-term investors',
      target_price: 200.00,
      current_price: 150.25,
      expires_at: '2024-12-31T23:59:59Z',
      is_active: true,
      created_at: '2024-03-01T00:00:00Z',
      updated_at: '2024-03-15T10:30:00Z',
      sale_price: 49.99,
      risk_level: 'medium',
      expected_return_min: 15.00,
      expected_return_max: 30.00,
      time_horizon_min_months: 6,
      time_horizon_max_months: 12,
      sector: 'Technology',
      analyst_name: 'John Smith',
      tier_label: 'gold',
      key_points: [
        'Strong iPhone sales momentum',
        'Growing services revenue',
        'Expanding into VR/AR markets',
        'Solid balance sheet with high cash reserves'
      ],
      email_delivery: true,
      company: 'Apple Inc.',
      recommendation: 'strong_buy',
    },
    {
      id: 'sp2',
      stock_symbol: 'GOOGL',
      description: 'Alphabet Inc. - Leading position in digital advertising and cloud computing with AI innovations.',
      status: 'approved',
      availability: 'available',
      service_type: 'premium',
      created_by_admin_id: 's1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
      admin_notes: 'Great for growth investors',
      target_price: 180.00,
      current_price: 140.50,
      expires_at: '2024-12-31T23:59:59Z',
      is_active: true,
      created_at: '2024-03-01T00:00:00Z',
      updated_at: '2024-03-15T11:00:00Z',
      sale_price: 49.99,
      risk_level: 'medium',
      expected_return_min: 20.00,
      expected_return_max: 35.00,
      time_horizon_min_months: 6,
      time_horizon_max_months: 18,
      sector: 'Technology',
      analyst_name: 'Sarah Johnson',
      tier_label: 'gold',
      key_points: [
        'Dominant search engine market share',
        'Rapidly growing cloud business',
        'AI leadership with Gemini',
        'Strong advertising revenue'
      ],
      email_delivery: true,
      company: 'Alphabet Inc.',
      recommendation: 'buy',
    },
    {
      id: 'sp3',
      stock_symbol: 'TSLA',
      description: 'Tesla Inc. - Electric vehicle leader with energy storage and autonomous driving technology.',
      status: 'pending',
      availability: 'coming_soon',
      service_type: 'elite',
      created_by_admin_id: 's1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c',
      admin_notes: 'High risk, high reward opportunity',
      target_price: 300.00,
      current_price: 175.00,
      expires_at: '2024-09-30T23:59:59Z',
      is_active: true,
      created_at: '2024-03-10T00:00:00Z',
      updated_at: '2024-03-16T14:20:00Z',
      sale_price: 79.99,
      risk_level: 'high',
      expected_return_min: 30.00,
      expected_return_max: 60.00,
      time_horizon_min_months: 12,
      time_horizon_max_months: 24,
      sector: 'Automotive',
      analyst_name: 'Michael Chen',
      tier_label: 'platinum',
      key_points: [
        'Leading EV manufacturer globally',
        'Full self-driving technology advancement',
        'Energy storage business expansion',
        'New gigafactories coming online'
      ],
      email_delivery: true,
      company: 'Tesla Inc.',
      recommendation: 'buy',
    },
  ],
  payments: [
    {
      id: '1',
      customerId: 'c7f8b9e1-4a3b-4d5e-8f9a-1b2c3d4e5f6a',
      amount: 99.99,
      date: '2024-01-15',
      type: 'membership',
      status: 'completed',
    },
    {
      id: '2',
      customerId: 'c7f8b9e1-4a3b-4d5e-8f9a-1b2c3d4e5f6a',
      amount: 5000,
      date: '2024-01-20',
      type: 'investment',
      status: 'completed',
    },
    {
      id: '3',
      customerId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      amount: 299.99,
      date: '2024-03-16',
      type: 'membership',
      status: 'pending',
    },
    {
      id: '4',
      customerId: 'f1e2d3c4-b5a6-4978-8e9f-0a1b2c3d4e5f',
      amount: 10000,
      date: '2024-03-15',
      type: 'investment',
      status: 'pending',
    },
    {
      id: '5',
      customerId: 'e5d4c3b2-a1f0-4e9d-8c7b-6a5f4e3d2c1b',
      amount: 49.99,
      date: '2024-03-17',
      type: 'stock_pick',
      status: 'pending',
    },
    {
      id: '6',
      customerId: 'd4c3b2a1-f0e9-4d8c-7b6a-5f4e3d2c1b0a',
      amount: 2500,
      date: '2024-03-14',
      type: 'stock',
      status: 'pending',
    },
  ],
  stockTransactions: [
    {
      id: 'tx1',
      stockAccountId: '1',
      stock_symbol: 'AAPL',
      company_name: 'Apple Inc.',
      transaction_type: 'buy',
      quantity: 10,
      price_per_share: 150.25,
      total_amount: 1502.50,
      commission_fee: 2.50,
      transaction_date: '2024-03-15T10:30:00Z',
      status: 'completed',
      notes: null,
    },
    {
      id: 'tx2',
      stockAccountId: '1',
      stock_symbol: 'GOOGL',
      company_name: 'Alphabet Inc.',
      transaction_type: 'buy',
      quantity: 5,
      price_per_share: 140.50,
      total_amount: 702.50,
      commission_fee: 2.50,
      transaction_date: '2024-03-10T14:20:00Z',
      status: 'completed',
      notes: 'Long-term investment',
    },
    {
      id: 'tx3',
      stockAccountId: '1',
      stock_symbol: 'MSFT',
      company_name: 'Microsoft Corporation',
      transaction_type: 'sell',
      quantity: 3,
      price_per_share: 420.00,
      total_amount: 1260.00,
      commission_fee: 2.50,
      transaction_date: '2024-03-08T11:15:00Z',
      status: 'completed',
      notes: null,
    },
    {
      id: 'tx4',
      stockAccountId: '2',
      stock_symbol: 'TSLA',
      company_name: 'Tesla Inc.',
      transaction_type: 'buy',
      quantity: 8,
      price_per_share: 175.00,
      total_amount: 1400.00,
      commission_fee: 2.50,
      transaction_date: '2024-03-16T09:45:00Z',
      status: 'completed',
      notes: null,
    },
    {
      id: 'tx5',
      stockAccountId: '2',
      stock_symbol: 'NVDA',
      company_name: 'NVIDIA Corporation',
      transaction_type: 'buy',
      quantity: 15,
      price_per_share: 880.00,
      total_amount: 13200.00,
      commission_fee: 5.00,
      transaction_date: '2024-03-14T15:30:00Z',
      status: 'completed',
      notes: 'AI sector investment',
    },
    {
      id: 'tx6',
      stockAccountId: '3',
      stock_symbol: 'AAPL',
      company_name: 'Apple Inc.',
      transaction_type: 'buy',
      quantity: 5,
      price_per_share: 152.00,
      total_amount: 760.00,
      commission_fee: 2.50,
      transaction_date: '2024-03-14T10:00:00Z',
      status: 'completed',
      notes: null,
    },
    {
      id: 'tx7',
      stockAccountId: '4',
      stock_symbol: 'AMZN',
      company_name: 'Amazon.com Inc.',
      transaction_type: 'buy',
      quantity: 20,
      price_per_share: 175.50,
      total_amount: 3510.00,
      commission_fee: 5.00,
      transaction_date: '2024-03-17T13:20:00Z',
      status: 'completed',
      notes: 'E-commerce growth play',
    },
    {
      id: 'tx8',
      stockAccountId: '4',
      stock_symbol: 'META',
      company_name: 'Meta Platforms Inc.',
      transaction_type: 'sell',
      quantity: 10,
      price_per_share: 485.00,
      total_amount: 4850.00,
      commission_fee: 5.00,
      transaction_date: '2024-03-12T16:45:00Z',
      status: 'completed',
      notes: 'Rebalancing portfolio',
    },
  ],
  subscriptions: [
    {
      id: 'sub1',
      customerId: 'c7f8b9e1-4a3b-4d5e-8f9a-1b2c3d4e5f6a',
      customer_first_name: 'John',
      customer_last_name: 'Doe',
      customer_email: 'john@example.com',
      packageId: 'P001',
      package_name: '1-month basic membership',
      package_type: 'basic',
      subscription_date: '2024-03-01T00:00:00Z',
      expired_date: '2024-04-01T00:00:00Z',
      status: 'active',
      amount: 99.99,
      currency: 'USD',
      auto_renew: true,
      created_at: '2024-03-01T00:00:00Z',
      updated_at: '2024-03-01T00:00:00Z',
    },
    {
      id: 'sub2',
      customerId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      customer_first_name: 'Jane',
      customer_last_name: 'Smith',
      customer_email: 'jane@example.com',
      packageId: 'P002',
      package_name: '3-month premium membership',
      package_type: 'premium',
      subscription_date: '2024-02-15T00:00:00Z',
      expired_date: '2024-05-15T00:00:00Z',
      status: 'active',
      amount: 299.99,
      currency: 'USD',
      auto_renew: true,
      created_at: '2024-02-15T00:00:00Z',
      updated_at: '2024-02-15T00:00:00Z',
    },
    {
      id: 'sub3',
      customerId: 'f1e2d3c4-b5a6-4978-8e9f-0a1b2c3d4e5f',
      customer_first_name: 'Bob',
      customer_last_name: 'Wilson',
      customer_email: 'bob@example.com',
      packageId: 'P001',
      package_name: '1-month basic membership',
      package_type: 'basic',
      subscription_date: '2024-03-10T00:00:00Z',
      expired_date: '2024-04-10T00:00:00Z',
      status: 'pending',
      amount: 99.99,
      currency: 'USD',
      auto_renew: false,
      created_at: '2024-03-10T00:00:00Z',
      updated_at: '2024-03-10T00:00:00Z',
    },
    {
      id: 'sub4',
      customerId: 'e5d4c3b2-a1f0-4e9d-8c7b-6a5f4e3d2c1b',
      customer_first_name: 'Alice',
      customer_last_name: 'Johnson',
      customer_email: 'alice@example.com',
      packageId: 'P003',
      package_name: '6-month elite membership',
      package_type: 'elite',
      subscription_date: '2023-11-01T00:00:00Z',
      expired_date: '2024-05-01T00:00:00Z',
      status: 'active',
      amount: 549.99,
      currency: 'USD',
      auto_renew: true,
      created_at: '2023-11-01T00:00:00Z',
      updated_at: '2023-11-01T00:00:00Z',
    },
    {
      id: 'sub5',
      customerId: 'd4c3b2a1-f0e9-4d8c-7b6a-5f4e3d2c1b0a',
      customer_first_name: 'Michael',
      customer_last_name: 'Chen',
      customer_email: 'michael@example.com',
      packageId: 'P001',
      package_name: '1-month basic membership',
      package_type: 'basic',
      subscription_date: '2024-01-01T00:00:00Z',
      expired_date: '2024-02-01T00:00:00Z',
      status: 'expired',
      amount: 99.99,
      currency: 'USD',
      auto_renew: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-02-01T00:00:00Z',
    },
    {
      id: 'sub6',
      customerId: 'b3a2f1e0-d9c8-4b7a-6f5e-4d3c2b1a0f9e',
      customer_first_name: 'Sarah',
      customer_last_name: 'Williams',
      customer_email: 'sarah@example.com',
      packageId: 'P004',
      package_name: '1-year pro membership',
      package_type: 'pro',
      subscription_date: '2023-12-01T00:00:00Z',
      expired_date: '2024-12-01T00:00:00Z',
      status: 'active',
      amount: 999.99,
      currency: 'USD',
      auto_renew: true,
      created_at: '2023-12-01T00:00:00Z',
      updated_at: '2023-12-01T00:00:00Z',
    },
    {
      id: 'sub7',
      customerId: 'a9b8c7d6-e5f4-4a3b-2c1d-0e9f8a7b6c5d',
      customer_first_name: 'David',
      customer_last_name: 'Brown',
      customer_email: 'david@example.com',
      packageId: 'P002',
      package_name: '3-month premium membership',
      package_type: 'premium',
      subscription_date: '2024-03-05T00:00:00Z',
      expired_date: '2024-06-05T00:00:00Z',
      status: 'pending',
      amount: 299.99,
      currency: 'USD',
      auto_renew: true,
      created_at: '2024-03-05T00:00:00Z',
      updated_at: '2024-03-05T00:00:00Z',
    },
    {
      id: 'sub8',
      customerId: 'c7f8b9e1-4a3b-4d5e-8f9a-1b2c3d4e5f6a',
      customer_first_name: 'John',
      customer_last_name: 'Doe',
      customer_email: 'john@example.com',
      packageId: 'P002',
      package_name: '3-month premium membership',
      package_type: 'premium',
      subscription_date: '2023-12-01T00:00:00Z',
      expired_date: '2024-03-01T00:00:00Z',
      status: 'expired',
      amount: 299.99,
      currency: 'USD',
      auto_renew: false,
      created_at: '2023-12-01T00:00:00Z',
      updated_at: '2024-03-01T00:00:00Z',
    },
  ],
  addPackage: (pkg) =>
    set((state) => ({
      packages: [
        ...state.packages,
        { 
          ...pkg, 
          id: `P${String(state.packages.length + 1).padStart(3, '0')}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    })),
  updatePackage: (id, pkg) =>
    set((state) => ({
      packages: state.packages.map((p) => 
        p.id === id ? { ...p, ...pkg, updated_at: new Date().toISOString() } : p
      ),
    })),
  deletePackage: (id) =>
    set((state) => ({
      packages: state.packages.filter((p) => p.id !== id),
    })),
  addCustomer: (customer) =>
    set((state) => ({
      customers: [
        ...state.customers,
        {
          ...customer,
          id: globalThis.crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    })),
  updateCustomer: (id, customer) =>
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === id ? { ...c, ...customer, updated_at: new Date().toISOString() } : c
      ),
    })),
  deleteCustomer: (id) =>
    set((state) => ({
      customers: state.customers.filter((c) => c.id !== id),
    })),
  addStaff: (staff) =>
    set((state) => ({
      staff: [
        ...state.staff,
        {
          ...staff,
          id: globalThis.crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    })),
  updateStaff: (id, staff) =>
    set((state) => ({
      staff: state.staff.map((s) =>
        s.id === id ? { ...s, ...staff, updated_at: new Date().toISOString() } : s
      ),
    })),
  deleteStaff: (id) =>
    set((state) => ({
      staff: state.staff.map((s) =>
        s.id === id ? { ...s, deleted_by: new Date().toISOString() } : s
      ).filter((s) => !s.deleted_by), // Filter out soft-deleted staff
    })),
  addRole: (role) =>
    set((state) => ({
      roles: [
        ...state.roles,
        {
          ...role,
          id: globalThis.crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    })),
  updateRole: (id, role) =>
    set((state) => ({
      roles: state.roles.map((r) =>
        r.id === id ? { ...r, ...role, updated_at: new Date().toISOString() } : r
      ),
    })),
  deleteRole: (id) =>
    set((state) => ({
      roles: state.roles.filter((r) => r.id !== id),
    })),
  addStockPick: (pick) =>
    set((state) => ({
      stockPicks: [
        ...state.stockPicks,
        {
          ...pick,
          id: globalThis.crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    })),
  updateStockPick: (id, pick) =>
    set((state) => ({
      stockPicks: state.stockPicks.map((sp) =>
        sp.id === id ? { ...sp, ...pick, updated_at: new Date().toISOString() } : sp
      ),
    })),
  deleteStockPick: (id) =>
    set((state) => ({
      stockPicks: state.stockPicks.filter((sp) => sp.id !== id),
    })),
  updatePaymentStatus: (id, status) =>
    set((state) => ({
      payments: state.payments.map((p) =>
        p.id === id ? { ...p, status } : p
      ),
    })),
  updateStockAccountStatus: (id, status) =>
    set((state) => ({
      stockAccounts: state.stockAccounts.map((acc) =>
        acc.id === id ? { ...acc, status } : acc
      ),
    })),
  updateInvestmentStatus: (id, status) =>
    set((state) => ({
      investments: state.investments.map((inv) =>
        inv.id === id ? { ...inv, status, last_updated: new Date().toISOString().split('T')[0] } : inv
      ),
    })),
  updateSubscriptionStatus: (id, status) =>
    set((state) => ({
      subscriptions: state.subscriptions.map((sub) =>
        sub.id === id ? { ...sub, status, updated_at: new Date().toISOString() } : sub
      ),
    })),
  deleteSubscription: (id) =>
    set((state) => ({
      subscriptions: state.subscriptions.filter((sub) => sub.id !== id),
    })),
}))
