// server.js
require("dotenv").config(); // Load environment variables
const express = require("express");
const cors = require("cors");
const { BigQuery } = require("@google-cloud/bigquery");
const { Storage } = require("@google-cloud/storage");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");

// const {
//   getFirestore,
//   doc,
//   setDoc,
//   collection,
//   getDocs,
//   getDoc,
// } = require("firebase/firestore");

const admin = require("firebase-admin");
const serviceAccountFirestore = require("/Users/widhardwiatmoko/Downloads/personalproject-52258-39405e6cbcb6.json");
const { time } = require("console");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountFirestore),
});
const { doc, query, getDocs, getDoc, collection } = admin.firestore; // Import the 'doc' function from the Admin SDK

const app = express();
app.use(express.json());
app.use(cookieParser());

const corsOptions = {
  origin: "http://localhost:3000", // Replace with your frontend's origin
  credentials: true, // Allow credentials (cookies) to be sent
};

app.use(cors(corsOptions));

const db = admin.firestore(); // Get a Firestore instance

// Use environment variables

// Middleware to verify Firebase ID token

app.use(async (req, res, next) => {
  const idToken = req.cookies.authToken || req.headers.authorization; // Get token from cookie or header

  if (idToken) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      req.user = decodedToken;
      // console.log(req.user);
    } catch (error) {
      console.error("Error verifying token:", error);
      // Optionally, clear the invalid token cookie
      res.clearCookie("authToken");
      return res.status(401).json({ error: "Unauthorized" });
    }
  }
  next();
});
app.post("/set-auth-token", async (req, res, next) => {
  const idToken = req.headers.authorization;

  if (idToken) {
    try {
      // Verify the ID token using admin.auth().verifyIdToken
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      // Set the token in a cookie (adjust options as needed)
      const options = {
        httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
        // secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
        maxAge: 60 * 60 * 24 * 5 * 1000, // 5 days (adjust as needed)
        // ... other options (e.g., sameSite, domain) if required
      };
      res.cookie("authToken", idToken, options);

      res.json({ message: "Token set successfully" });
    } catch (error) {
      console.error("Error verifying token:", error);
      // Handle specific errors, e.g., invalid token, expired token
      if (error.code === "auth/id-token-expired") {
        return res
          .status(401)
          .json({ error: "Token expired. Please login again." });
      } else if (error.code === "auth/invalid-token") {
        return res.status(401).json({ error: "Invalid token." });
      } else {
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

app.get("/project-setup", async (req, res, next) => {
  try {
    const userDoc = await db.collection("users").doc(req.user.uid).get();
    if (!userDoc.exists) {
      return res.status(404).send("User document not found!");
    }

    const projectSetupDoc = await db
      .collection("project_setups")
      .doc(req.user.uid)
      .get();

    if (!projectSetupDoc.exists) {
      return res.status(404).send("Project setup document not found!");
    }

    res.status(200).send(projectSetupDoc.data());
  } catch (error) {
    res.status(500).send("Error fetching project setup data: " + error);
  }
  next();
});

// Route to handle report creation/update
app.post("/submit-report", async (req, res, next) => {
  const {
    reportName,
    dimensions,
    metric,
    refreshTime,
    projectId,
    datasetId,
    tableId,
    serviceAccount,
    isEditing,
    initialResultId,
    initialReportId,
    bigqueryData,
  } = req.body;

  const currentDateTime = new Date().toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  try {
    const userDoc = await db.collection("users").doc(req.user.uid).get();
    const companyName = userDoc.data().companyName;

    if (isEditing) {
      if (initialResultId) {
        console.log(initialResultId);
        const resultCollection = db.collection(initialResultId);
        const resultDocs = await resultCollection.get();

        const batch = db.batch();
        resultDocs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();

        for (const row of req.body.bigqueryData) {
          await resultCollection.add(row);
        }

        const liveReportDocRef = db
          .collection("Live Report")
          .doc(initialReportId);
        await liveReportDocRef.update({
          reportName,
          dimensions,
          metric,
          refreshTime,
          dateLastRun: currentDateTime,
          resultId: initialResultId,
        });

        res.status(200).send("Report updated successfully!");
      }
    } else {
      const newCollectionId = `${companyName}-${uuidv4()}`;
      console.log(newCollectionId);
      const resultsCollection = db.collection(newCollectionId);

      for (const row of req.body.bigqueryData) {
        await resultsCollection.add(row);
      }

      const liveReportData = {
        reportName,
        dimensions,
        metric,
        refreshTime,
        timestamp: currentDateTime,
        dateLastRun: currentDateTime,
        resultId: newCollectionId,
      };

      await db.collection("Live Report").add(liveReportData);

      res.status(200).send("New report created successfully!");
    }
  } catch (error) {
    res.status(500).send("Error submitting report: " + error);
  }
  next();
});

app.get("/report/:reportId", async (req, res, next) => {
  const { reportId } = req.params;

  try {
    const docRef = db.collection("Live Report").doc(reportId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      res.status(200).json(docSnap.data());
    } else {
      res.status(404).send("No such document!");
    }
  } catch (error) {
    res.status(500).send("Error fetching data: " + error);
  }
  next();
});

// Get list of reports from Firestore
app.get("/get-reports", async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Fetch the company name from the "users" collection
    const userDocRef = db.collection("users").doc(user.uid); // Use admin.firestore().doc()
    const userDocSnap = await userDocRef.get();

    if (!userDocSnap.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const companyName = userDocSnap.data().companyName;

    // Fetch reports from Firestore based on companyName
    const reportsQuery = db
      .collection("Live Report")
      .where("resultId", ">=", `${companyName}-`)
      .where("resultId", "<=", `${companyName}-\uf8ff`);

    const querySnapshot = await reportsQuery.get();

    const reports = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      reports.push({
        id: doc.id,
        reportName: data.reportName,
        timestamp: data.timestamp,
        dateLastRun: data.dateLastRun,
        resultId: data.resultId,
        refreshTime: data.refreshTime,
      });
    });

    res.json({ reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
  next();
});

app.get("/live-report/:reportId", async (req, res, next) => {
  try {
    const { reportId } = req.params;

    const liveReportDoc = await db
      .collection("Live Report")
      .doc(reportId)
      .get();
    if (!liveReportDoc.exists) {
      return res.status(404).send("Live report document not found!");
    }

    const liveReportData = liveReportDoc.data();
    const formattedLastRunTime = new Date(
      liveReportData.dateLastRun
    ).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const resultCollection = await db.collection(liveReportData.resultId).get();
    const queryResults = resultCollection.docs.map((doc) => doc.data());

    res.status(200).json({
      ...liveReportData,
      queryResults,
      dateLastRun: formattedLastRunTime,
    });
  } catch (error) {
    res.status(500).send("Error fetching live report data: " + error);
  }
  next();
});

// SSE endpoint to subscribe to real-time updates
app.get("/subscribe-report/:reportId", (req, res, next) => {
  const reportId = req.params.reportId;
  const liveReportDocRef = db.collection("Live Report").doc(reportId);
  const resultCollectionRef = db.collection(reportId);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const unsubscribeLiveReport = liveReportDocRef.onSnapshot(
    async (liveReportDoc) => {
      if (liveReportDoc.exists) {
        const liveReportData = liveReportDoc.data();
        const resultCollection = await resultCollectionRef.get();
        const queryResults = resultCollection.docs.map((doc) => doc.data());

        res.write(
          `data: ${JSON.stringify({ ...liveReportData, queryResults })}\n\n`
        );
      }
    }
  );

  req.on("close", () => {
    unsubscribeLiveReport();
    res.end();
  });
  next();
});

// Route to get user-specific project setup data

app.delete("/delete-reports", async (req, res, next) => {
  try {
    const { reportIds } = req.body;

    const deletePromises = reportIds.map(async (reportId) => {
      // 1. Get the resultId from the "Live Report" document
      const liveReportDocRef = db.collection("Live Report").doc(reportId);
      const liveReportDocSnap = await liveReportDocRef.get();
      const resultId = liveReportDocSnap.data().resultId;

      // 2. Delete the "Live Report" document
      await liveReportDocRef.delete();

      // 3. Delete the corresponding "report_results" collection (and its documents)
      if (resultId) {
        const resultCollectionRef = db.collection(resultId);
        const resultDocsSnapshot = await resultCollectionRef.get();
        const deleteRowPromises = resultDocsSnapshot.docs.map(async (doc) => {
          await doc.ref.delete();
        });
        await Promise.all(deleteRowPromises);
      }
    });

    await Promise.all(deletePromises);

    res.json({ message: "Reports and their results deleted successfully" });
  } catch (error) {
    console.error("Error deleting reports:", error);
    res.status(500).json({ error: "Failed to delete reports" });
  }
  next();
});

// // Save or update report in Firestore
// app.post("/save-report", async (req, res) => {
//   try {
//     const {
//       reportName,
//       dimensions,
//       metric,
//       refreshTime,
//       results,
//       timestamp,
//       dateLastRun,
//       isEditing,
//       reportId,
//     } = req.body;

//     let resultDocRef;

//     if (isEditing && reportId) {
//       // Editing existing report

//       // 1. Update the existing "Report Result" document
//       resultDocRef = db.collection("Report Result").doc(reportId);
//       await resultDocRef.set(
//         {
//           results, // Update the results
//           timestamp,
//           dateLastRun,
//         },
//         { merge: true }
//       );

//       // 2. Update the existing "Live Report" document
//       const liveReportDocRef = db.collection("Live Report").doc(reportId);
//       await liveReportDocRef.set(
//         {
//           reportName,
//           dimensions,
//           metric,
//           refreshTime,
//           timestamp,
//           dateLastRun,
//           // resultId remains the same
//         },
//         { merge: true }
//       );

//       res.json({ message: "Report updated successfully" });
//     } else {
//       // Creating a new report

//       // 1. Generate a unique collection name for results
//       const user = await admin.auth().verifyIdToken(req.headers.authorization);
//       const userDocRef = db.collection("users").doc(user.uid);
//       const userDocSnap = await getDoc(userDocRef);
//       const companyName = userDocSnap.data().companyName;
//       const resultsCollectionName = `${companyName}-${uuidv4()}`;

//       // 2. Save each row of query results as a separate document in the new collection
//       const resultsCollectionRef = db.collection(resultsCollectionName);
//       const saveResultPromises = results.map(async (row) => {
//         await addDoc(resultsCollectionRef, row);
//       });
//       await Promise.all(saveResultPromises);

//       // 3. Create new "Live Report" document
//       const liveReportData = {
//         reportName,
//         dimensions,
//         metric,
//         refreshTime,
//         timestamp,
//         dateLastRun,
//         resultId: resultsCollectionName, // Store the collection name as resultId
//       };
//       await addDoc(collection(db, "Live Report"), liveReportData);

//       res.json({ message: "Report created successfully" });
//     }
//   } catch (error) {
//     console.error("Error saving report:", error);
//     res.status(500).json({ error: "Failed to save report" });
//   }
// });

// Logout endpoint
app.post("/logout", (req, res) => {
  res.clearCookie("authToken"); // Clear the authToken cookie
  res.json({ message: "Logout successful" });
});

// Metric Aggregations
const metricAggregations = {
  total_users: "COUNT(DISTINCT user_pseudo_id) AS total_users",
  revenue: "SUM(ecommerce.purchase_revenue) AS total_revenue",
  event_count: "COUNT(*) AS total_events",
  views:
    "COUNTIF(event_name = 'page_view' OR event_name = 'screen_view') AS total_views",
};

app.post("/query-bigquery", async (req, res) => {
  try {
    const {
      dimensions,
      metric, // Now an array of metrics
      refreshTime,
      projectId,
      datasetId,
      tableId,
      serviceAccount,
    } = req.body;
    console.log(dimensions);

    // Create BigQuery client
    // const bigqueryClient = serviceAccount
    //   ? new BigQuery({
    //       projectId,
    //       credentials: JSON.parse(serviceAccount),
    //     })
    //   : defaultBigqueryClient;

    const bigqueryClient = new BigQuery({
      projectId,
      credentials: JSON.parse(serviceAccount),
    });

    // Modify dimensions for special cases and include channel_grouping_user calculation
    const modifiedDimensions = dimensions.map((dimension) => {
      if (dimension === "city") {
        return "geo.city";
      } else if (dimension === "sessionSourceMedium") {
        return `CONCAT(traffic_source.source, '/', traffic_source.medium) AS session_source_medium`;
      } else if (dimension === "channelGroup") {
        return `
          CASE
            WHEN (traffic_source.source IS NULL OR traffic_source.source = '(direct)') AND (traffic_source.medium IS NULL OR traffic_source.medium IN ('(not set)', '(none)')) THEN 'Direct'
            WHEN traffic_source.name LIKE '%cross-network%' THEN 'Cross-network'
            WHEN (REGEXP_CONTAINS(traffic_source.source, 'alibaba|amazon|google shopping|shopify|etsy|ebay|stripe|walmart') OR REGEXP_CONTAINS(traffic_source.name, '^(.*(([^a-df-z]|^)shop|shopping).*)$')) AND REGEXP_CONTAINS(traffic_source.medium, '^(.*cp.*|ppc|retargeting| paid.*)$') THEN 'Paid Shopping'
            WHEN REGEXP_CONTAINS(traffic_source.source, 'baidu|bing|duckduckgo|ecosia|google|yahoo|yandex') AND REGEXP_CONTAINS(traffic_source.medium, '^(.*cp.*|ppc|retargeting| paid.*)$') THEN 'Paid Search'
            WHEN REGEXP_CONTAINS(traffic_source.source, 'badoo|facebook|fb|instagram|linkedin|pinterest|tiktok|twitter|whatsapp') AND REGEXP_CONTAINS(traffic_source.medium, '^(.*cp.*|ppc|retargeting| paid.*)$') THEN 'Paid Social'
            WHEN REGEXP_CONTAINS(traffic_source.source, 'dailymotion|disneyplus|netflix|youtube|vimeo|twitch|vimeo|youtube') AND REGEXP_CONTAINS(traffic_source.medium, '^(.*cp.*|ppc|retargeting| paid.*)$') THEN 'Paid Video'
            WHEN traffic_source.medium IN ('display', 'banner', 'expandable', 'interstitial', 'cpm') THEN 'Display'
            WHEN REGEXP_CONTAINS(traffic_source.medium, '^(.*cp.*|ppc|retargeting|paid.*)$') THEN 'Paid Other'
            WHEN REGEXP_CONTAINS(traffic_source.source, 'alibaba|amazon|google shopping|shopify|etsy|ebay|stripe|walmart') OR REGEXP_CONTAINS(traffic_source.name, '^(.*(([^a-df-z]|^)shop|shopping).*)$') THEN 'Organic Shopping'
            WHEN REGEXP_CONTAINS(traffic_source.source, 'badoo|facebook|fb|instagram|linkedin|pinterest|tiktok|twitter|whatsapp') OR traffic_source.medium IN ('social', 'social-network', 'social-media', 'sm', 'social network', 'social media') THEN 'Organic Social'
            WHEN REGEXP_CONTAINS(traffic_source.source, 'dailymotion|disneyplus|netflix|youtube|vimeo|twitch|vimeo|youtube') OR REGEXP_CONTAINS(traffic_source.medium, '^(.*video.*)$') THEN 'Organic Video'
            WHEN REGEXP_CONTAINS(traffic_source.source, 'baidu|bing|duckduckgo|ecosia|google|yahoo|yandex') OR traffic_source.medium = 'organic' THEN 'Organic Search'
            WHEN traffic_source.medium IN ('referral', 'app', 'link') THEN 'Referral'
            WHEN REGEXP_CONTAINS(traffic_source.source, 'email|e-mail|e_mail|e mail') OR REGEXP_CONTAINS(traffic_source.medium, 'email|e-mail|e_mail|e mail') THEN 'Email'
            WHEN traffic_source.medium = 'affiliate' THEN 'Affiliates'
            WHEN traffic_source.medium = 'audio' THEN 'Audio'
            WHEN traffic_source.source = 'sms' OR traffic_source.medium = 'sms' THEN 'SMS'
            WHEN traffic_source.medium LIKE '%push' OR REGEXP_CONTAINS(traffic_source.medium, 'mobile|notification') OR traffic_source.source = 'firebase' THEN 'mobile push notifications'
            ELSE 'Unassigned'
          END`;
      } else {
        return dimension;
      }
    });

    // Construct the metric fields (comma-separated)
    const metricFields = metric.map((m) => metricAggregations[m]).join(", ");

    const dimensionFields = modifiedDimensions.join(", ");

    // Filter for the last 30 minutes
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000); // 30 minutes ago
    const formattedTime = Math.floor(thirtyMinutesAgo.getTime() / 1000); // Convert to seconds

    const query = `
      SELECT ${dimensionFields}, ${metricFields} FROM \`${projectId}.${datasetId}.${tableId}_*\` GROUP BY ${dimensions
      .map((_, index) => index + 1)
      .join(", ")}${
      dimensions.includes("channelGroup")
        ? `, ${modifiedDimensions.length}`
        : ""
    }`;

    // const query = `
    // SELECT ${dimensionFields}, ${metricFields}
    // FROM \`${projectId}.${datasetId}.${tableId}_*\`
    // WHERE TIMESTAMP_SECONDS(event_timestamp) >= TIMESTAMP_SECONDS(${formattedTime})
    // GROUP BY ${dimensions.map((_, index) => index + 1).join(", ")}${
    //   dimensions.includes("channelGroup")
    //     ? `, ${modifiedDimensions.length}`
    //     : ""
    // }`;

    console.log(query);

    const [rows] = await bigqueryClient.query(query);

    // If "session source/medium" is selected, adjust the header name in the results
    if (dimensions.includes("sessionSourceMedium")) {
      const modifiedRows = rows.map((row) => {
        const newRow = { ...row };
        newRow["session source/medium"] = row.session_source_medium;
        delete newRow.session_source_medium;
        return newRow;
      });
      res.json(modifiedRows);
    } else {
      res.json(rows);
    }
  } catch (error) {
    console.error("Error querying BigQuery:", error);
    res.status(500).json({ error: "Failed to query BigQuery" });
  }
});

const refreshAllReports = async () => {
  try {
    const liveReportsSnapshot = await db.collection("Live Report").get();

    const refreshPromises = liveReportsSnapshot.docs.map(async (doc) => {
      const reportData = doc.data();
      const reportId = doc.id;
      const resultId = reportData.resultId; // Use this directly as the collection ID

      // Ensure resultId is valid
      if (!resultId) {
        console.error(`No resultId found for report: ${reportId}`);
        return;
      }

      // Check if refresh is needed
      const savedTime = new Date(reportData.dateLastRun);
      const currentTime = new Date();
      const refreshTimeInMinutes = parseInt(
        reportData.refreshTime.split(" ")[0],
        10
      );
      const timeDifference = (currentTime - savedTime) / (1000 * 60);

      if (timeDifference >= refreshTimeInMinutes) {
        try {
          // Fetch data from BigQuery
          const projectId = "testingtracker-2d31c";
          const datasetId = "analytics_189847663";
          const tableId = "events_intraday";
          const serviceAccount = JSON.stringify({
            type: "service_account",
            project_id: "testingtracker-2d31c",
            private_key_id: "7660c853b94e330e24656af6c1412f2097c20cea",
            private_key:
              "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCvNcryY+wfLP1E\n/Kjo+uGJyQcf5ztCzS7J5i8foWMfdrzJteQpzAVjh9XHpl0vokwP5sG7CtIj10Wv\nanCahAsyB7JizgctMCAIEEZEn2Fg29m4qTt+KbezjqjR7hC1/xRyv1xL/KjdzbXe\n6ZGVOTT2kwn3mKWMHAHW16+LXYgDmEW1GU7R3d/i+r6tW2qBRzHJNMYj0JYFJ9Xt\nfRXlSGrrV1MDJKUa0aXoWuqXda6cGOJHx0DXFyTNDJqwU4f9/MCzauL2XQnafuD+\n8YiHFgucJBvZ0JGRyDQtBfjCdmxznUs+xA/hq5lhSktl6JBGZWFbiY7psGtMUHXt\nHarmkQ4FAgMBAAECggEAFHyWuVbjshWBm8JrQaqsGn9N/PX9oOb69JKcqfcl7vTk\nSDWjcxuu+Z9VaN3UAZDZkfZqaqNuRNCUDlnExtxvrq7ltdXfUvJQnIDCpp14Nmoe\ngBARq8PW/gDNTpamj5E+49fqQ9xMJns6K9Flu2wP/FDfFntbyBEySdu4Y/RQxhKj\nI5IlwXsvXVpZrhCmtkh2zQ9e/vDxR70zMXLxBchGjC1CTM3KIOFiNEnLQZvZR45g\niV4vIf17mkCr+kw51zaibyEW8SnKu4/uaD8GNwenqem0zRp7VhLjuuPRZODcYI5K\nHI7cHTDIPKPUgegark8QU/SVKrCyhJwQhQpeMfG1YQKBgQDtKizVIhggB3pfmgIH\nF7kBEh/9SGVaTEHF/mpPNdEnN2zATkp5u/rgOlGu3TcZYZ7lfpm8GQosdqz9ChbA\nSzJ54V4Xr1NYGGArZ08LlBP4NZnYCdjjlCTZ5RWuvkZMwHNV85FMYMjZyXXDXVDF\nLRnfZt/0nouGiMTjeQ8p53P2bQKBgQC9IALHziRDh+0LT0VRaHJ1net1Om5mSzTf\nTfqbXYqQFxNY8XM13xKI9NN/B5y6dsnCzKDKUu0lg0wQmta3WPm6DNRMygDYTGdn\nlJSKthPb00S4cYyPq/uwJSSyFxaGeurLzpcQNHQOSVqwqmW6yEHmAoeOfdxkkeHs\n8z3vMl0W+QKBgQC4phqLwmTIIypa3pxviz/GHqd7Wu9WU4LuNXvtuffisZthSlNf\n3kSgaaeJHsC0aTX+dggZ0+EA51EeHcnC44kkLZxFkoKwVyIhCOkZGaxGluz1sA0G\neyQJ5ftwtsIjJb9mjyF0NvKJ5fljJvco3UmEjyMU4I+/KiMo++sbdBHsLQKBgCSB\nS0gZ6DIIyJ6IPI8MJBvD0bEdCDZCigAYYykeEyLg8WEXqe9aEY/SAgjhBUWQrD0n\nllm3TAMTptkFqjBVwk5BL7FqxGL7zHHX4hwsLQUfcIJRmJoazkgfw0eE4Vov26Zf\nSBVeqpAfZJv5KA23ndCx6Ex+ys22wu8jvG6xP/qxAoGAJY7Wq/972rL+XQocETlC\n6aNf9fYuxJd52KgqQN9BXNQ/bDO+N33MXO8Dpx4fcIKRWsqK+8X4YoAWJaO0Y+Sy\nNTDjPe4w6U4EwooSs8fqNdfG6PqQT4ysJhDT/LFRoNxF5dxaBdsu/ENOyJ43OjEq\nJ4l9FZRna0Fngys+X3MEsLc=\n-----END PRIVATE KEY-----\n",
            client_email:
              "react-app-testing@testingtracker-2d31c.iam.gserviceaccount.com",
            client_id: "116921835868793453998",
            auth_uri: "https://accounts.google.com/o/oauth2/auth",
            token_uri: "https://oauth2.googleapis.com/token",
            auth_provider_x509_cert_url:
              "https://www.googleapis.com/oauth2/v1/certs",
            client_x509_cert_url:
              "https://www.googleapis.com/robot/v1/metadata/x509/react-app-testing%40testingtracker-2d31c.iam.gserviceaccount.com",
            universe_domain: "googleapis.com",
          });

          const bqResponse = await fetch(
            "http://localhost:3001/query-bigquery",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                dimensions: reportData.dimensions,
                metric: reportData.metric,
                refreshTime: reportData.refreshTime,
                projectId,
                datasetId,
                tableId,
                serviceAccount,
              }),
            }
          );

          const bigqueryData = await bqResponse.json();
          const currentDateTime = new Date().toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          });

          // Clear the old results
          const resultCollectionRef = db.collection(resultId);
          const resultCollectionSnapshot = await resultCollectionRef.get();
          const deletePromises = resultCollectionSnapshot.docs.map((rowDoc) =>
            rowDoc.ref.delete()
          );
          await Promise.all(deletePromises);

          // Save new rows in the collection
          for (const row of bigqueryData) {
            await resultCollectionRef.add(row);
          }

          // Update "Live Report" with new dateLastRun
          await doc.ref.set({ dateLastRun: currentDateTime }, { merge: true });
        } catch (error) {
          console.error(`Error refreshing report ${reportId}:`, error);
        }
      }
    });

    await Promise.all(refreshPromises);
    console.log("All reports refreshed (if needed)");
  } catch (error) {
    console.error("Error refreshing reports:", error);
  }
};

// Start the refresh interval (e.g., every 1 minute)
// setInterval(refreshAllReports, 1 * 60 * 1000);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
