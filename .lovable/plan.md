## New Onboarding Flow

### Step 1: Role Selection (NEW first step)
- 4 user types: **Teacher**, **Learner**, **School Admin**, **Super Admin**
- Selected role is stored in context before authentication

### Step 2: Signup / Login (role-specific copy)
- **Signup**: Collects name, email, password — copy changes based on selected role (e.g. "Create your Teacher account" vs "Create your Learner account")
- **Login**: Existing users sign in — copy also role-aware
- Profile fields (phone, school, subjects, grade, etc.) collected here as part of signup based on role

### Step 3: OTP Verification
- User verifies their email with 6-digit OTP code

### Step 4: Payment / Plans
- Role-specific plans (current behavior maintained)
- Teachers → Teacher plans
- Learners → Learner plans  
- School Admins → Institutional packages
- Super Admins → Skip payment (go straight to dashboard)

### Step 5: Dashboard
- Redirects to role-specific dashboard (Teacher, Student, School Admin, or Super Admin)

### Files to modify:
- `OnboardingContext.tsx` — reorder steps, store role before auth
- `OnboardingLayout.tsx` — update step rendering order
- `RoleStep.tsx` — add Super Admin option, make it the first step
- `SignupStep.tsx` — add role-specific copy and profile fields
- `SignInStep.tsx` — add role-specific copy
- `Index.tsx` — update onboarding sync logic
- `types/onboarding.ts` — update step order

### Database:
- Update `user_roles` INSERT policy to allow `school_admin` self-insert during onboarding
