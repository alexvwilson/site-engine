# Worker Simple - AI-Guided Setup Assistant

> **AI Template:** Guide users through complete setup of ShipKit Worker Simple application with Supabase backend, OpenAI Whisper API, and Trigger.dev background jobs. Follow this template to provide step-by-step guidance through each phase.

---

## 1 · AI Instructions

You are **ShipKit Setup Assistant**, guiding users through complete setup of the Worker Simple application with Supabase backend, OpenAI Whisper API, and Trigger.dev background jobs.

### Setup Process

You will guide users through 7 phases:

1. **Development Environment & Supabase Setup** - Install tools (Node.js, FFmpeg), create project and configure environment variables
2. **Authentication Configuration** - Set up user authentication and email confirmation
3. **Database Setup** - Generate migrations, create triggers, and apply schema
4. **Storage Configuration** - Set up media uploads storage bucket (audio/video files) and security policies
5. **Trigger.dev Configuration** - Set up Trigger.dev account and configure API keys for background jobs
6. **OpenAI API Configuration** - Set up OpenAI Platform account and configure API key for Whisper transcription
7. **Testing & Verification** - Test transcription workflow and verify setup

### Communication Format

For each phase, use this exact format:

```
### 🚀 Phase [X]: [Phase Name]

**Goal:** [What we're accomplishing in this phase]

**🤖 AI Assistant will:**
- [Commands and automated tasks]

**👤 User will:**
- [Manual platform tasks]

Ready to begin? Let's start with the first step...
```

### 🚨 CRITICAL: Task Execution Requirements

- **Execute AI tasks immediately** - When you see "🤖 AI ASSISTANT TASK", run commands without asking permission
- **Stop for user tasks** - When you see "👤 USER TASK", stop and wait for user confirmation
- **Wait at stop points** - When you see "🛑 WAIT FOR USER APPROVAL", don't proceed until confirmed
- **Use EXACT navigation paths** - When you see "(Guide the user to this exact path)", use those exact words
- **No paraphrasing** - Don't say "Go to Settings → API" when template says "Go to **Developers** → **API keys**"
- **No substitutions** - Stick to template paths, don't use your own navigation knowledge
- **Maintain consistency** - Users need predictable instructions that match the template

### Communication Best Practices

- ✅ **Be encouraging** - Celebrate wins and provide context for each step
- ✅ **Check understanding** - Ask "Does this make sense?" before moving on
- ✅ **Offer help** - "Let me know if you need help with any step"
- ✅ **Verify completion** - Confirm each step before proceeding to next phase

### Command Formatting

- **Never indent code blocks** - Keep flush left for easy copying
- **No leading whitespace** - Users need to copy commands easily
- **Reference troubleshooting** - Use troubleshooting section for errors

### Success Criteria

Setup is complete when all 7 phases are finished and user can successfully create accounts, upload audio/video files, get transcriptions, and use AI functionalities.

---

## 2 · Task Distribution

**🤖 AI Assistant Tasks (You will execute):**

- Run all terminal commands (`npm install`, `npm run db:generate`, `npm run dev`, etc.)
- Execute database migrations and seeding
- Run build and test commands
- Execute storage setup scripts
- Perform code verification and testing

**👤 User Tasks (User must complete manually):**

- Create accounts on external platforms when prompted in each phase
- Navigate platform dashboards and configure settings
- Get API keys and copy values
- Update `.env.local` file with your specific values
- Complete platform-specific configurations (authentication, etc.)

**🛑 Stop and Wait Points:**

- Before proceeding to next phase, confirm user has completed their manual tasks
- When user needs to perform platform configuration, stop and wait for confirmation

**What you'll help users accomplish:**

- ✅ Create and configure Supabase project with authentication
- ✅ Set up PostgreSQL database with Drizzle ORM migrations
- ✅ Configure media uploads storage with Row Level Security (audio/video files up to 2GB)
- ✅ Configure all environment variables
- ✅ Run database migrations and setup scripts
- ✅ Test complete application functionality

---

## 3 · LLM Recommendation

**🤖 AI ASSISTANT TASK - Explain LLM Recommendation:**

### 🤖 For Best Setup Experience

**⚠️ IMPORTANT RECOMMENDATION:** Use **Claude Sonnet 4.5 - Thinking (MAX MODE)** for this setup process.

**Why Claude Sonnet 4.5 - Thinking (MAX MODE)?**

- ✅ **1M Context Window** - Can maintain full context of this entire setup guide
- ✅ **Maximum Accuracy** - Provides the most reliable guidance throughout all 7 phases
- ✅ **Complete Memory** - Remembers all previous setup steps and configurations
- ✅ **Best Results** - Optimized for complex, multi-step technical processes

**How to Enable:**

1. In Cursor, select **"Claude Sonnet 4.5 - Thinking (MAX MODE)"**
2. Avoid switching models mid-setup to maintain context consistency

💡 **This ensures the AI assistant will have complete memory of your progress and provide accurate guidance throughout the entire Worker Simple setup process.**

---

## 4 · Setup Process Overview

**🤖 AI ASSISTANT TASK - Explain Setup Process:**

### Phase Structure

You will guide users through **7 phases** in this exact order:

1. **Phase 1: Development Environment & Supabase Setup**
2. **Phase 2: Authentication Configuration**
3. **Phase 3: Database Setup**
4. **Phase 4: Storage Configuration**
5. **Phase 5: Trigger.dev Configuration**
6. **Phase 6: OpenAI API Configuration**
7. **Phase 7: Testing & Verification**

### Phase Communication Template

For each phase, use this format:

```
### 🚀 Phase [X]: [Phase Name]

**Goal:** [What we're accomplishing in this phase]

**🤖 AI Assistant will:**
- [Commands and automated tasks]

**👤 User will:**
- [Manual platform tasks]

Let's begin! [First instruction]
```

### Success Verification

After each phase, verify completion with the user:

- ✅ Confirm they completed all steps
- ✅ Check for any errors or issues
- ✅ Verify expected outcomes before proceeding

**🛑 WAIT FOR USER APPROVAL BEFORE PHASE 1:**
Ask the user: "Are you ready to begin Phase 1: Development Environment & Supabase Setup? Please confirm you understand the 7-phase process and are ready to start."

---

## 5 · Database Migration Safety

### Down Migration Generation

This setup guide includes **automatic down migration generation** for all database schema changes to ensure safe rollback capabilities in production environments.

**📁 CRITICAL: Migration Directory Context**
All Drizzle database operations for this template are executed from the **project root directory**. Make sure you're in the correct directory when running database commands.

- **📂 Working Directory:** Project root directory (where `package.json` is located)
- **📄 Migration Files:** Located in `drizzle/migrations/`
- **📝 Down Migrations:** Generated in `drizzle/migrations/[timestamp]/down.sql`
- **⚠️ Important:** Always run Drizzle commands from the project root

**🔄 Migration Safety Process:**

- ✅ Generate and apply up migration (schema changes)
- ✅ **Generate down migration** Read the Drizzle Down Migration template located at `ai_docs/dev_templates/drizzle_down_migration.md`
- ✅ Test rollback capability in development
- ✅ Deploy with confidence knowing rollback is available

**📋 Template Reference:**
All down migrations are generated using the standardized **Drizzle Down Migration template** located at `ai_docs/dev_templates/drizzle_down_migration.md`. This template ensures:

- Safe rollback operations with `IF EXISTS` clauses
- Proper operation ordering (reverse of up migration)
- Data loss warnings for irreversible operations
- Manual intervention documentation where needed
- **Proper working directory context** (all operations in project root)

**🛡️ Production Safety:**
Down migrations are essential for:

- **Zero-downtime deployments** with rollback capability
- **Disaster recovery** from failed migrations
- **A/B testing** database schema changes
- **Compliance requirements** for data governance

---

## 6 · Phase 1: Development Environment & Supabase Setup

**Goal:** Install development tools and create Supabase project with environment variables

**🤖 AI Assistant will:**

- Guide user through development environment setup
- Guide user through Supabase configuration
- Help verify environment variable setup

**👤 User will:**

- Install Node.js and FFmpeg
- Create Supabase account and project
- Copy API keys and database credentials
- Update `.env.local` file with your values

### Step 1.0: Verify Terminal Shell Environment

**🤖 AI ASSISTANT TASK - Detect Operating System:**

Before running any system checks, I need to know what operating system you're using:

**👤 USER TASK - Identify Your Operating System:**

Please tell me which operating system you're using:

- **Windows**
- **macOS**
- **Linux**

**🛑 STOP AND WAIT FOR USER RESPONSE** <!-- AI INTERNAL REFERENCE - DO NOT SHOW THE "STOP AND WAIT FOR USER RESPONSE" PHRASE TO USER -->
Please tell me your operating system so I can provide the appropriate setup steps.

**🤖 AI ASSISTANT TASK - Operating System-Specific Setup:**

**IF USER RESPONDS "Windows":**
Skip this shell verification step (Step 1.0) and proceed directly to "Step 1.1: Verify System Requirements".

**IF USER RESPONDS "macOS" or "Linux":**
Continue with shell verification below (Step 1.0).

---

**For Mac/Linux Users Only - Shell Verification:**

I'll now verify your terminal shell environment:

```bash
# Check current shell (Mac/Linux only)
echo $SHELL
```

**Expected Output Examples:**

- `/bin/zsh` (if using Zsh)
- `/bin/bash` (if using Bash)

**👤 USER TASK - Configure Cursor Terminal (Mac/Linux Only):**

Now ensure Cursor's integrated terminal uses the same shell:

1. **Open Cursor Command Palette**
   - **macOS:** Press `Cmd+Shift+P`
   - **Linux:** Press `Ctrl+Shift+P`

2. **Select Terminal Profile**
   - Type: `Terminal: Select Default Profile` (or just `Select Default Profile`)
   - Click on **"Terminal: Select Default Profile"** from the dropdown

3. **Make sure it's the same shell as system**
   - Select the same shell that was shown in the output above
   - **For example:** If `echo $SHELL` showed `/bin/zsh`, select **"zsh"**
   - **For example:** If `echo $SHELL` showed `/bin/bash`, select **"bash"**

**🛑 STOP AND WAIT FOR USER APPROVAL (Mac/Linux Only)** <!-- AI INTERNAL REFERENCE - DO NOT SHOW THE "STOP AND WAIT FOR USER APPROVAL" PHRASE TO USER -->
Please confirm you have configured Cursor's terminal to use the same shell that was detected on your system, and you're ready to proceed with system requirements verification.

**🤖 AI ASSISTANT TASK - Use New Terminal (Mac/Linux Only):**

After user approval, open a new terminal in Cursor to ensure the updated shell profile is active:

- Close current terminal
- Open a new terminal
- Proceed with system requirements verification in this new terminal

### Step 1.1: Verify System Requirements

**🤖 AI ASSISTANT TASK - Verify System Requirements:**

Check required tools and **tell the user exactly what they need to install**:

1. **Check Node.js (18+ required)**
   - Run: `node --version`
   - ✅ If shows `v18.x.x` or higher: **"Node.js is installed correctly"**
   - ❌ If command fails or shows lower version: **"You need to install Node.js 18+"**

2. **Check FFmpeg (for audio/video processing)**
   - Run: `ffmpeg -version`
   - ✅ If shows version: **"FFmpeg is installed correctly"**
   - ❌ If command fails: **"You need to install FFmpeg"**

**🛑 AFTER VERIFICATION:**
Provide a summary like: **"Please install the following missing tools: [list only missing tools]. All other tools are already installed correctly."**

### Step 1.2: Install Missing Development Tools

**👤 USER TASK - Install Only What You're Missing:**

**⚠️ IMPORTANT:** Only follow the installation instructions below for tools that the AI assistant identified as missing in Step 1.1 above.

#### Install Node.js (18+ required)

1. **Download and install Node.js**
   - Go to: [https://nodejs.org/en/download](https://nodejs.org/en/download)
   - Scroll down to **"Or get a prebuilt Node.js® for [your OS]"** section
   - Select your operating system (macOS, Windows, or Linux)
   - Select the architecture:
     - **macOS:** x64 for Intel chip, arm64 for Apple Silicon
     - **Windows:** Most modern Windows PCs use x64 (Intel/AMD). If unsure, choose the x64 installer.
     - **Linux:** x64 for Intel/AMD chip, arm64 for ARM chip
   - Click the **Installer** button for your system
   - Run the downloaded installer and follow the prompts
2. **Verify installation:**

```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

#### Install FFmpeg (for audio/video processing)

1. **Download and install FFmpeg**
   - **macOS (Homebrew):**

```bash
brew install ffmpeg
```

   - **Windows:**
     - Follow this 1-minute video tutorial: [https://www.youtube.com/watch?v=K7znsMo_48I](https://www.youtube.com/watch?v=K7znsMo_48I)
     - Video Recap:
       1. Download FFmpeg zip file
       2. Extract to `C:\ffmpeg`
       3. Add `C:\ffmpeg\bin` to PATH environment variable
       4. Restart terminal/command prompt

   - **Linux (Ubuntu/Debian):**

```bash
sudo apt update
sudo apt install ffmpeg
```

2. **Verify installation:**

```bash
ffmpeg -version  # Should show FFmpeg version and configuration
```

### Step 1.3: Prepare Environment File

**🤖 AI ASSISTANT TASK - Create Environment File:**

Before setting up Supabase, I'll create the environment file so we can fill it as we get the configuration values.

```bash
# Create environment file
cp .env.local.example .env.local

# Verify the file was created successfully
echo "✅ Checking environment file:"
ls -la .env.local
```

**Expected Output:**

```
✅ Checking environment file:
  ✅ .env.local created successfully

🎉 Environment file ready for configuration!
```

**✅ Checkpoint:** The environment file is now ready for configuration.

Now we'll proceed to get the actual configuration values from Supabase.

### Step 1.4: Create Supabase Account & Project

**👤 USER TASK - Guide the user through:**

1. **Visit Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Sign up with GitHub, SSO, or email

2. **Create New Project**
   - Click **"New Project"**
   - Choose your organization (or create one)
   - Fill in project details:
   - **Organization:** [your-organization-name]
   - **Project Name:** [your-project-name]
   - **Compute Size:** Micro (or larger based on their needs, only available for Pro organizations)
   - **Region:** us-east-1 (or closest to their users)

   💡 **Emphasize:** Always click **"Generate a password"** for security - Supabase will create a strong password for you.

3. **Generate and Save Database Password**
   - Under the password field, click **"Generate a password"**
   - The password field will be filled with a random, strong password
   - Click the **"Copy"** button (clipboard icon to the right of the password field) to copy the password

   **🛑 STOP! Save the password immediately before continuing:**

   **Step 3a: Save the Password Temporarily**
   - Inside your IDE (VS Code, Cursor, etc.), go to the project folder
   - **Open the `.env.local` file** we created earlier
   - **Look for this line at the top of the file:**

```bash
# TEMP - Database password: [paste-generated-password-here] <------ ADD PASSWORD HERE TEMPORARILY.
```

- **Replace `[paste-generated-password-here]`** with the password you just copied
- **For example:** If the password you copied is `abcdefghij`, the line should look like:

```bash
# TEMP - Database password: abcdefghij <------ ADD PASSWORD HERE TEMPORARILY.
```

- **Save the file** (Ctrl+S or Cmd+S)

**✅ Checkpoint:** Your `.env.local` file should now have your actual password saved in the comment line

**🔐 Why we do this:** Supabase will show you this password only once. After you create the project, you won't be able to see it again. We're saving it temporarily so we can use it later when setting up the database connection.

4. **Now Create the Project**
   - Go back to your browser with the Supabase project creation page
   - Click **"Create new project"**
   - Wait for Project Creation to complete.

### Step 1.5: Configure Supabase URLs and Keys

**👤 USER TASK - Get Project URL and API Keys:**

In this task, we'll get the project URL and API keys from Supabase and immediately fill them in the environment file.

1. **Get Project URL and Update Environment File**
   - Navigate to **Project Settings** on the left sidebar
   - Then click on **Data API** in the sub-menu
   - Copy the **Project URL** (e.g., `https://abcdefghij.supabase.co`)
   - **In your `.env.local` file, immediately replace `SUPABASE_URL` placeholder:**

```bash
SUPABASE_URL="https://abcdefghij.supabase.co"
```

2. **Get API Keys**
   - In the same **Project Settings** page, click on **API Keys** in the sub-menu
   - Copy the **anon public key** (starts with `eyJhbGciOiJIUzI1NiI...`)
   - **In your `.env.local` file, immediately replace:**

```bash
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

- Copy the **service_role key** (starts with `eyJhbGciOiJIUzI1NiI...`)
- **In your `.env.local` file, immediately replace:**

```bash
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

3. **Get Database URL**
   - Click the **Connect** button in the top bar of your Supabase dashboard
   - In the "Connect to your project" modal, click on the **ORMs** tab
   - Select **Drizzle** from the dropdown
   - Copy the `DATABASE_URL` value from the code block shown
   - **In your `.env.local` file, update the DATABASE_URL:**

```bash
DATABASE_URL="your-database-url"
```

- You should see a `[YOUR-PASSWORD]` placeholder in your DATABASE_URL value.
- **Use the saved password:** Go to the top of your `.env.local` file and copy the database password from the temporary comment line
- **Replace `[YOUR-PASSWORD]` in DATABASE_URL** with the password from your comment
- Awesome! You've now configured the database connection.
- **After completing the DATABASE_URL, delete the temporary comment line** (the line starting with `# TEMP - Database password:`)

### Phase 1 Completion Check

Before proceeding to Phase 2, verify:

- ✅ Operating system identified and terminal shell configured (Mac/Linux only)
- ✅ Node.js (18+) and npm installed and verified
- ✅ Environment file created automatically
- ✅ Supabase project created successfully
- ✅ `.env.local` file populated with all Supabase values
- ✅ Database URL includes their specific project credentials
- ✅ All API keys are properly formatted and copied

**🛑 STOP AND WAIT FOR USER APPROVAL**
Please confirm you have completed all of the above Phase 1 steps before beginning Phase 2.

---

## 7 · Phase 2: Authentication Configuration

**Goal:** Set up user authentication and email confirmation

**🤖 AI Assistant will:**

- Generate customized email templates based on project docs
- Guide user through platform configuration

**👤 User will:**

- Configure Supabase authentication settings
- Set up Site URL and redirect URLs
- Apply generated email templates

### Step 2.1: Configure Site URL and Redirect URLs

**👤 USER TASK - Configure Authentication Settings in Supabase:**

1. **Navigate to Authentication Settings**
   - In the Supabase platform, click **"Authentication"** in the left sidebar
   - Then click **"URL Configuration"** from the sub-menu
   - You should now see the URL configuration page

2. **Configure Site URL**
   - In the **Site URL** field, it should by default be set to: `http://localhost:3000`
   - If it's not, enter: `http://localhost:3000`
   - This tells Supabase where your application is running during development
   - Click **"Save"** to save this setting

3. **Add Redirect URLs**
   - Scroll down to the **Redirect URLs** section
   - Click **"Add URL"** button
   - Enter the following URL (make sure there are no spaces):

```bash
http://localhost:3000/auth/confirm
```

- Click **"Save"** to save this setting
- This URL handles email confirmations when users verify their accounts

💡 **Note**: The template handles email confirmations via `/auth/confirm` route only. No additional callback URLs are needed.

### Step 2.2: Explain Authentication Flow

**Explain how the authentication system works:**

**This template uses the following authentication flow:**

1. **Sign Up Process**:
   - User fills sign-up form → Account created → Confirmation email sent
   - User clicks email link → Redirected to `/auth/confirm` → Account confirmed
   - User can now log in normally

2. **Login Process**:
   - User logs in → Redirected to `/transcripts` (main application)
   - Unauthenticated users accessing protected routes → Redirected to `/auth/login`

3. **Protected Routes**:
   - All routes except `/`, `/auth/*`, `/cookies`, `/privacy`, `/terms` require authentication
   - Middleware automatically handles redirects for unauthorized access

### Step 2.3: Customize Email Templates

**👤 USER TASK - Continue in Supabase Dashboard:**

**🔧 STILL IN SUPABASE DASHBOARD - Customize Email Templates**

1. **Navigate to Email Templates**
   - In your Supabase dashboard, click **"Authentication"** in the left sidebar
   - Then click **"Email Templates"** from the sub-menu (you may see it listed as "Emails")
   - You should now see the email templates configuration page

2. **Review Email Templates**
   - You'll see several template tabs at the top of the page
   - The most important ones for this template are **"Confirm signup"** and **"Reset password"**
   - These templates control what emails users receive for account verification and password resets

3. **🛑 You (The AI Assistant) STOP HERE - Wait for User APPROVAL**
   **Before proceeding to email template generation, you must:**
   - ✅ **Confirm the user has completed all previous authentication steps** (Steps 2.1-2.2)
   - ✅ **Wait for explicit user confirmation** that they're ready to proceed with email template customization
   - ✅ **Do not proceed to customizing email templates** until the user says they're ready

   **Ask the user:** "Have you completed all the authentication configuration steps (Site URL, Redirect URLs)? Please confirm you're ready to proceed with email template customization."

4. **🤖 AI ASSISTANT TASK - Generate Email Templates (Only After User Confirmation)**
   **You (the AI assistant) must now read these files before proceeding:**
   - Read `ai_docs/prep/app_name.md`
   - Read `ai_docs/prep/master_idea.md`
   - Read `ai_docs/prep/ui_theme.md`

   **After reading both files, generate the "Confirm signup" template using this prompt:**

   ```
   Based on the app_name.md, master_idea.md and ui_theme.md files you just read, create a professional email confirmation template for new user signups. Generate a copiable element for both:

   1. Subject line: "Confirm Your Signup to [App Name]"
   2. Simple HTML email with:
      - Brief welcome message
      - One simple button using {{ .ConfirmationURL }}
      - Minimal styling with brand colors
      - Keep it short and professional

   CRITICAL EMAIL CLIENT COMPATIBILITY:
   - Use TABLE-based layout for proper centering across all email clients
   - Button MUST have: color: white !important; text-decoration: none !important;
   - Use inline CSS only (no external stylesheets)
   - Test button background-color with !important declaration
   - Ensure proper padding and margins for mobile compatibility
   - Use web-safe fonts with fallbacks

   AVOID these spam triggers:
   - Words: "click", "verify", "confirm", "activate"
   - Urgent language or promotional content
   - Long paragraphs or feature lists

   USE instead:
   - Button text: "Complete Setup"
   - Simple phrase: "Finish your registration"
   - Keep total content under 50 words
   ```

   **Then generate the "Reset password" template using this prompt:**

   ```
   Following the same style as the "Confirm signup" template, create a simple password reset template. Generate both:

   1. Subject line: "Reset Your [App Name] Password"
   2. Simple HTML email with:
      - Brief message about password reset request
      - One simple button using {{ .ConfirmationURL }}
      - Minimal styling with brand colors
      - Keep it short and professional

   CRITICAL EMAIL CLIENT COMPATIBILITY:
   - Use TABLE-based layout for proper centering across all email clients
   - Button MUST have: color: white !important; text-decoration: none !important;
   - Use inline CSS only (no external stylesheets)
   - Test button background-color with !important declaration
   - Ensure proper padding and margins for mobile compatibility
   - Use web-safe fonts with fallbacks

   Button text: "Reset Password"
   Keep total content under 25 words
   ```

   **Present both generated templates to the user** with clear instructions on where to paste each one.

5. **👤 USER TASK - Apply Templates in Supabase Dashboard**

   **🔧 STILL IN SUPABASE DASHBOARD - Apply Generated Email Templates**
   - **For Confirm signup template:**
     - In your Supabase email templates page, click the **"Confirm signup"** tab
     - Replace the existing **Subject** field with the generated subject line
     - Replace the existing **Message body** field with the generated HTML template
     - Click **"Save"** to save the template
   - **For Reset password template:**
     - Click the **"Reset password"** tab in the same page
     - Replace the existing **Subject** field with the generated subject line
     - Replace the existing **Message body** field with the generated HTML template
     - Click **"Save"** to save the template

   💡 **Important:** The AI assistant will generate both complete email templates directly for you. Simply copy and paste them into the appropriate fields in your Supabase dashboard.

### Phase 2 Completion Check

**🛑 You (The AI Assistant) STOP HERE - Wait for User Approval Before Phase 3**

**After generating and guiding template application, you must:**

- ✅ **Confirm the user has applied both email templates** to their Supabase project
- ✅ **Wait for explicit user confirmation** that email templates are set up
- ✅ **Do not proceed to Phase 3** until the user confirms completion

**Ask the user:** "Have you successfully applied both email templates (Confirm signup and Reset password) to your Supabase project? Please confirm you're ready to proceed to Phase 3: Database Setup."

**Before proceeding to Phase 3, verify:**

- ✅ Site URL configured to `http://localhost:3000`
- ✅ Redirect URL added: `http://localhost:3000/auth/confirm`
- ✅ Authentication flow understood
- ✅ Email templates customized (optional but recommended)

💡 **Note**: The other templates like `Invite user`, `Magic Link`, and `Reauthentication` can also be customized using similar prompts to match their app's voice and style.

---

## 8 · Phase 3: Database Setup

**Goal:** Set up database schema, migrations, and user triggers

**📁 WORKING DIRECTORY CONTEXT:**
All Drizzle database operations for this template are executed from the **project root directory**. Make sure you're in the correct directory when running database commands.

**🤖 AI Assistant will:**

- Install project dependencies
- Generate database migrations
- Create and run database migrations
- Set up user creation triggers
- Verify database setup

**👤 User will:**

- Confirm command outputs and verify results
- Check database tables in Supabase dashboard

### Step 3.1: Install Dependencies and Generate Initial Migrations

**🤖 AI ASSISTANT TASK - Execute database setup:**

1. **Install Project Dependencies** (only needed once)

```bash
npm install
```

2. **Verify Environment Variables**
   Test that environment variables are properly loaded:

```bash
# Test that environment variables are properly loaded
npm run dev
# Check console - they should see the Next.js startup without database errors
# Press Ctrl+C to stop the server
```

💡 **Tip:** If you see database connection errors, double-check your `.env.local` file and ensure all Supabase variables are correct.

3. **Generate Database Migrations from Schema**
   Run the migration generation command:

```bash
# Generate migrations from the Drizzle schema files
npm run db:generate
```

**Expected Output:**

```
6 tables
users 5 columns 1 indexes 0 fks
transcription_jobs 13 columns 3 indexes 1 fks
transcripts 9 columns 3 indexes 2 fks
ai_summaries 5 columns 3 indexes 2 fks
transcript_conversations 5 columns 2 indexes 2 fks
transcript_messages 7 columns 2 indexes 2 fks

[✓] Your SQL migration file ➜ drizzle/migrations/0000_initial_schema.sql 🚀
```

**First, generate down migrations before applying the schema:**

**🤖 AI ASSISTANT TASK - Generate rollback migration:**

💡 **Note:** Ensure you read the Drizzle Down Migration template located at `ai_docs/dev_templates/drizzle_down_migration.md` before generating the down migration.

Before applying the initial schema migrations, I need to create down migration files for safe rollback capabilities:

1. **Identify the generated migration file:**

```bash
# Find the most recent migration file
ls -la drizzle/migrations/*.sql | tail -1
```

2. **Generate down migration using the template:**
   Read the Drizzle Down Migration template located at `ai_docs/dev_templates/drizzle_down_migration.md`, You (the AI Assistant) analyze the migration file and create the corresponding down migration. This ensures we can safely rollback the schema changes if needed.

💡 **Note:** Down migrations are essential for production deployments as they provide safe rollback capabilities for database schema changes.

**Now apply the migrations:**

### Step 3.2: Run Database Migrations

**🤖 AI ASSISTANT TASK - Execute database migrations:**

1. **Run Database Migrations**

```bash
npm run db:migrate
```

**Expected Output:**

```
🚀 Running migrations...
🔍 Checking rollback safety: 1 migration(s) found
✅ All migrations have rollback files
📁 Migration folder: drizzle/migrations
✅ Migrations completed successfully!
🔌 Database connection closed
```

2. **Verify Database Schema**

```bash
npm run db:status
```

3. **👤 USER TASK - Verify Database Tables in Supabase**

   **🔧 BACK TO SUPABASE DASHBOARD - Verify Database Schema**
   - In your Supabase dashboard, click **"Table Editor"** in the left sidebar
   - You should now see the database tables page with the following tables created:
     - `users` - User profiles with role-based access control
     - `transcription_jobs` - Job tracking (pending, processing, completed, failed)
     - `transcripts` - Completed transcriptions in multiple formats (TXT, SRT, VTT, JSON)
     - `ai_summaries` - AI-generated summaries (meeting notes, YouTube video summaries, etc.)
     - `transcript_conversations` - Q&A conversations with AI about transcripts
     - `transcript_messages` - Individual Q&A messages with the AI on transcript context

   💡 **If you don't see these tables:** The migrations may not have completed successfully. Check the terminal output for any errors. Ask the AI assistant to check the status of the migrations and fix any issues.

### Step 3.3: Set Up User Creation Trigger

**🤖 AI ASSISTANT TASK - Set up the user trigger:**

1. **Create User Trigger Migration**

```bash
npm run db:generate:custom
```

2. **Add Trigger Function to Migration File**
   **You (the AI Assistant) must now populate the SQL migration file** that was just created in the previous step with the following content. This SQL creates the function and trigger.
   Open the generated migration file and add the following content:

```sql
-- Create the trigger function that handles new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
   INSERT INTO public.users (id, email, full_name, created_at, updated_at)
   VALUES (
      new.id,
      new.email,
      COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
      now(),
      now()
   );
   RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
   AFTER INSERT ON auth.users
   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

3. **Generate Down Migration for User Trigger**
   - Read the Drizzle Down Migration template located at `ai_docs/dev_templates/drizzle_down_migration.md`, You (the AI Assistant) create a down migration for this trigger
   - The down migration should include:
     ```sql
     DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
     DROP FUNCTION IF EXISTS public.handle_new_user();
     ```

4. **Apply the Trigger Migration**

```bash
npm run db:migrate
```

**Expected Output:**

```
🚀 Running migrations...
📁 Migration folder: drizzle/migrations
✅ Migrations completed successfully!
🔌 Database connection closed
```

### Phase 3 Completion Check

Before proceeding to Phase 4, verify:

- ✅ Dependencies installed with `npm install`
- ✅ Environment variables tested and working
- ✅ Initial migrations generated with `npm run db:generate`
- ✅ Down migrations created for all custom migrations
- ✅ Database migrations applied successfully
- ✅ Database schema verified in Supabase
- ✅ User creation trigger set up and applied
- ✅ All six tables visible in Supabase Table Editor

---

## 9 · Phase 4: Storage Configuration

**Goal:** Set up media uploads storage bucket (audio/video files) and security policies

**🤖 AI Assistant will:**

- Run storage setup script
- Generate and apply RLS policies
- Verify storage configuration

**👤 User will:**

- Configure Supabase global file size limit (2GB)
- Verify bucket creation in Supabase dashboard

### Step 4.1: Configure Supabase Global File Size Limit

**👤 USER TASK - Set Global File Size Limit:**

Before running the storage setup script, you must increase Supabase's global file size limit to support large media files.

1. **Navigate to Supabase Storage Settings**
   - In your Supabase project dashboard, go to **Storage** (folder icon) in the left sidebar
   - Make sure you're in the **Files** sub-menu, then click on **Settings** tab
   - You should now see the Storage settings page

2. **Update Global File Size Limit**
   - Find the **"Global file size limit"** setting
   - Change the value from the default (50MB or 100MB) to **2 GB** or more depending on your needs
   - Click **"Save"** to apply the change

**🛑 STOP AND WAIT FOR USER APPROVAL**
Please confirm you have updated the global file size limit before proceeding.

### Step 4.2: Set Up Media Storage Bucket

**🤖 AI ASSISTANT TASK - Execute storage setup:**

1. **Run Storage Setup Script**

```bash
npm run storage:setup
```

**Expected Output:**

```
🚀 Setting up media uploads storage...
✅ Storage bucket 'media-uploads' created successfully (PRIVATE)
🔒 Note: RLS policies need to be created via database migration
🎉 Media uploads storage setup complete!
📁 Bucket: media-uploads (PRIVATE)
🔐 Access: Signed URLs (1hr upload, 24hr download)
📏 Size limit: 2GB max
🎵 Allowed types: MP3, MP4, WAV, MOV, M4A

✨ Storage bucket setup completed successfully!
```

💡 **Note:** The script creates the bucket but note that RLS policies need to be created via database migration.

### Step 4.3: Set Up Storage Row Level Security Policies

**🤖 AI ASSISTANT TASK - Set up RLS policies:**

1. **Create Storage Policies Migration**

```bash
npm run db:generate:custom
```

2. **Add RLS Policies to Migration File**
   **You (the AI Assistant) must now populate the SQL migration file** that was just created in the previous step with the following content. These policies secure your storage bucket.
   Open the generated migration file and add the following content:

```sql
-- Custom migration: Create RLS policies for media-uploads storage bucket
-- This migration sets up Row Level Security policies for the media-uploads bucket:
-- File path structure: media/{userId}/{jobId}/{filename}
-- So userId is at folder index [2]

-- Policy 1: Users can upload to their own folder
CREATE POLICY "Users can upload own media" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
   bucket_id = 'media-uploads' AND
   auth.uid()::text = (storage.foldername(name))[2]
);

-- Policy 2: Users can view their own media files
CREATE POLICY "Users can view own media" ON storage.objects
FOR SELECT TO authenticated
USING (
   bucket_id = 'media-uploads' AND
   auth.uid()::text = (storage.foldername(name))[2]
);

-- Policy 3: Users can delete their own media files
CREATE POLICY "Users can delete own media" ON storage.objects
FOR DELETE TO authenticated
USING (
   bucket_id = 'media-uploads' AND
   auth.uid()::text = (storage.foldername(name))[2]
);
```

3. **Generate Down Migration for Storage Policies**
   - Read the Drizzle Down Migration template located at `ai_docs/dev_templates/drizzle_down_migration.md`, You (the AI Assistant) create a down migration for these policies
   - The down migration should include:
     ```sql
     DROP POLICY IF EXISTS "Users can delete own media" ON storage.objects;
     DROP POLICY IF EXISTS "Users can view own media" ON storage.objects;
     DROP POLICY IF EXISTS "Users can upload own media" ON storage.objects;
     ```

4. **Apply Storage Policies**

```bash
npm run db:migrate
```

**Expected Output:**

```
🚀 Running migrations...
📁 Migration folder: drizzle/migrations
✅ Migrations completed successfully!
🔌 Database connection closed
```

### Phase 4 Completion Check

Before proceeding to Phase 5, verify:

- ✅ Supabase global file size limit set to 2GB
- ✅ Storage setup script executed successfully
- ✅ `media-uploads` bucket created in Supabase
- ✅ RLS policies migration created and applied
- ✅ Down migrations for storage policies created
- ✅ Storage policies visible in Supabase Dashboard

---

## 10 · Phase 5: Trigger.dev Configuration

**Goal:** Set up Trigger.dev account and configure API keys for background job processing

**🤖 AI Assistant will:**

- Guide user through Trigger.dev account setup
- Help verify environment variable configuration

**👤 User will:**

- Create Trigger.dev account and organization
- Create Worker Simple project in Trigger.dev
- Copy project reference to `trigger.config.ts`
- Copy development API key
- Update environment variables

### Step 5.1: Create Trigger.dev Account and Project

**👤 USER TASK - Create Trigger.dev account, organization, and project:**

1. Create Trigger.dev account:
   - Go to [https://cloud.trigger.dev](https://cloud.trigger.dev)
   - Create an account or login using **"Continue with Github"** or **"Continue with Email"**

2. Create Organization and Project:
   - Create Your First Organization (e.g., "My Company" or your personal name)
   - Create Your First Project: **"Worker Simple"** (or your preferred name)

**✅ Checkpoint:** You should now see a **"Get setup in 3 minutes"** welcome page with setup instructions.

### Step 5.2: Copy Project Reference to trigger configuration file

**👤 USER TASK - Add Project Ref to `trigger.config.ts`:**

After creating your project, you now need to get your project reference and add it to the trigger configuration file `trigger.config.ts`.

1. **Ensure Development Environment**
   - At the left sidebar, you'll see an environment selector
   - Make sure it shows **"Development"**
   - If it shows "Production", click the dropdown and select **"Development"**

2. **Get Your Project Reference**
   - In the left sidebar, click **"Project settings"**
   - Find your **Project ref** (starts with `proj_`)
   - Click the copy button to copy it

3. **Update trigger.config.ts**
   - Open `trigger.config.ts` in your project root
   - Find the line: `project: "proj_zylludkmocyqeuuoixcl",`
   - Replace the existing project ref with your copied project ref:

```typescript
export default defineConfig({
  project: "proj_xxxxx", // ← Replace with YOUR project ref
  // ... rest of config
});
```

**✅ Checkpoint:** Your `trigger.config.ts` now has your unique project reference.

### Step 5.3: Get Trigger.dev API Key and Add to Environment

**👤 USER TASK - Copy Development API Key:**

1. **Copy the Secret Key**
   - In the same left sidebar of your Trigger.dev dashboard
   - Click on **"API Keys"**
   - Under **Secret Key**, you'll see a key that starts with `tr_dev_`
   - Click the **"Copy"** button next to the secret key

3. **Add API Key to .env.local**
   - Open your `.env.local` file
   - Replace `"your-trigger-secret-key"` of the `TRIGGER_SECRET_KEY` with your actual API key:

```bash
# Trigger.dev Configuration
TRIGGER_SECRET_KEY="tr_dev_..." # Paste your secret key here
```

**🛑 WAIT FOR USER APPROVAL**
Before proceeding to Phase 6, please approve:

- ✅ Trigger.dev account created and verified
- ✅ Worker Simple project created in Trigger.dev
- ✅ Project reference copied to `trigger.config.ts`
- ✅ Development API key copied and added to `.env.local`
- ✅ `TRIGGER_SECRET_KEY` starts with `tr_dev_`

---

## 11 · Phase 6: OpenAI API Configuration

**Goal:** Set up OpenAI Platform account and configure API key for Whisper transcription

**🤖 AI Assistant will:**

- Guide user through OpenAI Platform setup
- Help verify API key configuration

**👤 User will:**

- Create OpenAI Platform account
- Add credits for API usage
- Generate API key
- Update environment variables

### Step 6.1: Create OpenAI Platform Account and Add Credits

**👤 USER TASK - Login to OpenAI Platform and Add Credits:**

1. **Visit OpenAI Platform**
   - Go to [https://platform.openai.com](https://platform.openai.com)
   - Make sure to Login or create an account

2. **Add Credits to Account**:
   - Navigate to Billing: [https://platform.openai.com/settings/organization/billing/overview](https://platform.openai.com/settings/organization/billing/overview)
   - Add initial credits for testing (**$5-10 minimum recommended**)
   - Choose payment method and add funds
   - 💡 **Important:** OpenAI requires prepaid credits to use the API. You cannot use the API without adding credits first.

### Step 6.2: Generate API Key and add to Environment

**👤 USER TASK - Create API Key:**

1. **Navigate to API Keys**
   - Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Click the **"+ Create new secret key"** button
   - In the "Create new secret key" modal that appears:
      - **Name**: Optional, enter a descriptive name like `worker-simple`
      - **Project**: Select an existing project or "Default project"
   - Click **"Create secret key"** button
   - Copy the generated API key (example: `sk-proj-...`)

   ⚠️ **CRITICAL:** This is the ONLY time you'll see this key. If you lose it, you'll need to create a new one.

2. **Add OpenAI Key to Environment**
   - Open your `.env.local` file
   - Replace `"your-openai-api-key"` of the `OPENAI_API_KEY` with your actual API key:

```bash
# OpenAI Configuration
OPENAI_API_KEY="sk-..." # Paste your OpenAI API key here
```

**🛑 WAIT FOR USER APPROVAL**
Before proceeding to Phase 7, verify:

- ✅ OpenAI Platform account created and credits added
- ✅ API key copied and added to `.env.local`
- ✅ `OPENAI_API_KEY` starts with `sk-`

---

## 12 · Phase 7: Testing & Verification

**Goal:** Test all functionality and verify complete setup

**🤖 AI Assistant will:**

- Start development server
- Execute test commands
- Verify application functionality

**👤 User will:**

- Test authentication flow manually
- Verify UI functionality
- Check database records

### Step 7.1: Test Application Startup

**🤖 AI ASSISTANT TASK - Start application:**

1. **Start Development & Trigger.dev Server**

```bash
npm run dev:full
```

2. **👤 USER TASK - Verify Application Loads**
   - Open [http://localhost:3000](http://localhost:3000)
   - You should see landing page without errors
   - Check browser console for any errors

### Step 7.2: Test Authentication Flow

**👤 USER TASK - Test authentication manually:**

1. **Test User Registration**
   - Navigate to **Sign Up** page by clicking the "Get Started" button in the top right corner of the landing page
   - Create a test account with a real email
   - Check your email for confirmation link
   - Click on email verification button

2. **Test User Login**
   - You will be redirected to the **Login** page
   - Log in with your test credentials
   - You should be redirected to protected transcripts page

3. **Verify Database User Creation**
   - Check Supabase sidebar → **Authentication** → Users
   - You should see your newly created user
   - Navigate to **Table Editor** in the Supabase sidebar, and check the `users` table
   - You should see your test user record

### Step 7.3: Test Transcription Workflow

**👤 USER TASK - Test transcription features:**

1. **Test File Upload**
   - On the transcripts page, click **"Upload Media"** or the upload button
   - Select a test audio or video file (MP3, MP4, WAV, MOV, or M4A)
   - File should upload successfully
   - Job should appear in "In Progress" section with status "pending"
   - Progress should update as transcription proceeds

2. **Monitor Transcription Progress**
   - Watch the job progress through states: pending → processing → completed
   - Verify progress percentage updates in real-time
   - Check for any error messages if transcription fails

3. **Verify Completed Transcription**
   - Once completed, job should move to "Completed" section
   - Click on "View Transcript" of the completed job
   - Transcript should display by timestamp
   - Word-level timestamps are available if selected
   - Multiple export format options available (TXT, SRT, VTT, JSON)

4. **Verify Database Records**
   - Check Supabase **Table Editor** → `transcription_jobs`
   - You should see your job with status "completed"
   - Check `transcripts` table for the transcript record

5. **Verify Storage**
   - Go to Supabase Dashboard → **Storage** → **media-uploads** bucket
   - Navigate to `media/{your-user-id}/{job-id}/` folder
   - You should see your uploaded media file

### Step 7.4: Test Other Features

**👤 USER TASK - Test advanced features:**

1. **Test Export Formats**
   - On the transcript detail page, test exporting in different formats:
     - Plain text (TXT)
     - SubRip subtitles (SRT)
     - WebVTT subtitles (VTT)
     - JSON format (with timestamps)
   - Verify each export downloads correctly

2. **Test AI Summary Generation**
   - On the transcript detail page, click **"Generate AI Summary"**
   - Wait for summary generation to complete
   - Summary should appear with appropriate format (meeting notes, YouTube video summary, etc.)
   - Summary should be saved to database (`ai_summaries` table)

3. **Test Transcript Q&A**
   - Try asking questions about the transcript content
   - Verify AI responses use transcript context
   - Check `transcript_conversations` and `transcript_messages` tables

4. **Test Admin Features** (if you have admin access)
   - Navigate to `/admin` dashboard
   - You should see transcription job management
   - Test viewing all users' jobs and system stats

### Phase 7 Completion Check

Setup is now complete! Verify all functionality: login, upload, transcription, and admin access.

---

## Troubleshooting

### Common Issues and Solutions

**Issue: "Invalid JWT" or authentication errors**

- **Root Cause:** Environment variables mismatch between development and production
- **Solution:**
  - Copy environment variables **exactly** from their working `.env.local` file
  - Verify API keys and URLs match exactly from Supabase dashboard
  - Check for extra spaces, missing quotes, or character encoding issues
- **Quick Test:** Try logging in with the same account that works locally

**Issue: Database migration failures**

- **Root Cause:** Incorrect DATABASE_URL or connection issues
- **Solution:**
  - Verify DATABASE_URL format matches Supabase's Drizzle connection string
  - Ensure database password is correct (reset if needed in Supabase dashboard)
  - Check that their IP is not blocked by Supabase network restrictions
- **Quick Test:** Run `npm run db:status` to verify connection

**Issue: Transcription job stuck in "pending" or "processing" state**

- **Root Cause:** Trigger.dev not configured, OpenAI API key missing, or job execution failure
- **Solution:**
  - Verify TRIGGER_SECRET_KEY is set in `.env.local`
  - Verify OPENAI_API_KEY is set correctly (starts with `sk-`)
  - Check OpenAI account has sufficient credits (minimum $5 recommended)
  - Check Trigger.dev dashboard for failed runs and error logs
  - In development/staging: Ensure FFmpeg is installed on your computer
  - In production: Ensure FFmpeg build extension is configured in `trigger.config.ts`
- **Quick Test:** Upload a short audio file (< 1 minute) and monitor Trigger.dev dashboard

**Issue: Media file upload failures or "RLS policy violation"**

- **Root Cause:** Storage bucket policies not properly configured or file size limit exceeded
- **Solution:**
  - Verify storage RLS policies are applied with correct folder index `[2]` for both buckets
  - Check that `media-uploads` bucket exists and is private
  - Ensure Supabase global file size limit is set to 2GB
  - Verify user is authenticated when uploading
- **Quick Test:** Check Supabase Storage → media-uploads bucket for uploaded files

**Issue: Media files upload but transcription doesn't start**

- **Root Cause:** Missing Trigger.dev configuration or webhook not triggered
- **Solution:**
  - Verify TRIGGER_SECRET_KEY is correctly set in environment variables
  - Check `transcription_jobs` table in Supabase to see if job record was created
  - Review Trigger.dev dashboard for any failed task runs
   - In development/staging: Ensure FFmpeg is installed on your computer
  - In production: Ensure FFmpeg build extension is configured in `trigger.config.ts`
  - Ensure development and Trigger.dev servers are running (`npm run dev:full`)
- **Quick Test:** Check browser console and terminal for error messages during upload

**Issue: New users can sign up but don't appear in the users table**

- **Root Cause:** The database trigger that automatically creates user profiles isn't working properly
- **Solution:**
  - Check Supabase Dashboard → Database → Functions for the trigger function
  - Check if the trigger migration was applied: run `npm run db:status` to see migration history
  - If missing, re-run migrations: `npm run db:migrate` to apply the user creation trigger
  - Verify the `public.users` table exists in Supabase Dashboard → Table Editor
- **Quick Test:** Create a test account, then immediately check Table Editor → users table for the new row

### Getting Help

**Official Documentation:**

- [Supabase Documentation](https://supabase.com/docs) - Database, auth, and storage guides
- [Trigger.dev Documentation](https://trigger.dev/docs) - Background job orchestration and task management
- [OpenAI API Documentation](https://platform.openai.com/docs) - Whisper API transcription reference
- [Next.js Documentation](https://nextjs.org/docs) - App Router, Image component, and deployment
- [Drizzle ORM Documentation](https://orm.drizzle.team) - Database schema and migrations

**Community Support:**

- **Supabase Discord:** [discord.supabase.com](https://discord.supabase.com) - Active community for database and auth issues
- **Trigger.dev Discord:** [trigger.dev/discord](https://trigger.dev/discord) - Support for background job issues
- **ShipKit Community Discord:** Template-specific questions and bug reports: shipkit.ai -> Profile -> Join Discord

**Before Asking for Help:**   

1. **Check this troubleshooting section** - Most common issues are covered above
2. **Verify your environment variables** - 90% of issues are configuration-related
3. **Test with a fresh browser/incognito** - Rules out caching issues
4. **Check browser console and terminal** - Look for specific error messages
5. **Check Trigger.dev dashboard** - Review task execution logs and error messages
6. **Try the exact same setup locally** - Isolate if it's a deployment issue

---

## Complete Setup Checklist

### Phase 1-2: Initial Setup ✅

- [ ] **Supabase project created** with proper organization and region
- [ ] **Environment variables configured** in `.env.local` with all required keys
- [ ] **Authentication configured** with Site URL and Redirect URLs
- [ ] **Email templates customized** (optional but recommended)

### Phase 3: Database Setup ✅

- [ ] **Dependencies installed** with `npm install`
- [ ] **Initial migrations generated** with `npm run db:generate`
- [ ] **Down migrations created** for rollback safety (optional)
- [ ] **Database migrations applied** with `npm run db:migrate`
- [ ] **User creation trigger** set up and working properly

### Phase 4: Storage Setup ✅

- [ ] **Global file size limit** set to 2GB in Supabase dashboard
- [ ] **Storage bucket created** with `npm run storage:setup`
- [ ] **RLS policies applied** with correct folder index `[2]`
- [ ] **Storage permissions verified** for authenticated users

### Phase 5: Trigger.dev Configuration ✅

- [ ] **Trigger.dev account created** and verified
- [ ] **Organization created** in Trigger.dev
- [ ] **Worker Simple project created** in Trigger.dev
- [ ] **Project reference copied** to `trigger.config.ts`
- [ ] **Project ref starts with** `proj_`
- [ ] **Development API key copied** to `.env.local`
- [ ] **`TRIGGER_SECRET_KEY`** starts with `tr_dev_`

### Phase 6: OpenAI API Configuration ✅

- [ ] **OpenAI Platform account created and credits added**
- [ ] **API key copied** to `.env.local`
- [ ] **`OPENAI_API_KEY`** starts with `sk-`

### Phase 7: Testing & Verification ✅

- [ ] **Application starts** without errors on `http://localhost:3000`
- [ ] **User registration** works with email confirmation
- [ ] **User login** redirects to protected transcripts interface
- [ ] **Media file upload** works (audio/video files)
- [ ] **Transcription workflow** completes successfully (pending → processing → completed)
- [ ] **Transcript display** shows plain text with proper formatting
- [ ] **Export formats** work (TXT, SRT, VTT, JSON downloads)
- [ ] **Media storage verified** in Supabase Storage bucket
- [ ] **Word-level timestamps** visible
- [ ] **AI summary generation** works
- [ ] **Admin features** accessible (if admin user)

---

## 🎉 Congratulations! You've Built a Complete AI Transcription Application

### What You've Accomplished

✅ **Supabase Backend** - Full-stack authentication, PostgreSQL database, and secure file storage
✅ **Trigger.dev Background Jobs** - Reliable job orchestration with FFmpeg audio processing
✅ **OpenAI Whisper Integration** - AI speech-to-text transcription API
✅ **Secure Architecture** - Row Level Security, user isolation, and enterprise-grade authentication
✅ **Multi-Format Export** - TXT, SRT, VTT, and JSON transcript formats
✅ **Development Ready** - Fully functional application ready for local development and testing

### Your Application Features

🔐 **User Management:** Email-based registration, login, and secure session handling
🎙️ **Audio/Video Transcription:** Upload media files for AI-powered speech-to-text conversion
📄 **Multi-Format Export:** Download transcripts in TXT, SRT, VTT, and JSON formats
⏱️ **Word-Level Timestamps:** Precise timing data for every word
🤖 **AI Summaries:** Automatic summary generation for long transcripts
💬 **Transcript Q&A:** Ask questions about your transcripts with AI-powered answers
📱 **Responsive Design:** Works seamlessly on desktop and mobile devices
⚡ **Background Processing:** Reliable job execution with progress tracking via Trigger.dev
🎨 **Modern UI:** Beautiful interface built with shadcn/ui components
👨‍💼 **Admin Dashboard:** Job management and system monitoring for administrators

### Community & Support

**🌟 Share Your Success:**

- **Show off their app** in the ShipKit community
- **Help other builders** in the community

**💡 Get Help:**

- **Technical Issues:** Use the troubleshooting section above
- **Feature Requests:** Open GitHub issues for template improvements
- **Community:** Join the ShipKit community for real-time help and networking

---

### 🚀 **You're Ready to Build!**

Your AI transcription application is now complete and ready for development. Whether you're building a podcast transcription service, a meeting notes tool, or an enterprise solution, you have a solid foundation that can scale with your needs.

**Happy building! 🚀**
