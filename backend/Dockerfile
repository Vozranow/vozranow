# Step 1: Use a lightweight Node.js image
FROM node:20-slim

# Step 2: Set the working directory
WORKDIR /app

# Step 3: Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Step 4: Copy the rest of your backend code
COPY . .

# Step 5: Expose the port
EXPOSE 3001

# Step 6: Start the server
CMD ["node", "src/server.js"]