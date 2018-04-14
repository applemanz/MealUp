const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();


// Listen for changes in all documents and all subcollections
exports.updateFreeFriends = functions.firestore
    .document('users/{userId}/Freetime/{dayOfWeek}')
    .onUpdate((change, context) => {

      const prevFreeTime = change.before.data().Freetime
      const newFreeTime = change.after.data().Freetime
      console.log(prevFreeTime)
      console.log(newFreeTime)

      const userID = context.params.userId
      const dayOfWeek = context.params.dayOfWeek
      console.log(userID)
      console.log(dayOfWeek)
      // arrays


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

      const userDocRef = admin.firestore().collection("users").doc(userID).collection('Friends')

      return userDocRef.get().then((querySnapshot)=>{
        friends = []
        querySnapshot.forEach((doc) => {
          friends.push(doc.id)
        })
        promises = []
        for (friendID of friends) {
          let friendRef = admin.firestore().collection('users').doc(friendID).collection('NewFreeFriends').doc(dayOfWeek)
          let newRef = "Freefriends" + "." + index + "." + userID
          let foo = new Object()
          foo[newRef] = updateAsFree
          promises.push(friendRef.update(foo))
        }
        return Promise.all(promises)
      })
    })


exports.initializeFreeFriends = functions.firestore
  .document('users/{userId}/Freetime/{dayOfWeek}')
  .onCreate((snap, context) => {

    const userID = context.params.userId
    const dayOfWeek = context.params.dayOfWeek

    const userDocRef = admin.firestore().collection("users").doc(userID).collection('Friends')

    return userDocRef.get().then((querySnapshot)=>{
      friends = []
      querySnapshot.forEach((doc) => {
        friends.push(doc.id)
      })
      promises = []
      for (friendID of friends) {
        let friendRef = admin.firestore().collection('users').doc(friendID).collection('NewFreeFriends').doc(dayOfWeek)
        let foo = new Object()
        for (i=0; i<25; i++) {
          let newRef = "Freefriends" + "." + i + "." + userID
          foo[newRef] = false
        }
        promises.push(friendRef.update(foo))
      }
      return Promise.all(promises)
    })
  })
