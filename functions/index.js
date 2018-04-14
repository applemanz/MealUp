const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);


// Listen for changes in all documents and all subcollections
exports.useMultipleWildcards = functions.firestore
    .document('users/{userId}/Freetime/{dayOfWeek}')
    .onUpdate((change, context) => {
      context.params.userId
      context.params.dayOfWeek
      // arrays
      const prevFreeTime = change.before.data().Freetime
      const newFreeTime = change.after.data().Freetime

      var index
      var updateAsFree
      for (i in prevFreeTime) {
        if (prevFreeTime[i] === 0 && newFreeTime[i] === 1) {
          index = i
          updateAsFree = true
        }
        if (prevFreeTime[i] === 1 && newFreeTime[i] === 0) {
          index = i
          updateAsFree = false
        }
        if (prevFreeTime[i] === 1 && newFreeTime[i] === 2) {
          index = i
          updateAsFree = false
        }
        if (prevFreeTime[i] === 2 && newFreeTime[i] === 1) {
          index = i
          updateAsFree = true
        }
      }


      for (key of Object.keys(friends)) {
        let temp = key;
        fdRef = db.collection("users").doc(temp).collection('FreeFriends').doc(this.props.dayOfWeek);
        fdRef.get().then(doc => {
          if (doc.exists) {
            // console.log("EXISTS",friends[temp],this.props.dayOfWeek)
            freeFriends = this.state.freeFriends
            freeFriends[temp] = doc.data().Freefriends;
            this.setState({freeFriends:freeFriends})
            }
            else {
             // console.log("Does not exist")
            }
          })
        }

        for (friendID of Object.keys(this.state.freeFriends)) {
          //console.log(friendID)
          fdRef = db.collection("users").doc(friendID).collection('FreeFriends').doc(this.props.dayOfWeek)
          console.log(this.state.freeFriends[friendID])
          fdRef.set({
            Freefriends: this.state.freeFriends[friendID]
          }, {merge: true});
        }



      if (updateAsFree) {

      } else {

      }
    });


// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.addMessage = functions.https.onRequest((req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into the Realtime Database using the Firebase Admin SDK.
  return admin.database().ref('/messages').push({original: original}).then((snapshot) => {
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    return res.redirect(303, snapshot.ref);
  });
});

// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
exports.makeUppercase = functions.database.ref('/messages/{pushId}/original').onWrite((event) => {
  // Grab the current value of what was written to the Realtime Database.
  const original = event.data.val();
  console.log('Uppercasing', event.params.pushId, original);
  const uppercase = original.toUpperCase();
  // You must return a Promise when performing asynchronous tasks inside a Functions such as
  // writing to the Firebase Realtime Database.
  // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
  return event.data.ref.parent.child('uppercase').set(uppercase);
});
