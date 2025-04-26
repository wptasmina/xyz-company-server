
### 🏢 xyzCompany - Asset Management System (Server Side)

| **Section**               | **Details**                                                                 |
|---------------------------|-----------------------------------------------------------------------------|
| **🚀 Live Site**          | [xyz_company](https://xyzcompany-9211e.web.app)                             |
| **🛠 Admin Credentials**   | - **Email:** `admin@xyz.com`<br>- **Password:** `Admin123!`                 |
| **📝 Project Overview**    | A full-stack web application for efficient management of company assets. HR Managers can manage assets and employees, while Employees can request, track, and return assets. |
| **🔑 Key Features**        | - Role-based dashboards (HR & Employee)<br> - JWT authentication (email/password & Google login)<br> - CRUD operations with alerts & notifications<br> - Server-side search, filter, pagination<br> - Payment integration for package expansion<br> - Real-time asset tracking with TanStack Query<br> - SEO Optimization with React Helmet |
| **🛠 Technology Stack**    | - **Frontend:** React.js, Tailwind CSS, React Toastify, TanStack Query, React Select, React PDF, React Helmet<br> - **Backend:** Node.js, Express.js, MongoDB (Mongoose), JWT, Axios Interceptors<br> - **Authentication:** Firebase Authentication (Email/Password & Google)<br> - **Deployment:** Vercel (Frontend) & Render (Backend) |

---

### 🧪 How to Run the Server Locally

| **Step**                  | **Commands / Instructions**                                                |
|---------------------------|---------------------------------------------------------------------------|
| **1. Clone the Server Repo** | `git clone https://github.com/wptasmina/xyz-company-server`               |
| **2. Setup Backend**       | - Navigate to server folder: `cd xyz-company-server`<br>- Install dependencies: `npm install`<br>- Create a `.env` file with:<br>```env<br>PORT=5000<br>JWT_SECRET=your_jwt_secret<br>MONGO_URI=your_mongo_uri<br>```<br>- Start the server: `nodemon index.js` |

---

### 💳 Payment System Details

| **Feature**               | **Description**                                                            |
|---------------------------|----------------------------------------------------------------------------|
| **Package Purchase**      | HR Managers can buy employee packages (5, 10, or 20) to increase their team size. |
| **Secure Transactions**   | Payment gateway integration ensures secure transactions.                   |
| **Instant Updates**       | New employee slots are immediately reflected after successful payment.     |

---

### 🎯 Challenges Successfully Handled

| **Challenge**             | **Solution**                                                               |
|---------------------------|-----------------------------------------------------------------------------|
| **Advanced Server-Side Pagination** | Handled on server to manage large data efficiently.                       |
| **JWT Secured Routes**    | All protected routes secured via JSON Web Tokens.                          |
| **SEO Optimization**      | React Helmet used for dynamic meta tags.                                   |
| **Bulk Employee Upload**  | Enabled HR Managers to add multiple employees at once.                     |
| **Database Query Optimization** | MongoDB queries optimized for faster response times.                      |

---

### 📤 Repositories and Live Links

| **Type**                  | **Link**                                                                  |
|---------------------------|---------------------------------------------------------------------------|
| **Frontend Repository**    | [xyz-company-client](https://github.com/wptasmina/xyz-company-client)     |
| **Backend Repository**     | [xyz-company-server](https://github.com/wptasmina/xyz-company-server)     |
| **Live Site**              | [xyz_company](https://xyzcompany-9211e.web.app)                           |

---

