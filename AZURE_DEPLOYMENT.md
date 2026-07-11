# Azure Deployment Guide ☁️🚀

TypeSafari is now configured as a modern serverless application! The frontend is built with React, and the backend is powered by Azure Functions (Node.js) talking to an Azure Cosmos DB.

The absolute easiest and cheapest (Free!) way to host this architecture is using **Azure Static Web Apps**. 

Follow these steps to deploy TypeSafari to the cloud.

---

## Step 1: Create a Cosmos DB Database

Before deploying, we need the cloud database ready so the backend can connect to it.

1. Log into the [Azure Portal](https://portal.azure.com).
2. Search for **Azure Cosmos DB** and click **Create**.
3. Select **Azure Cosmos DB for NoSQL** and click Create.
4. Fill in the details:
   - **Subscription / Resource Group:** Create a new Resource Group (e.g., `TypeSafari-RG`).
   - **Account Name:** Pick a unique name (e.g., `typesafari-db`).
   - **Capacity mode:** Select **Provisioned throughput** and make sure to apply the **Free Tier Discount** if you have it available!
5. Once the database is deployed, click **Go to resource**.
6. On the left menu, click **Data Explorer**.
7. Click **New Container**:
   - **Database id:** type exactly `TypeSafariDB`
   - **Container id:** type exactly `Progress`
   - **Partition key:** type `/id`
   - Click OK.
8. Finally, go to **Keys** on the left menu. Copy your **URI** (Endpoint) and **PRIMARY KEY**. Keep these safe!

---

## Step 2: Deploy to Azure Static Web Apps

Now we deploy the code directly from your GitHub repository.

1. In the Azure Portal, search for **Static Web Apps** and click **Create**.
2. Fill in the basic details (use the same Resource Group you created earlier).
3. **Plan type:** Select **Free**.
4. **Deployment Details:** 
   - Source: **GitHub**
   - Click **Sign in with GitHub** and authorize Azure.
   - Select your Organization, Repository (`Kyur-Shah/typeSafari`), and Branch (`main`).
5. **Build Details:**
   - Build Presets: Select **React**
   - App location: `/`
   - Api location: `api` *(Azure will automatically find our Azure Functions code here!)*
   - Output location: `dist`
6. Click **Review + Create**, then **Create**.

Azure is now writing a GitHub Actions workflow file to your repository and starting the build!

---

## Step 3: Configure Environment Variables

The final step is to securely give your Azure Function the Cosmos DB keys so it can save progress.

1. Once your Static Web App is deployed, click **Go to resource**.
2. On the left menu, under Settings, click **Environment variables**.
3. Add a new variable:
   - **Name:** `COSMOS_ENDPOINT`
   - **Value:** Paste the URI you copied from Cosmos DB earlier.
4. Add another variable:
   - **Name:** `COSMOS_KEY`
   - **Value:** Paste the PRIMARY KEY you copied from Cosmos DB earlier.
5. Click **Apply** and then **Save** at the top.

## You're Done! 🎉

Click the **URL** on the Overview page of your Static Web App. TypeSafari is now live on the internet, and all game progress will instantly sync to your Cosmos DB in the cloud!
