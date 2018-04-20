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
        for (let friendID of friends) {
          let friendRef = admin.firestore().collection('users').doc(friendID).collection('FreeFriends').doc(dayOfWeek)
          let newRef = "Freefriends" + "." + index + "." + userID
          let foo = new Object()
          foo[newRef] = updateAsFree
          promises.push(friendRef.update(foo))

          return friendRef.get().then((doc) => {
            let friendRef2 = admin.firestore().collection('users').doc(friendID).collection('hasFreeFriends').doc(dayOfWeek)
            let newRef2 = "hasFreefriends" + "." + index + "." + userID
            let foo2 = new Object()
            let hasFreeFriend = false;

            if (updateAsFree) hasFreeFriend = true;
            else {
              for (let friendID2 in doc.data().Freefriends[index]) {
                if (friendID2 === userID) continue;
                if (doc.data().Freefriends[index][friendID2] === true) {
                  hasFreeFriend = true;
                  break;
                }
              }
              foo2[newRef2] = updateAsFree
              promises.push(friendRef2.update(foo2))
            }
            return Promise.all(promises)
          })
        }
        return Promise.all(promises)
      })
    })

exports.findTimeConflicts = functions.firestore
    .document('users/{userID}/Meals/{mealID}')
    .onCreate((snap, context) => {
      const newValue = snap.data();
      const fdID = newValue.FriendID
      const startTime = new Date(newValue.DateTime);
      const endTime = new Date(startTime.getTime() 
      + parseFloat(newValue.Length) * 60 * 60 * 1000);
      console.log(startTime)
      console.log(endTime)
      console.log(fdID)

      const userID = context.params.userID
      const mealID = context.params.mealID
      console.log(userID)
      console.log(mealID)

      const userRef = admin.firestore().collection("users").doc(userID)
      const fdRef = admin.firestore().collection("users").doc(fdID)
      promises = [];

      conflictMeals = [];
      return userRef.collection('Sent Requests').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          let thisMealID = doc.id
          let thisStartTime = new Date(doc.data().DateTime);
          let thisEndTime = new Date(thisStartTime.getTime()
          + parseFloat(doc.data().Length) * 60 * 60 * 1000);
          if (!(thisEndTime < startTime || thisStartTime > endTime))
            conflictMeals.push({type:'Sent Requests',mealID:thisMealID,id:userID})
        })

        return userRef.collection('Received Requests').get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            let thisMealID = doc.id
            let thisStartTime = new Date(doc.data().DateTime);
            let thisEndTime = new Date(thisStartTime.getTime()
            + parseFloat(doc.data().Length) * 60 * 60 * 1000);
            if (!(thisEndTime < startTime || thisStartTime > endTime))
              conflictMeals.push({type:'Received Requests',mealID:thisMealID,id:userID})
          })

          return fdRef.collection('Sent Requests').get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              let thisMealID = doc.id
              let thisStartTime = new Date(doc.data().DateTime);
              let thisEndTime = new Date(thisStartTime.getTime()
              + parseFloat(doc.data().Length) * 60 * 60 * 1000);
              if (!(thisEndTime < startTime || thisStartTime > endTime))
                conflictMeals.push({type:'Sent Requests',mealID:thisMealID,id:fdID})
            })

            return fdRef.collection('Received Requests').get().then((querySnapshot) => {
              querySnapshot.forEach((doc) => {
                let thisMealID = doc.id
                let thisStartTime = new Date(doc.data().DateTime);
                let thisEndTime = new Date(thisStartTime.getTime()
                + parseFloat(doc.data().Length) * 60 * 60 * 1000);
                if (!(thisEndTime < startTime || thisStartTime > endTime))
                  conflictMeals.push({type:'Received Requests',mealID:thisMealID,id:fdID})
              })

        
              let foo = new Object();
              foo['conflict'] = true

              for (let meal of conflictMeals) {
                promises.push(admin.firestore().collection("users").doc(meal.id).collection(meal.type).doc(meal.mealID).update(foo))
                console.log("conflicting meal: ", meal.id, meal.mealID, meal.type)
              }


            return Promise.all(promises)
            })
          })
        })
      })
    })

initializeFreeFriends = functions.firestore
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
