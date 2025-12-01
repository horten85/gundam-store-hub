# Gundam Store - Full Stack E-Commerce Platform

## 📋 Project Overview

A full-stack e-commerce platform specializing in Gundam model kits with user authentication, admin management, and shopping cart functionality.

## 🏗️ Architecture

**Important Note**: This project uses **PostgreSQL** (via Supabase/Lovable Cloud) instead of MySQL, but maintains the same database structure and functionality as specified. The frontend and backend are integrated within a single React application.

### Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL database)
- **Authentication**: Supabase Auth
- **State Management**: TanStack Query (React Query)

### Database Structure

#### Products Table
- `id` (UUID, Primary Key)
- `name` (VARCHAR 100)
- `price` (DECIMAL 10,2)
- `grade` (ENUM: 'HG', 'MG', 'SD', 'PG', 'RG')
- `link` (VARCHAR 200, optional)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### Profiles Table
- `id` (UUID, Primary Key, references auth.users)
- `username` (VARCHAR 50, unique)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### User_Roles Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, references auth.users)
- `role` (VARCHAR 20: 'admin' or 'user')
- `created_at` (TIMESTAMP)

#### Cart Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, references auth.users)
- `product_id` (UUID, references products)
- `quantity` (INTEGER)
- `created_at` (TIMESTAMP)

## 🚀 Setup and Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Lovable account (for backend/database)

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone <your-repo-url>
   cd <project-folder>
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Frontend: `http://localhost:8080`
   - The application will automatically connect to the Lovable Cloud backend

## 👥 User Roles and Authentication

### Creating the First Admin User

1. **Sign Up Through the UI**
   - Navigate to `http://localhost:8080/auth`
   - Click "Sign Up" tab
   - Use these credentials:
     - Username: `admin`
     - Email: `admin@gundamstore.com`
     - Password: `1234567890`

2. **Grant Admin Role**
   - After signup, go to Lovable Cloud dashboard
   - Navigate to Database → Tables → `user_roles`
   - Find your user entry (it will have role 'user')
   - Add a new row:
     - user_id: [your user ID from profiles table]
     - role: `admin`

3. **Verify Admin Access**
   - Log out and log back in
   - You should now see the "Admin" button in the header
   - You can now access `/admin` to manage products

### User Types

**Regular Users:**
- Can view products
- Can filter by grade (HG, MG, SD, PG, RG)
- Can add products to cart
- Can checkout (removes products from inventory)

**Admin Users:**
- All regular user permissions
- Can add new products
- Can edit existing products
- Can delete products
- Can promote other users to admin

## 🛠️ Admin Operations

### Accessing Admin Dashboard

1. Log in with admin credentials
2. Click the "Admin" button in the header
3. You'll be redirected to `/admin`

### Adding a Product

1. In Admin Dashboard, click "Add Product"
2. Fill in the form:
   - **Product Name**: Required (max 100 characters)
   - **Price**: Required (decimal number, e.g., 29.99)
   - **Grade**: Required (select from: HG, MG, SD, PG, RG)
   - **Product Link**: Optional (external URL)
3. Click "Add Product"
4. Product will appear in the product list immediately

### Editing a Product

1. In the Admin Dashboard product table
2. Click the pencil icon (✏️) next to the product
3. Modify the fields
4. Click "Update Product"

### Deleting a Product

1. In the Admin Dashboard product table
2. Click the trash icon (🗑️) next to the product
3. Confirm the deletion
4. Product will be removed from the database

### Making Another User an Admin

1. Go to Lovable Cloud dashboard
2. Navigate to Database → Tables → `user_roles`
3. Add a new row:
   - user_id: [target user's ID]
   - role: `admin`
4. The user will have admin privileges on next login

## 🛒 User Shopping Flow

1. **Browse Products**: View all available Gundam model kits
2. **Filter by Grade**: Click grade buttons (HG, MG, SD, PG, RG) to filter
3. **Add to Cart**: Click "Add to Cart" on any product
4. **View Cart**: Click shopping cart icon in header
5. **Checkout**: Click "Complete Purchase" in cart
   - Products are removed from inventory
   - Cart is cleared

## 🎨 Grade System

- **HG** (High Grade) - Red accent
- **MG** (Master Grade) - Green accent
- **SD** (Super Deformed) - Purple accent
- **PG** (Perfect Grade) - Purple accent
- **RG** (Real Grade) - Orange accent

## 🔒 Security Features

- Row Level Security (RLS) policies on all tables
- Admin-only product management
- User-specific cart isolation
- Password hashing via Supabase Auth
- Input validation with Zod schemas

## 📱 Features

### For All Users
- ✅ User registration and authentication
- ✅ Product browsing with grade filtering
- ✅ Shopping cart management
- ✅ Checkout process
- ✅ Responsive design

### For Admins
- ✅ Product CRUD operations
- ✅ User role management
- ✅ Inventory control

## 🐛 Troubleshooting

### Can't See Admin Button
- Verify you have an 'admin' role in the user_roles table
- Try logging out and logging back in

### Products Not Showing
- Check that you're logged in
- Verify products exist in the database
- Check browser console for errors

### Can't Add to Cart
- Ensure you're logged in as a regular user or admin
- Check that the product still exists in inventory

## 📝 Development Notes

### Database vs MySQL
While the original specification called for MySQL, this implementation uses PostgreSQL through Supabase. The benefits include:
- Automatic Row Level Security
- Real-time subscriptions
- Built-in authentication
- Serverless architecture
- No local database setup required

All CRUD operations remain the same, and the database schema matches the original design.

### API Endpoints
The application uses Supabase client library instead of REST endpoints:
- `supabase.from('products').select()` - Get products
- `supabase.from('products').insert()` - Add product
- `supabase.from('products').update()` - Update product
- `supabase.from('products').delete()` - Delete product

## 📦 Building for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## 🤝 Contributing

1. Create a new branch for features
2. Test thoroughly before committing
3. Ensure admin credentials are not hardcoded
4. Follow the existing code style

## 📄 License

This project is for educational purposes.

---

**Need Help?** Check the Lovable documentation or contact support.