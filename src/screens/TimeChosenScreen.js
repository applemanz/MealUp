import React from 'react';
import { View, Image, Text, TouchableHighlight, SectionList, StyleSheet, ActivityIndicator } from 'react-native';
import {ListItem} from 'react-native-elements';
import firebase from "../config/firebase";
import { userName, userID } from '../screens/SignInScreen';

const db = firebase.firestore();

export default class TimeChosenScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};
    return {
      title: 'Choose a Friend',
    };
  };

  state = {}

  async componentDidMount() {
    const { params } = this.props.navigation.state;
    await this.getFreeFriends(params.day,params.index,params.length)
  }

  getFreeFriends = (day,index,length) => {
    free = new Object()
    db.collection("users").doc(userID).collection('FreeFriends').doc(day).get().then(doc => {
      if (!doc.exists) {
        this.setState({free:free})
        return
      }
      if (length == 0.5) {
        temp = new Object()
        temp = doc.data().Freefriends[index]
        for (id in temp) {
          if (temp[id] === true)
            free[id] = temp[id]
        }
      }
      else if (length == 1) {
        temp = new Object()
        temp = doc.data().Freefriends[index]
        for (id in temp) {
          if (temp[id] === true && doc.data().Freefriends[index + 1][id] === true)
            free[id] = temp[id]
        }
      }

      db.collection("users").doc(userID).collection('Friends').get().then((querySnapShot) => {
        console.log("BEFORE", free)
        freeCanView = new Object()
        querySnapShot.forEach(doc => {

          // check if your friend blocks you
          if (doc.id in free)
            if (doc.data().CanViewFriend)
              freeCanView[doc.id] = doc.data().Name
        })

        console.log("AFTER", freeCanView)
        this.setState({free:freeCanView})
      })
    })
  }

  render() {
    const { params } = this.props.navigation.state;
    // console.log(this.state.free)
    if (this.state.free) {
      freeLen = Object.keys(this.state.free).length
      console.log(freeLen)
      if (freeLen === 0) {
        return(
          <View>
        <SectionList
          // in previous version no need object.keys
          sections={[]}
          ListFooterComponent={<Text style={{textAlign: 'center', padding: 30}}>Your friends are unavailable for a meal at the selected time :(</Text>}
          renderItem={({item}) =>
          <ListItem
            title = {this.state.free[item]}
            />}
          renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
          keyExtractor={(item, index) => index}
        />
      </View>
          )
      } else {
      return (
      <View>
        <SectionList
          // in previous version no need object.keys
          sections={[{title: "Friends", data: Object.keys(this.state.free)}]}
          renderItem={({item}) =>
          <ListItem
            // title={item['name']}
            title = {this.state.free[item]}
            roundAvatar
            avatar={{uri:`http://graph.facebook.com/${item}/picture?type=normal`}}
            onPress={() => this.props.navigation.navigate('FinalRequest', {
              // name: item['name'],
              // id: item['id'],
              // url: `http://graph.facebook.com/${item['id']}/picture?type=square`,
              name: this.state.free[item],
              members: {[item]: this.state.free[item]},
              url: `http://graph.facebook.com/${item}/picture?type=square`,
              dateobj: params.dateobj,
              time: params.time,
              length: params.length,
            })}
          />}
          renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
          keyExtractor={(item, index) => index}
        />
      </View>
      )}
    } else {
      return(
        <View>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    }
  }

const styles = StyleSheet.create({
  container: {
   flex: 1,
   paddingTop: 22
  },
  sectionHeader: {
    paddingTop: 2,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 2,
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(247,247,247,1.0)',
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
})

// getTime = (id, day, time, length) => {
//   return new Promise(resolve => {
//     j = false;
//     db.collection("users").doc(id).collection('Freetime').doc(day).get().then((doc) => {
//       if (doc.exists) {
//         if (length == 0.5)
//           j = doc.data().Freetime[time]
//         else if (length == 1)
//           j = doc.data().Freetime[time] && doc.data().Freetime[time + 1]
//       }

//       resolve(j);
//     });
//   })
// }

// async getFreeFriend(day, time, length, id, name) {
//   free = this.state.free ? this.state.free.slice() : []
//   isfree = await this.getTime(id, day, time, length)
//   if (isfree) free.push({name:name, id:id})
//   this.setState({free:free})
// }

// async getFreeFriends(day, time, length) {
//   myFriends = await this.getFriends()
// //  free = []
//   for (fd in myFriends) {
//   //  isfree = await this.getTime(fd, day, time, length)
//   //  if (isfree) free.push({name:myFriends[fd], id:fd})
//     await this.getFreeFriend(day, time, length, fd, myFriends[fd])
//   }
//   // this.setState({free:free});
// }

// getFriends = () => {
//   return new Promise(resolve => {
//     names = new Object()
//     db.collection("users").doc(userID).collection('Friends').get().then((querySnapshot) => {
//         querySnapshot.forEach((doc) => {
//           names[doc.id] = doc.data().Name
//         });
//       resolve(names);
//     });
//   })
// }

// getCanViewFreeFriends = () => {
//   db.collection("users").doc(userID).collection('Friends').get().then((querySnapShot) => {
//     console.log("HI", this.state.free)
//     free = new Object()
//     for (id in this.state.free) {
//       console.log("HELLO")
//       console.log(id, this.state.free[id], querySnapShot[id].data().CanViewFriend)
//       if (querySnapShot[id].data().CanViewFriend) {
//         free[id] = this.state.free[id]
//       }
//     }
//     this.setState({free:free})
//     console.log(free)
//   })
// }



// renderBottom() {
//   const { params } = this.props.navigation.state;
//   // console.log(this.state.free)
//   if (this.state.free)
//     return <SectionList
//       // in previous version no need object.keys
//       sections={[{title: "Friends", data: Object.keys(this.state.free)}]}
//       renderItem={({item}) =>
//       <ListItem
//         // title={item['name']}
//         title = {this.state.free[item]}
//         onPress={() => this.props.navigation.navigate('FinalRequest', {
//           // name: item['name'],
//           // id: item['id'],
//           // url: `http://graph.facebook.com/${item['id']}/picture?type=square`,
//           name: this.state.free[item],
//           id: item,
//           url: `http://graph.facebook.com/${item}/picture?type=square`,
//           dateobj: params.dateobj,
//           time: params.time,
//           length: params.length,
//         })}
//       />}
//       renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
//       keyExtractor={(item, index) => index}
//     />
//   return(
//     <View>
//       <ActivityIndicator size="large" color="#0000ff" />
//     </View>
//   )
// }
