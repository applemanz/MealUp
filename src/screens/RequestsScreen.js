import React from 'react';
import { View, Button, Text, FlatList, Modal, TouchableHighlight, Image } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import { ListItem, ButtonGroup } from 'react-native-elements';
import HeaderButtons from 'react-navigation-header-buttons'
import Icon from 'react-native-vector-icons/Ionicons';
import { Ionicons } from '@expo/vector-icons';
import ScrollableTabView, {DefaultTabBar, } from 'react-native-scrollable-tab-view';
import { userName, userID } from '../screens/SignInScreen';
import firebase from "../config/firebase";

const db = firebase.firestore();

const data_flip = {'7:30 AM': 0, '8:00 AM': 1, '8:30 AM': 2, '9:00 AM': 3, '9:30 AM': 4, '10:00 AM': 5, '10:30 AM': 6,
'11:00 AM': 7, '11:30 AM': 8, '12:00 PM': 9, '12:30 PM': 10, '1:00 PM': 11, '1:30 PM': 12, '2:00 PM': 13, '2:30 PM': 14,
'3:00 PM': 15, '3:30 PM': 16, '4:00 PM': 17, '4:30 PM': 18, '5:00 PM': 19, '5:30 PM': 20, '6:00 PM': 21, '6:30 PM': 22,
'7:00 PM': 23, '7:30 PM': 24}
const weekdays = [
{key:0, day:'Sunday'}, {key:1, day:'Monday'}, {key:2, day:'Tuesday'}, {key:3, day:'Wednesday'}, {key:4, day:'Thursday'},
{key:5, day:'Friday'}, {key:6, day:'Saturday'}
]

export default class RequestsScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
      const params = navigation.state.params || {};
      return {
        title: 'Requests',
        headerRight: (
          <HeaderButtons IconComponent={Ionicons} iconSize={23} color="white">
            <HeaderButtons.Item title="add" iconName="md-add-circle" onPress={params.showModal} />
          </HeaderButtons>
        ),
      };
    };

  componentWillMount() {
    this.props.navigation.setParams({ showModal: this.showModal });
  }

  state = {modalVisible: false, index: 1, sentRequests: [], receivedRequests: [], respondVisible: false, curUser: {}, undoVisible: false,
  refreshingR: false, refreshingS: false};


  showModal = () => {
    this.setState({modalVisible: true})
  }

  componentDidMount() {
    db.collection("users").doc(userID).collection('Sent Requests').onSnapshot((querySnapshot) => {
      requestS = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().DateTime >= new Date()) {
          requestS.push({
            FriendName: doc.data().FriendName,
            url:`http://graph.facebook.com/${doc.data().FriendID}/picture?type=large`,
            FriendID: doc.data().FriendID,
            DateTime: doc.data().DateTime,
            Location: doc.data().Location,
            docID: doc.id,
            Length: doc.data().Length,
            TimeString: doc.data().TimeString
          })
        } else {
          console.log("REQUEST HAS PASSED: " + doc.data().DateTime);
          db.collection("users").doc(userID).collection('Sent Requests').doc(doc.id).delete().then(() => {
            console.log("Document successfully deleted!");
            db.collection("users").doc(doc.data().FriendID).collection('Received Requests').doc(doc.id).delete()
          }).catch(function(error) {
            console.error("Error removing document: ", error);
          });
        }
      });
      requestS.sort(function(a, b) {
        a = a.DateTime;
        b = b.DateTime;
        return a>b ? 1 : a<b ? -1 : 0;
      });
        this.setState({sentRequests: requestS});
    });
    db.collection("users").doc(userID).collection('Received Requests').onSnapshot((querySnapshot) => {
      requestR = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().DateTime >= new Date()) {
          requestR.push({
            FriendName: doc.data().FriendName,
            url:`http://graph.facebook.com/${doc.data().FriendID}/picture?type=large`,
            FriendID: doc.data().FriendID,
            DateTime: doc.data().DateTime,
            Location: doc.data().Location,
            docID: doc.id,
            Length: doc.data().Length,
            TimeString: doc.data().TimeString
          })
        } else {
          // console.log("REQUEST HAS PASSED: " + doc.data().DateTime);
          db.collection("users").doc(userID).collection('Received Requests').doc(doc.id).delete().then(() => {
            console.log("Document successfully deleted!");
            db.collection("users").doc(doc.data().FriendID).collection('Sent Requests').doc(doc.id).delete()
          }).catch(function(error) {
            console.error("Error removing document: ", error);
          });
        }
      });
      requestR.sort(function(a, b) {
        a = a.DateTime;
        b = b.DateTime;
        return a>b ? 1 : a<b ? -1 : 0;
      });
        this.setState({receivedRequests: requestR});
    });
    this.props.navigation.addListener('willFocus', ()=>{
      this.refreshReceived()
      this.refreshSent()
    });
  }

  RequestByFriend = () => {
    this.setState({modalVisible: false});
    this.props.navigation.navigate('RequestByFriend');
  }

  RequestByTime = () => {
    this.setState({modalVisible: false});
    this.props.navigation.navigate('RequestByTime');
  }

  // renderItem = ({item, index}) => {
  //   return <ListItem key={item.key} title={item.key}/>;
  // }

  renderSentRequest = ({item, index}) => {
    return <ListItem
    key={index}
    roundAvatar
    title={item.FriendName}
    subtitle={item.DateTime.toDateString().substring(0,10) + " " + item.TimeString + " at " + item.Location}
    subtitleNumberOfLines={2}
    avatar={{uri:item.url}}
    onPress={() => this._onPressSent(item)}
    />;
  }

  renderReceivedRequest = ({item, index}) => {
    return <ListItem
    key={index}
    roundAvatar
    title={item.FriendName}
    subtitle={item.DateTime.toDateString().substring(0,10) + " " + item.TimeString + " at " + item.Location}
    subtitleNumberOfLines={2}
    avatar={{uri:item.url}}
    onPress={() => this._onPressReceived(item)}
    />;
  }

  _keyExtractor = (item, index) => item.docID;

  _onPressSent = (item) => {
    this.setState({
      undoVisible: true,
      curUser: {
        FriendName: item.FriendName,
        FriendID: item.FriendID,
        TimeString: item.TimeString,
        Location: item.Location,
        Length: item.Length,
        docID: item.docID,
        DateTime: item.DateTime,
        dateobj: item.DateTime.toDateString(),
        displayDate: item.DateTime.toDateString().substring(0,10)}});
  }
  // item.DateTime.toDateString() + " " + (item.DateTime.getHours() % 12 || 12) + ":" + ("0" + item.DateTime.getMinutes()).slice(-2),

  _onPressReceived = (item) => {
    this.setState({
      respondVisible: true,
      curUser: {
        FriendName: item.FriendName,
        FriendID: item.FriendID,
        TimeString: item.TimeString,
        Location: item.Location,
        docID: item.docID,
        Length: item.Length,
        DateTime: item.DateTime,
        dateobj: item.DateTime.toDateString(),
        displayDate: item.DateTime.toDateString().substring(0,10)}});
  }
  //item.DateTime.toDateString() + " " + (item.DateTime.getHours() % 12 || 12) + ":" + ("0" + item.DateTime.getMinutes()).slice(-2),

  acceptRequest = () => {
    console.log(this.state.curUser.docID)
    data = new Object()
    data['DateTime'] = this.state.curUser.DateTime
    data['FriendID'] = this.state.curUser.FriendID
    data['FriendName'] = this.state.curUser.FriendName
    data['Length'] = this.state.curUser.Length
    data['Location'] = this.state.curUser.Location
    data['TimeString'] = this.state.curUser.TimeString

    day = weekdays[data['DateTime'].getDay()].day
    amPM = data['DateTime'].getHours() >= 12 ? "PM" : "AM"
    hours = (data['DateTime'].getHours() % 12 || 12) + ":" + ("0" + data['DateTime'].getMinutes()).slice(-2) + " " + amPM
    index = data_flip[hours]

    // update freetimes
    freetimeRef = db.collection("users").doc(userID).collection('Freetime').doc(day);
    freetimeRef.get().then(function(doc) {
      freetimeData = doc.data();
      freetimeData['Freetime'][index] = 2
      if (data['Length'] === 1) {
        freetimeData['Freetime'][index+1] = 2
      }
      // console.log("my data", freetimeData)
    freetimeRef.set(freetimeData).then(() => {
      console.log("My Document updated");
      })
      .catch(function(error) {
        console.error("Error updating", error);
      });
    })

    freetimeRef_other = db.collection("users").doc(data['FriendID']).collection('Freetime').doc(day);
    freetimeRef_other.get().then(function(doc) {
      freetimeData_other = doc.data();
      freetimeData_other['Freetime'][index] = 2
      if (data['Length'] === 1) {
        freetimeData_other['Freetime'][index+1] = 2
      }
      // console.log(freetimeData_other)
    freetimeRef_other.set(freetimeData_other).then(() => {
      console.log("Document updated");
      })
      .catch(function(error) {
        console.error("Error updating", error);
      });
    })


    // update freefriends for acceptor
    friendsRef = db.collection("users").doc(userID).collection('Friends');
    friendsRef.get().then((querySnapshot) => {
      friends = [];
      querySnapshot.forEach((doc) => {
        friends.push(doc.id)
      })

      console.log("friends", friends)

      for (let friend of friends) {
        thisday = weekdays[data['DateTime'].getDay()].day;
        let freefriendsRef = db.collection("users").doc(friend).collection('NewFreeFriends').doc(thisday);
        newRef = "Freefriends" + "." + index + "." + userID
        foo = new Object();
        foo[newRef] = false;
        freefriendsRef.update(foo);
      }
    })

    // update freefriends for other person if not already updated
    friendsRef2 = db.collection("users").doc(data['FriendID']).collection('Friends');
    friendsRef2.get().then((querySnapshot) => {
      friends2 = [];
      querySnapshot.forEach((doc) => {
        friends2.push(doc.id)
      })
      console.log("friends2", friends2)

      for (let friend of friends2) {
        thisday = weekdays[data['DateTime'].getDay()].day;
        let freefriendsRef = db.collection("users").doc(friend).collection('NewFreeFriends').doc(thisday);
        newRef = "Freefriends" + "." + index + "." + data['FriendID']
        foo = new Object();
        foo[newRef] = false;
        freefriendsRef.update(foo);
      }
    })

    // increment number of meals between two users
    friendRef = db.collection("users").doc(userID).collection('Friends').doc(data['FriendID'])
    friendRef.get().then(function(doc) {
      friendData = doc.data();
      if (!friendData['numOfMeals']) {
        friendRef.set({
          numOfMeals: 1
        }, {merge: true})
      } else {
        friendData['numOfMeals']++
        friendRef.update(friendData)
      }
    })

    friendRef_toMe = db.collection("users").doc(data['FriendID']).collection('Friends').doc(userID)
    friendRef_toMe.get().then(function(doc) {
    friendData_toMe = doc.data();
      if (!friendData_toMe['numOfMeals']) {
        friendRef_toMe.set({
          numOfMeals: 1
         }, {merge: true})
      } else {
        friendData_toMe['numOfMeals']++
        friendRef_toMe.update(friendData_toMe)
      }
    })

    // put document in meals
    db.collection("users").doc(userID).collection('Meals').add(data)
        .then((docRef) => {
            console.log("Document written with ID: ", docRef.id);
            data['FriendName'] = userName
            data['FriendID'] = userID
            db.collection("users").doc(this.state.curUser.FriendID).collection('Meals').doc(docRef.id).set(data)
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
    // remove document from requests
    db.collection("users").doc(userID).collection('Received Requests').doc(this.state.curUser.docID).delete().then(() => {
      console.log("Document successfully deleted!");
      db.collection("users").doc(this.state.curUser.FriendID).collection('Sent Requests').doc(this.state.curUser.docID).delete()
    }).catch(function(error) {
      console.error("Error removing document: ", error);
    });
    this.setState({respondVisible: false})
  }

  declineRequest = () => {
    db.collection("users").doc(userID).collection('Received Requests').doc(this.state.curUser.docID).delete().then(() => {
      console.log("Document successfully deleted!");
      db.collection("users").doc(this.state.curUser.id).collection('Sent Requests').doc(this.state.curUser.docID).delete()
    }).catch(function(error) {
      console.error("Error removing document: ", error);
    });
    this.setState({respondVisible: false})
  }

  cancelRequest = () => {
    db.collection("users").doc(userID).collection('Sent Requests').doc(this.state.curUser.docID).delete().then(() => {
      console.log("Document successfully deleted!");
      db.collection("users").doc(this.state.curUser.FriendID).collection('Received Requests').doc(this.state.curUser.docID).delete()
    }).catch(function(error) {
      console.error("Error removing document: ", error);
    });
    this.setState({undoVisible: false})
  }

  rescheduleRequest = () => {
    this.setState({respondVisible: false})
    this.props.navigation.navigate('FriendChosen', {
      sent: false,
      reschedule: this.state.curUser.docID,
      name: this.state.curUser.FriendName,
      id: this.state.curUser.FriendID,
      url: `http://graph.facebook.com/${this.state.curUser.FriendID}/picture?type=large`
    });
  }

  changeLocation = () => {
    this.setState({respondVisible: false});
    member = new Object();
    member[this.state.curUser.FriendID] = this.state.curUser.FriendName;
    this.props.navigation.navigate('FinalRequest', {
      sent: false,
      reschedule: this.state.curUser.docID,
      name: this.state.curUser.FriendName,
      members: member,
      dateobj: this.state.curUser.dateobj,
      time: this.state.curUser.TimeString,
      length: this.state.curUser.Length,
    });
  }

  changeSentLocation = () => {
    this.setState({undoVisible: false});
    member = new Object();
    member[this.state.curUser.FriendID] = this.state.curUser.FriendName;
    this.props.navigation.navigate('FinalRequest', {
      sent: true,
      reschedule: this.state.curUser.docID,
      name: this.state.curUser.FriendName,
      members: member,
      dateobj: this.state.curUser.dateobj,
      time: this.state.curUser.TimeString,
      length: this.state.curUser.Length,
    });
  }

  rescheduleSentRequest = () => {
    this.setState({undoVisible: false})
    this.props.navigation.navigate('FriendChosen', {
      sent: true,
      reschedule: this.state.curUser.docID,
      name: this.state.curUser.FriendName,
      id: this.state.curUser.FriendID,
      url: `http://graph.facebook.com/${this.state.curUser.FriendID}/picture?type=large`
    });
  }
  refreshReceived = () => {
    this.setState({refreshingR: true});
    db.collection("users").doc(userID).collection('Received Requests').onSnapshot((querySnapshot) => {
      requestR = [];
        querySnapshot.forEach((doc) => {
          if (doc.data().DateTime >= new Date()) {
            requestR.push({
              FriendName: doc.data().FriendName,
              url:`http://graph.facebook.com/${doc.data().FriendID}/picture?type=large`,
              FriendID: doc.data().FriendID,
              DateTime: doc.data().DateTime,
              Location: doc.data().Location,
              docID: doc.id,
              Length: doc.data().Length,
              TimeString: doc.data().TimeString
            })
          } else {
            console.log("REQUEST HAS PASSED: " + doc.data().DateTime);
            db.collection("users").doc(userID).collection('Received Requests').doc(doc.id).delete().then(() => {
              console.log("Document successfully deleted!");
              db.collection("users").doc(doc.data().FriendID).collection('Sent Requests').doc(doc.id).delete()
            }).catch(function(error) {
              console.error("Error removing document: ", error);
            });
          }
        });
        requestR.sort(function(a, b) {
          a = a.DateTime;
          b = b.DateTime;
          return a>b ? 1 : a<b ? -1 : 0;
        });
        this.setState({receivedRequests: requestR});
    });
    this.setState({refreshingR: false});
  }

  refreshSent = () => {
    this.setState({refreshingS: true});
    db.collection("users").doc(userID).collection('Sent Requests').onSnapshot((querySnapshot) => {
      requestS = [];
        querySnapshot.forEach((doc) => {
          if (doc.data().DateTime >= new Date()) {
            requestS.push({
              FriendName: doc.data().FriendName,
              url:`http://graph.facebook.com/${doc.data().FriendID}/picture?type=large`,
              FriendID: doc.data().FriendID,
              DateTime: doc.data().DateTime,
              Location: doc.data().Location,
              docID: doc.id,
              Length: doc.data().Length,
              TimeString: doc.data().TimeString
            })
          } else {
            console.log("REQUEST HAS PASSED: " + doc.data().DateTime);
            db.collection("users").doc(userID).collection('Sent Requests').doc(doc.id).delete().then(() => {
              console.log("Document successfully deleted!");
              db.collection("users").doc(doc.data().FriendID).collection('Received Requests').doc(doc.id).delete()
            }).catch(function(error) {
              console.error("Error removing document: ", error);
            });
          }
        });
        requestS.sort(function(a, b) {
          a = a.DateTime;
          b = b.DateTime;
          return a>b ? 1 : a<b ? -1 : 0;
        });
        this.setState({sentRequests: requestS});
    });
    this.setState({refreshingS: false});
  }

  render() {
    return (
      <View style={{flex:1}}>
        <ScrollableTabView
          style={{marginTop: 0}}
          renderTabBar={() => <DefaultTabBar />}
          // onChangeTab = {(i, ref) => {this.setState({onFriends: !this.state.onFriends})}}
          tabBarBackgroundColor = {'#f4511e'}
          tabBarActiveTextColor = {'white'}
          tabBarInactiveTextColor = {'black'}
          tabBarUnderlineStyle = {{backgroundColor:'white'}}
        >
          <FlatList
            refreshing={this.state.refreshingR}
            onRefresh={this.refreshReceived}
            tabLabel='Received'
            keyExtractor={this._keyExtractor}
            data={this.state.receivedRequests}
            renderItem={this.renderReceivedRequest}
          />
          <FlatList
            refreshing={this.state.refreshingS}
            onRefresh={this.refreshSent}
            tabLabel='Sent'
            keyExtractor={this._keyExtractor}
            data={this.state.sentRequests}
            renderItem={this.renderSentRequest}
          />
        </ScrollableTabView>
          {this.requestModal()}
          {this.respondModal()}
          {this.undoModal()}
      </View>
    );
  }
  requestModal() {
    return <View>
    <Modal onRequestClose={() => this.setState({modalVisible: false})} transparent={true} visible={this.state.modalVisible}>
      <View style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000080'}}>
        <View style={{
          width: 300,
          height: 300,
          backgroundColor: '#fff', padding: 20}}>
          <View style={{padding: 15}}>
            <Button onPress={this.RequestByFriend} title="Request by Friend"/>
          </View>
          <View style={{padding: 15}}>
            <Button onPress = {this.RequestByTime} title="Request by Time"/>
          </View>
          <View style={{padding: 25, alignItems: 'center'}}>
            <TouchableHighlight style={{padding: 10, backgroundColor: "#DDDDDD", borderRadius: 5}}
              onPress={() => this.setState({modalVisible: false})}>
              <Text style={{fontSize: 15, textAlign: 'right'}}>Cancel</Text>
            </TouchableHighlight>
          </View>
        </View>
      </View>
    </Modal>
  </View>;
  }

  undoModal() {
    return <View>
    <Modal onRequestClose={() => this.setState({modalVisible: false})} transparent={true} visible={this.state.undoVisible}>
      <View style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000080'}}>
      <View style={{
        width: 300,
        height: 460,
        backgroundColor: '#fff', padding: 20}}>
        <View style={{alignItems: 'center'}}>
        <View style={{padding: 10}}>
        <Image
          style={{width: 100, height: 100, borderRadius: 50}}
          source={{uri: `http://graph.facebook.com/${this.state.curUser.FriendID}/picture?type=large`}}
        />
        </View>
        <View style={{padding: 10}}>
        <Text>{this.state.curUser.FriendName}</Text>
        </View>
        <View style={{padding: 10}}>
        <Text>{this.state.curUser.displayDate} {this.state.curUser.TimeString} at {this.state.curUser.Location}</Text>
        </View>
        </View>
        <View style={{padding: 10}}>
          <TouchableHighlight style={{padding: 10, backgroundColor: "#d9534f", borderRadius: 5}}
            onPress={this.cancelRequest}>
            <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Cancel Request</Text>
          </TouchableHighlight>
        </View>
        <View style={{padding: 10}}>
          <TouchableHighlight style={{padding: 10, backgroundColor: "#ffbb33", borderRadius: 5}}
            onPress={this.rescheduleSentRequest}>
            <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Reschedule Meal</Text>
          </TouchableHighlight>
        </View>
        <View style={{padding: 10}}>
          <TouchableHighlight style={{padding: 10, backgroundColor: "#5bc0de", borderRadius: 5}}
            onPress={this.changeSentLocation}>
            <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Change Location</Text>
          </TouchableHighlight>
        </View>
        <View style={{padding: 15, alignItems: 'center'}}>
          <TouchableHighlight style={{padding: 10, backgroundColor: "#DDDDDD", borderRadius: 5}}
            onPress={() => this.setState({undoVisible: false})}>
            <Text style={{fontSize: 15, fontWeight: 'bold', textAlign: 'center'}}>Cancel</Text>
          </TouchableHighlight>
        </View>
        </View>
        </View>
    </Modal>
  </View>;
  }

  respondModal() {
    return <View>
    <Modal onRequestClose={() => this.setState({modalVisible: false})} transparent={true} visible={this.state.respondVisible}>
      <View style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000080'}}>
      <View style={{
        width: 300,
        height: 520,
        backgroundColor: '#fff', padding: 20}}>
        <View style={{alignItems: 'center'}}>
        <View style={{padding: 10}}>
        <Image
          style={{width: 100, height: 100, borderRadius: 50}}
          source={{uri: `http://graph.facebook.com/${this.state.curUser.FriendID}/picture?type=large`}}
        />
        </View>
        <View style={{padding: 10}}>
        <Text>{this.state.curUser.FriendName}</Text>
        </View>
        <View style={{padding: 10}}>
        <Text>{this.state.curUser.displayDate} {this.state.curUser.TimeString} at {this.state.curUser.Location}</Text>
        </View>
        </View>
        <View style={{padding: 10}}>
          <TouchableHighlight style={{padding: 10, backgroundColor: "#5cb85c", borderRadius: 5}}
            onPress={this.acceptRequest}>
            <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Accept</Text>
          </TouchableHighlight>
        </View>
        <View style={{padding: 10}}>
          <TouchableHighlight style={{padding: 10, backgroundColor: "#5bc0de", borderRadius: 5}}
            onPress={this.changeLocation}>
            <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Change Location</Text>
          </TouchableHighlight>
        </View>
        <View style={{padding: 10}}>
          <TouchableHighlight style={{padding: 10, backgroundColor: "#ffbb33", borderRadius: 5}}
            onPress={this.rescheduleRequest}>
            <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Reschedule</Text>
          </TouchableHighlight>
        </View>
        <View style={{padding: 10}}>
          <TouchableHighlight style={{padding: 10, backgroundColor: "#d9534f", borderRadius: 5}}
            onPress={this.declineRequest}>
            <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Decline</Text>
          </TouchableHighlight>
        </View>
        <View style={{padding: 15, alignItems: 'center'}}>
          <TouchableHighlight style={{padding: 10, backgroundColor: "#DDDDDD", borderRadius: 5}}
            onPress={() => this.setState({respondVisible: false})}>
            <Text style={{fontSize: 15, fontWeight: 'bold', textAlign: 'center'}}>Cancel</Text>
          </TouchableHighlight>
        </View>
        </View>
        </View>
    </Modal>
  </View>;
}
}
