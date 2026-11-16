import mongoose from "mongoose";

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    // When running inside a Docker container connecting to a Windows-hosted MongoDB
    // with replica set members registered as 'localhost', directConnection=true
    // prevents the driver from attempting to reconnect to container-local loopback.
    if (uri && uri.includes("host.docker.internal") && !uri.includes("directConnection")) {
      uri += (uri.includes("?") ? "&" : "?") + "directConnection=true";
    }

    const conn = await mongoose.connect(uri);
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
