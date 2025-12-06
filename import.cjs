const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const data = require("./firestore_export.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function importCollection(collectionName, docs) {
  for (const id of Object.keys(docs)) {
    await db.collection(collectionName).doc(id).set(docs[id]);
  }
}

(async () => {
  for (const collectionName of Object.keys(data)) {
    await importCollection(collectionName, data[collectionName]);
  }
  console.log("Import completed!");
})();
